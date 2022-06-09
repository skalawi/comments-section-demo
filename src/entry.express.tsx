import { join } from 'path';
import { render } from './entry.ssr';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import api from './api/routes';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { Database } from './api/database';

export const fastify = Fastify({
    logger: { prettyPrint: true, level: 'warn' },
});

const db = new Database();

fastify.register(fastifyCookie);
fastify.register(fastifySession, {
    secret: 'a secret with minimum length of 32 characters',
    cookieName: 'sessionId',
    cookie: {
        secure: false,
        maxAge: 1000 * 60 * 10,
    },
});

fastify.addHook('preHandler', (req, reply, next) => {
    if (!req.session.initialized) {
        req.session.userId = db.createUser();
        req.session.initialized = true;
        req.session.save();
        fastify.log.warn(
            `User ${
                db.getCurrentUserData(req.session.userId).name
            } created with ${req.session.sessionId}`
        );
    }
    next();
});

fastify.get('/*', async (req, reply) => {
    const result = await render(
        {
            url: req.url,
        },
        { sessionId: req.session?.encryptedSessionId }
    );

    reply.type('text/html').send(result.html);
});

fastify.register(fastifyStatic, {
    root: join(__dirname, '..', 'dist', 'build'),
    prefix: '/build/',
    maxAge: '1y',
    logLevel: 'trace',
});

fastify.register(fastifyStatic, {
    root: join(__dirname, '..', 'dist'),
    decorateReply: false,
    index: false,
    wildcard: false,
    logLevel: 'trace',
});

fastify.register(api, { prefix: '/api', database: db });

fastify.listen(8080, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
});
