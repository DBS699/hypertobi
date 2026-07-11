import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'

const r = (p) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  server: { port: Number(process.env.PORT) || 5187 },
  // the arcade game bundle uses classic JSX with a global-style React identifier
  esbuild: {
    jsx: 'transform',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  },
  build: {
    rollupOptions: {
      input: {
        home: r('index.html'),
        pizza: r('pizza.html'),
        film: r('film.html'),
        foto: r('foto.html'),
        web: r('web.html'),
        impressum: r('impressum.html'),
        datenschutz: r('datenschutz.html')
      }
    }
  }
})
