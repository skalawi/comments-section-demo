import { defineConfig } from 'vite';
import { qwikVite } from '@builder.io/qwik/optimizer';
import { fastifyServer } from './server';

export default defineConfig(() => {
    return {
        resolve: {
            alias: {
                '@': `${__dirname}/src`,
            },
        },
        plugins: [fastifyServer(), qwikVite()],
    };
});
