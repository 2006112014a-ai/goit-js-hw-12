import { defineConfig } from 'vite';
import { glob } from 'glob';
import SortCss from 'postcss-sort-media-queries';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

const projectRoot = fileURLToPath(new URL('.', import.meta.url));
const sourceRoot = resolve(projectRoot, 'src');

export default defineConfig(({ command }) => {
  return {
    // base для GitHub Pages береться з назви репозиторію під час деплою;
    // локально (без GITHUB_REPOSITORY) — '/'
    base: process.env.GITHUB_REPOSITORY
      ? `/${process.env.GITHUB_REPOSITORY.split('/')[1]}/`
      : '/',
    // define: {
    //   [command === 'serve' ? 'global' : '_global']: {},
    // },
    define: {
      global: 'globalThis',
    },
    root: sourceRoot,
    build: {
      sourcemap: true,
      rollupOptions: {
        // підхоплює будь-який src/*.html — мультисторінковість «безкоштовно»
        input: glob.sync('*.html', { cwd: sourceRoot, absolute: true }),
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              return 'vendor';
            }
          },
          entryFileNames: '[name].js',
          assetFileNames: assetInfo => {
            if (assetInfo.name && assetInfo.name.endsWith('.html')) {
              return '[name].[ext]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      outDir: '../dist',
      emptyOutDir: true,
    },
    plugins: [
      SortCss({
        sort: 'mobile-first',
      }),
    ],
  };
});
