import type { Plugin } from 'vite';
import Fastify from 'fastify';

const COMMENTS = [
    {
        id: '0',
        rating: 12,
        user: {
            userId: '0',
            image: 'https://via.placeholder.com/100/abf/fff',
            name: 'User User',
        },
        message: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. `,
        date: new Date(2022, 5, 2).toLocaleDateString(),
    },
    {
        id: '1',
        rating: 7,
        user: {
            userId: '0',
            image: 'https://via.placeholder.com/100/09f/fff',
            name: 'User User',
        },
        message: `Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. `,
        date: new Date(2022, 3, 12).toLocaleDateString(),
    },
    {
        id: '2',
        rating: 52,
        user: {
            userId: '0',
            image: 'https://via.placeholder.com/100/123/fff',
            name: 'User User',
        },
        message: `Lorem Ipsum is simply dummy text of the printing and typesetting industry.`,
        date: new Date(2022, 3, 28).toLocaleDateString(),
    },
];

export const fastify = Fastify({ logger: true });

fastify.get('/api', async () => {
    return { hello: 'world' };
});

fastify.get('/api/comments', async () => {
    console.log('gotchas');
    return { comments: COMMENTS };
});

fastify.ready();

export const fastifyServer = (): Plugin => {
    return {
        name: 'fastify-server',
        enforce: 'pre',

        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.originalUrl?.startsWith('/api')) {
                    console.log('hehe');
                    fastify.routing(req, res);
                } else {
                    next();
                }
            });
        },
    };
};
