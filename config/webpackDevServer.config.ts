import { Configuration, ClientConfiguration } from 'webpack-dev-server';

import { getHttpsConfig, paths } from './utils';
const host = process.env.HOST || '0.0.0.0';
const sockHost = process.env.WDS_SOCKET_HOST;
const sockPath = process.env.WDS_SOCKET_PATH; // default: '/ws'
const sockPort = process.env.WDS_SOCKET_PORT;
const allowedHosts: Configuration['allowedHosts'] = 'all';
const webSocketURL: ClientConfiguration['webSocketURL'] = {
  hostname: sockHost,
  pathname: sockPath,
  port: sockPort,
};

const config: Configuration = {
  allowedHosts,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
  },
  compress: true,
  static: {
    directory: paths.appPublic,
    publicPath: [paths.publicUrlOrPath],
    // watch: {
    //   // Reportedly, this avoids CPU overload on some systems.
    //   // https://github.com/facebook/create-react-app/issues/293
    //   // src/node_modules is not ignored to support absolute imports
    //   // https://github.com/facebook/create-react-app/issues/1065
    //   ignored: ignoredFiles(paths.appSrc),
    // },
  },
  client: {
    webSocketURL,
    overlay: {
      errors: false,
      warnings: false,
    },
  },
  devMiddleware: {
    publicPath: paths.publicUrlOrPath.slice(0, -1),
  },
  https: getHttpsConfig(),
  host,
  historyApiFallback: {
    disableDotRule: true,
    index: paths.publicUrlOrPath,
  },
  open: true,
  // onBeforeSetupMiddleware(devServer) {
  // Keep `evalSourceMapMiddleware`
  // middlewares before `redirectServedPath` otherwise will not have any effect
  // This lets us fetch source contents from webpack for the error overlay
  // devServer.app.use(evalSourceMapMiddleware(devServer));

  // if (fs.existsSync(paths.proxySetup)) {
  //   // This registers user provided middleware for proxy reasons
  //   require(paths.proxySetup)(devServer.app);
  // }
  // },
};

export default config;
