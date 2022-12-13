import vue from '@vitejs/plugin-vue'
import dynamicImport from 'vite-plugin-dynamic-import'
import * as path from "path";

export default {
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js',
      '@': path.join(__dirname, 'src/components/Grid/Main/configs'),
    }
  },
  rollupOptions: {
    input: 'src/main.js',
    format: 'system',
    preserveEntrySignatures: true
  },
  plugins: [
      vue({
        template: {
          transformAssetUrls: {
            base: '/src'
          }
        },
      }),
      dynamicImport(/* options */)
  ],
  pluginOptions: {
    vuetify: {
      // https://github.com/vuetifyjs/vuetify-loader/tree/next/packages/vuetify-loader
    }
  },
  optimizeDeps: {
    exclude: [
      "@meforma/vue-toaster"
    ]
  },
}
