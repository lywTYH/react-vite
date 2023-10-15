import { defineConfig,type PluginOption } from 'vite'
import { visualizer,  } from "rollup-plugin-visualizer";
import react from '@vitejs/plugin-react-swc'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [visualizer({
    open: true
  }) as PluginOption,react()],
  server:{
    host: true,
      proxy: {
        '/api': {
            target: 'http://127.0.0.1:5000/api',
            changeOrigin: true,
            rewrite: path => path.replace(/^\/api/, '')
        },
        '/ws': {
            target: 'ws://127.0.0.1:5000',
            ws: true,
            changeOrigin: true,
            rewrite: path => path.replace(/^\/ws/, '')
        }    
    }
  },
  build:{
    rollupOptions:{
      output: {
        minifyInternalExports:false,
        // manualChunks:(id)=>{
        //   if (id.indexOf("node_modules")>0) {
        //     // 让每个插件都打包成独立的文件
        //     const str= id.split("node_modules/")[1].split('/')[0];
        //     return str
        //   }
        // },
        manualChunks:{
          'react-vendor': ['react', 'react-dom'],
        },
        chunkFileNames: 'js/[name]-[hash].js', // 引入文件名的名称
        entryFileNames: 'js/[name]-[hash].js', // 包的入口文件名称
        assetFileNames: '[ext]/[name]-[hash].[ext]', // 资源文件像 字体，图片等
      },
      // external:['react','react-dom']
    }
  }
})
