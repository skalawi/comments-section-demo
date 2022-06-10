import type { Plugin } from 'vite';
import { fastify } from './src/server';

export const fastifyServer = (): Plugin => {
    return {
        name: 'fastify-server',
        enforce: 'pre',

        configureServer(server) {
            fastify.ready();
            server.middlewares.use((req, res, next) => {
                const url = req.originalUrl!;
                const hasExtension = /\.[\w?=&]+$/.test(url);
                const isViteMod =
                    url.startsWith('/@') || url.includes('?html-proxy');
                const isVitePing = url.includes('__vite_ping');
                const isEnv = url.includes('env.mjs');
                const skipSSR = url.includes('ssr=false');
                const apiCall = url.startsWith('/api');

                if (isViteMod || isVitePing || skipSSR || isEnv) {
                    next();
                } else if (hasExtension || apiCall) {
                    fastify.routing(req, res);
                } else {
                    next();
                }
            });
        },
    };
};
