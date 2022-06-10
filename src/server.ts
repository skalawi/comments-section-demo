import { join, dirname } from 'path';
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import api from './api/routes';
import fastifyCookie from '@fastify/cookie';
import fastifySession from '@fastify/session';
import { Database } from './api/database';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const isSsl = (!process.env.SSL_CLIENT_ONLY && process.env.SSL) || false;

const sslOptions = isSsl
    ? {
          https: {
              cert: readFileSync(join(ROOT, 'certs', 'cert.pem')),
              key: readFileSync(join(ROOT, 'certs', 'key.pem')),
              passphrase: 'laslas',
          },
      }
    : {};

export const fastify = Fastify({
    logger: { prettyPrint: true, level: 'warn' },
    ...sslOptions,
});

const db = new Database(ROOT);

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

fastify.register(fastifyStatic, {
    root: join(ROOT, 'dist', 'build'),
    prefix: '/build/',
    maxAge: '1y',
    logLevel: 'trace',
});

fastify.register(fastifyStatic, {
    root: join(ROOT, 'dist'),
    decorateReply: false,
    index: false,
    wildcard: false,
    logLevel: 'trace',
});

fastify.register(api, { prefix: '/api', database: db });
