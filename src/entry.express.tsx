import { fastify } from './api/server';
import { render } from './entry.ssr';

const port = process.env.PORT || 8080;

fastify.get('/*', async (req, reply) => {
    const result = await render(
        {
            url: req.url,
        },
        { sessionId: req.session?.encryptedSessionId }
    );

    reply.type('text/html').send(result.html);
});

fastify.listen(port, (err, address) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
    fastify.log.info(`server listening on ${address}`);
});
