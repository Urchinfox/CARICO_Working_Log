import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // resolve: {
  //   alias: [
  //     {
  //       find: "@",
  //       replacement: path.resolve(
  //         __dirname,
  //         "src"
  //       ),
  //     },
  //   ],
  // },
  base: process.env.NODE_ENV === 'production' ? '/CARICO_Workout_Log/' : '/',
  plugins: [react()],
})
