import vue from '@vitejs/plugin-vue'

export default {
  resolve: {
    alias: {
      vue: 'vue/dist/vue.esm-bundler.js'
    }
  },
  rollupOptions: {
    input: 'src/main.js',
    format: 'system',
    preserveEntrySignatures: true
  },
  plugins: [vue({
    template: {
      transformAssetUrls: {
        base: '/src'
      }
    }
  })],
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
