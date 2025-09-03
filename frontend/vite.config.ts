import { defineConfig } from 'vite'

export default defineConfig({
    base: '',
    esbuild: {
        minifyIdentifiers: false,
    },
    build: {
        minify: 'esbuild'
    }
})
