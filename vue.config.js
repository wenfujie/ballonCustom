module.exports = {
  baseUrl: '',
  lintOnSave: false,
  runtimeCompiler: true,

  css: {
    loaderOptions: {
      sass: {
        data: '@import "@/assets/scss/common/var_fn.scss";'
      }
    }
  },
  devServer: {
    compress: true,
    disableHostCheck: true,   // That solved it
  },
  outputDir: 'server/assets',
  assetsDir: undefined,
  productionSourceMap: false,
  parallel: undefined
};