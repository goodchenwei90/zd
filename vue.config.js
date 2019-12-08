/* eslint-disable no-mixed-spaces-and-tabs */
const path = require('path')
const webpack = require('webpack')
// const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const CompressionWebpackPlugin = require('compression-webpack-plugin')
const productionGzipExtensions = ['js', 'css']
const PrerenderSPAPlugin = require('prerender-spa-plugin')
const Renderer = PrerenderSPAPlugin.PuppeteerRenderer
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin

function resolve (dir) {
  return path.join(__dirname, dir)
}

// vue.config.js
module.exports = {
  publicPath: '/',
  /*
    Vue-cli3:
    Crashed when using Webpack `import()` #2463
    https://github.com/vuejs/vue-cli/issues/2463

   */
  /*
  pages: {
    index: {
      entry: 'src/main.js',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    }
  },
  */
  configureWebpack: {
    plugins: [
      // Ignore all locale files of moment.js  moment这个库中，如果引用了./locale/目录的内容，就忽略掉，不会打包进去
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
	 /**
	  new UglifyJsPlugin({
        uglifyOptions: {
          compress: {
            drop_debugger: true,
            drop_console: true
          }
        },
        sourceMap: false,
        parallel: true
	  }),
	  */
      new CompressionWebpackPlugin({
        algorithm: 'gzip',
        test: new RegExp('\\.(' + productionGzipExtensions.join('|') + ')$'),
        threshold: 10240,
        minRatio: 0.8
	  // eslint-disable-next-line no-trailing-spaces
      }),
      new PrerenderSPAPlugin({
        // 生成文件的路径，也可以与webpakc打包的一致。
        // 下面这句话非常重要！！！
        // 这个目录只能有一级，如果目录层次大于一级，在生成的时候不会有任何错误提示，在预渲染的时候只会卡着不动。
        staticDir: path.join(__dirname, 'dist'),
        // 对应自己的路由文件，比如a有参数，就需要写成 /a/param1。
        routes: ['/', '/test/list', '/test/qlist', '/search/list', '/zj/info', '/index', '/dashboard', '/testcenter'],
        // 这个很重要，如果没有配置这段，也不会进行预编译
        renderer: new Renderer({
          inject: {
            foo: 'bar'
          },
          headless: false,
          // 在 main.js 中 document.dispatchEvent(new Event('render-event'))，两者的事件名称要对应上。
          renderAfterDocumentEvent: 'render-event'
        })
	  }) 
      // new BundleAnalyzerPlugin()
    ]
  },

  chainWebpack: (config) => {
    config.resolve.alias
      .set('@$', resolve('src'))
      .set('@api', resolve('src/api'))
      .set('@assets', resolve('src/assets'))
      .set('@comp', resolve('src/components'))
      .set('@views', resolve('src/views'))
      .set('@layout', resolve('src/layout'))
      .set('@static', resolve('src/static'))
    // 按需加载icon
    // .set('@ant-design/icons/lib/dist$', resolve('src/utils/icons.js'))

    const svgRule = config.module.rule('svg')
    svgRule.uses.clear()
    svgRule
      .oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-icon-loader')
      .loader('vue-svg-icon-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })
    /* svgRule.oneOf('inline')
      .resourceQuery(/inline/)
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .end()
      .end()
      .oneOf('external')
      .use('file-loader')
      .loader('file-loader')
      .options({
        name: 'assets/[name].[hash:8].[ext]'
      })
    */
  },

  css: {
    loaderOptions: {
      less: {
        modifyVars: {
          /* less 变量覆盖，用于自定义 ant design 主题 */

          /*
          'primary-color': '#F5222D',
          'link-color': '#F5222D',
          'border-radius-base': '4px',
          */
        },
        javascriptEnabled: true
      }
    }
  },

  devServer: {
    // development server port 8000
    port: 8000
    // proxy: {
    //   '/api': {
    //     // target: 'https://mock.ihx.me/mock/5baf3052f7da7e07e04a5116/antd-pro',
    //     target: 'https://mock.ihx.me/mock/5baf3052f7da7e07e04a5116/antd-pro',
    //     ws: false,
    //     changeOrigin: true
    //   }
    // }
  },

  // disable source map in production
  productionSourceMap: false,
  lintOnSave: undefined,
  // babel-loader no-ignore node_modules/*
  transpileDependencies: []
}
