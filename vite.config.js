import { defineConfig } from 'vite';
import laravel, { refreshPaths } from 'laravel-vite-plugin';

export default defineConfig({
    plugins: [
        laravel({
            input: [
                'resources/js/fontAwesome.2accd57d6d.js',
                'resources/js/simulator.js',
                'resources/js/app.js',
                'resources/css/app.css',
                'node_modules/tw-elements/dist/js/index.min.js'
            ],
            refresh: [
                ...refreshPaths,
                'app/Http/Livewire/**',
            ],
        }),
    ],
});
