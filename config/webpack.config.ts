import * as path from 'path';
import {fileURLToPath} from 'url';
import {Configuration} from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
import ESLintPlugin from 'eslint-webpack-plugin';

import {paths} from './utils';

const cssRegex = /\.css$/;
const cssModuleRegex = /\.module\.css$/;
const useTailwind = false;
const __filename = fileURLToPath(import.meta.url);
export default function configFactory(webpackEnv: 'development' | 'production'): Configuration {
  const isEnvDevelopment = webpackEnv === 'development';
  const isEnvProduction = webpackEnv === 'production';

  const getStyleLoaders = (cssOptions: Record<string, unknown>) => {
    const loaders = [
      isEnvDevelopment && 'style-loader',
      isEnvProduction && {
        loader: MiniCssExtractPlugin.loader,
        // css is located in `static/css`, use '../../' to locate index.html folder
        // in production `paths.publicUrlOrPath` can be a relative path
        options: paths.publicUrlOrPath.startsWith('.') ? {publicPath: '../../'} : {},
      },
      {
        loader: 'css-loader',
        options: cssOptions,
      },
      {
        // Options for PostCSS as we reference these options twice
        // Adds vendor prefixing based on your specified browser support in
        // package.json
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            // Necessary for external CSS imports to work
            // https://github.com/facebook/create-react-app/issues/2677
            ident: 'postcss',
            config: false,
            plugins: !useTailwind
              ? [
                  'postcss-flexbugs-fixes',
                  [
                    'postcss-preset-env',
                    {
                      autoprefixer: {
                        flexbox: 'no-2009',
                      },
                      stage: 3,
                    },
                  ],
                  // Adds PostCSS Normalize as the reset css with default options,
                  // so that it honors browserslist config in package.json
                  // which in turn let's users customize the target behavior as per their needs.
                  'postcss-normalize',
                ]
              : [
                  'tailwindcss',
                  'postcss-flexbugs-fixes',
                  [
                    'postcss-preset-env',
                    {
                      autoprefixer: {
                        flexbox: 'no-2009',
                      },
                      stage: 3,
                    },
                  ],
                ],
          },
          sourceMap: isEnvProduction,
        },
      },
    ].filter(Boolean);
    // if (preProcessor) {
    //   loaders.push(
    //     {
    //       loader: require.resolve('resolve-url-loader'),
    //       options: {
    //         sourceMap: isEnvProduction ? shouldUseSourceMap : isEnvDevelopment,
    //         root: paths.appSrc,
    //       },
    //     },
    //     {
    //       loader: require.resolve(preProcessor),
    //       options: {
    //         sourceMap: true,
    //       },
    //     }
    //   );
    // }
    return loaders;
  };

  return {
    target: ['browserslist'],
    stats: 'errors-warnings',
    mode: isEnvProduction ? 'production' : isEnvDevelopment ? 'development' : undefined,
    bail: isEnvProduction,
    devtool: isEnvProduction ? 'source-map' : isEnvDevelopment && 'cheap-module-source-map',
    entry: paths.appEntry,
    output: {
      // The build folder.
      path: paths.appBuild,
      pathinfo: isEnvDevelopment,
      filename: isEnvProduction ? 'static/js/[name].[contenthash:8].js' : 'static/js/bundle.js',
      chunkFilename: isEnvProduction
        ? 'static/js/[name].[contenthash:8].chunk.js'
        : 'static/js/[name].chunk.js',
      assetModuleFilename: 'static/media/[name].[hash][ext]',
      // webpack uses `publicPath` to determine where the app is being served from.
      // It requires a trailing slash, or the file assets will get an incorrect path.
      // We inferred the "public path" (such as / or /my-project) from homepage.
      publicPath: paths.publicUrlOrPath,
      // Point sourcemap entries to original disk location (format as URL on Windows)
      // devtoolModuleFilenameTemplate: isEnvProduction
      //   ? (info) => path.relative(paths.appSrc, info.absoluteResourcePath).replace(/\\/g, '/')
      //   : (info) => path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
    },
    cache: {
      type: 'filesystem',
      // version: createEnvironmentHash(env.raw),
      cacheDirectory: paths.appWebpackCache,
      store: 'pack',
      buildDependencies: {
        defaultWebpack: ['webpack/lib/'],
        config: [__filename],
      },
    },
    infrastructureLogging: {
      level: 'none',
    },
    resolve: {
      modules: ['node_modules'],
      extensions: ['.tsx', '.ts', '.js', '.jsx'],
      alias: {},
      plugins: [],
    },
    optimization: {
      minimize: isEnvProduction,
      // minimizer: [
      //   // This is only used in production mode
      //   new TerserPlugin({
      //     terserOptions: {
      //       parse: {
      //         ecma: 8,
      //       },
      //       compress: {
      //         ecma: 5,
      //         warnings: false,
      //         // Disabled because of an issue with Uglify breaking seemingly valid code:
      //         // https://github.com/facebook/create-react-app/issues/2376
      //         // Pending further investigation:
      //         // https://github.com/mishoo/UglifyJS2/issues/2011
      //         comparisons: false,
      //         // Disabled because of an issue with Terser breaking valid code:
      //         // https://github.com/facebook/create-react-app/issues/5250
      //         // Pending further investigation:
      //         // https://github.com/terser-js/terser/issues/120
      //         inline: 2,
      //       },
      //       mangle: {
      //         safari10: true,
      //       },
      //       // Added for profiling in devtools
      //       keep_classnames: isEnvProductionProfile,
      //       keep_fnames: isEnvProductionProfile,
      //       output: {
      //         ecma: 5,
      //         comments: false,
      //         ascii_only: true,
      //       },
      //     },
      //   }),
      //   // This is only used in production mode
      //   new CssMinimizerPlugin(),
      // ],
    },
    module: {
      strictExportPresence: true,
      rules: [
        {
          enforce: 'pre',
          exclude: /@babel(?:\/|\\{1,2})runtime/,
          test: /\.(js|jsx|ts|tsx|css)$/,
          loader: 'source-map-loader',
        },
        {
          oneOf: [
            {
              test: /\.(js|jsx|ts|tsx)$/,
              include: paths.appSrc,
              loader: 'babel-loader',
              options: {
                cacheDirectory: true,
                // See #6846 for context on why cacheCompression is disabled
                cacheCompression: false,
                compact: isEnvProduction,
              },
            },
            {
              test: cssRegex,
              exclude: cssModuleRegex,
              use: getStyleLoaders({
                importLoaders: 1,
                sourceMap: isEnvProduction,
                modules: {
                  mode: 'icss',
                },
              }),
              // Don't consider CSS imports dead code even if the
              // containing package claims to have no side effects.
              // Remove this when webpack adds a warning or an error for this.
              // See https://github.com/webpack/webpack/issues/6571
              sideEffects: true,
            },
          ],
        },
      ],
    },
    plugins: [
      new HtmlWebpackPlugin(
        Object.assign(
          {},
          {
            inject: true,
            template: paths.appHtml,
          },
          isEnvProduction
            ? {
                minify: {
                  removeComments: true,
                  collapseWhitespace: true,
                  removeRedundantAttributes: true,
                  useShortDoctype: true,
                  removeEmptyAttributes: true,
                  removeStyleLinkTypeAttributes: true,
                  keepClosingSlash: true,
                  minifyJS: true,
                  minifyCSS: true,
                  minifyURLs: true,
                },
              }
            : undefined,
        ),
      ),
      // Inlines the webpack runtime script. This script is too small to warrant
      // a network request.
      // https://github.com/facebook/create-react-app/issues/5358
      // isEnvProduction &&
      //   shouldInlineRuntimeChunk &&
      //   new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/runtime-.+[.]js/]),
      // // Makes some environment variables available in index.html.
      // // The public URL is available as %PUBLIC_URL% in index.html, e.g.:
      // // <link rel="icon" href="%PUBLIC_URL%/favicon.ico">
      // // It will be an empty string unless you specify "homepage"
      // // in `package.json`, in which case it will be the pathname of that URL.
      // new InterpolateHtmlPlugin(HtmlWebpackPlugin, env.raw),
      // // This gives some necessary context to module not found errors, such as
      // // the requesting resource.
      // new ModuleNotFoundPlugin(paths.appPath),
      // // Makes some environment variables available to the JS code, for example:
      // // if (process.env.NODE_ENV === 'production') { ... }. See `./env.js`.
      // // It is absolutely essential that NODE_ENV is set to production
      // // during a production build.
      // // Otherwise React will be compiled in the very slow development mode.
      // new webpack.DefinePlugin(env.stringified),
      // // Experimental hot reloading for React .
      // // https://github.com/facebook/react/tree/main/packages/react-refresh
      // isEnvDevelopment &&
      //   shouldUseReactRefresh &&
      //   new ReactRefreshWebpackPlugin({
      //     overlay: false,
      //   }),
      // Watcher doesn't work well if you mistype casing in a path so we use
      // a plugin that prints an error when you attempt to do this.
      // See https://github.com/facebook/create-react-app/issues/240
      // isEnvDevelopment && new CaseSensitivePathsPlugin(),
      // isEnvProduction &&
      //   new MiniCssExtractPlugin({
      //     // Options similar to the same options in webpackOptions.output
      //     // both options are optional
      //     filename: 'static/css/[name].[contenthash:8].css',
      //     chunkFilename: 'static/css/[name].[contenthash:8].chunk.css',
      //   }),
      // Generate an asset manifest file with the following content:
      // - "files" key: Mapping of all asset filenames to their corresponding
      //   output file so that tools can pick it up without having to parse
      //   `index.html`
      // - "entrypoints" key: Array of files which are included in `index.html`,
      //   can be used to reconstruct the HTML if necessary
      // new WebpackManifestPlugin({
      //   fileName: 'asset-manifest.json',
      //   publicPath: paths.publicUrlOrPath,
      //   generate: (seed, files, entrypoints) => {
      //     const manifestFiles = files.reduce((manifest, file) => {
      //       manifest[file.name] = file.path;
      //       return manifest;
      //     }, seed);
      //     const entrypointFiles = entrypoints.main.filter((fileName) => !fileName.endsWith('.map'));

      //     return {
      //       files: manifestFiles,
      //       entrypoints: entrypointFiles,
      //     };
      //   },
      // }),
      // Moment.js is an extremely popular library that bundles large locale files
      // by default due to how webpack interprets its code. This is a practical
      // solution that requires the user to opt into importing specific locales.
      // https://github.com/jmblog/how-to-optimize-momentjs-with-webpack
      // You can remove this if you don't use Moment.js:
      // new webpack.IgnorePlugin({
      //   resourceRegExp: /^\.\/locale$/,
      //   contextRegExp: /moment$/,
      // }),
      // Generate a service worker script that will precache, and keep up to date,
      // the HTML & assets that are part of the webpack build.
      // isEnvProduction &&
      //   new WorkboxWebpackPlugin.InjectManifest({
      //     swSrc,
      //     dontCacheBustURLsMatching: /\.[0-9a-f]{8}\./,
      //     exclude: [/\.map$/, /asset-manifest\.json$/, /LICENSE/],
      //     // Bump up the default maximum size (2mb) that's precached,
      //     // to make lazy-loading failure scenarios less likely.
      //     // See https://github.com/cra-template/pwa/issues/13#issuecomment-722667270
      //     maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      //   }),
      // // TypeScript type checking
      // new ForkTsCheckerWebpackPlugin({
      //   async: isEnvDevelopment,
      //   typescript: {
      //     typescriptPath: resolve.sync('typescript', {
      //       basedir: paths.appNodeModules,
      //     }),
      //     configOverwrite: {
      //       compilerOptions: {
      //         sourceMap: isEnvProduction,
      //         skipLibCheck: true,
      //         inlineSourceMap: false,
      //         declarationMap: false,
      //         noEmit: true,
      //         incremental: true,
      //         tsBuildInfoFile: paths.appTsBuildInfoFile,
      //       },
      //     },
      //     context: paths.appPath,
      //     diagnosticOptions: {
      //       syntactic: true,
      //     },
      //     mode: 'write-references',
      //     // profile: true,
      //   },
      //   issue: {
      //     // This one is specifically to match during CI tests,
      //     // as micromatch doesn't match
      //     // '../cra-template-typescript/template/src/App.tsx'
      //     // otherwise.
      //     include: [{ file: '../**/src/**/*.{ts,tsx}' }, { file: '**/src/**/*.{ts,tsx}' }],
      //     exclude: [
      //       { file: '**/src/**/__tests__/**' },
      //       { file: '**/src/**/?(*.){spec|test}.*' },
      //       { file: '**/src/setupProxy.*' },
      //       { file: '**/src/setupTests.*' },
      //     ],
      //   },
      //   logger: {
      //     infrastructure: 'silent',
      //   },
      // }),
      new ESLintPlugin({
        extensions: ['js', 'jsx', 'ts', 'tsx'],
        // formatter: require.resolve('react-dev-utils/eslintFormatter'),
        failOnError: !isEnvDevelopment,
        context: paths.appSrc,
        cache: true,
        cacheLocation: path.resolve(paths.appNodeModules, '.cache/.eslintcache'),
      }),
    ].filter(Boolean),
  };
}
