import * as path from 'path';
import * as fs from 'fs';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = (relativePath:string) => path.resolve(appDirectory, relativePath);
const paths = {
  // dotenv: resolveApp('.env'),
  appPath: resolveApp('.'),
  appPublic: resolveApp('public'),
  appBuild: resolveApp('build'),
  appHtml: resolveApp('public/index.html'),
  appEntry: resolveApp('src/index.tsx'),
  // appPackageJson: resolveApp('package.json'),
  appSrc: resolveApp('src'),
  appTsConfig: resolveApp('tsconfig.json'),
  // appJsConfig: resolveApp('jsconfig.json'),
  appNodeModules: resolveApp('node_modules'),
  appWebpackCache: resolveApp('node_modules/.cache'),
  appTsBuildInfoFile: resolveApp('node_modules/.cache/tsconfig.tsbuildinfo'),
  // swSrc: resolveModule(resolveApp, 'src/service-worker'),
  publicUrlOrPath:'/',
};

function readEnvFile(file:string, type:string) {
  if (!fs.existsSync(file)) {
    throw new Error(`You specified ${type} in your env, but the file "${file}" can't be found.`);
  }
  return fs.readFileSync(file);
}

export function getHttpsConfig() {
  const { SSL_CRT_FILE, SSL_KEY_FILE, HTTPS } = process.env;
  const isHttps = HTTPS === 'true';
  if (isHttps && SSL_CRT_FILE && SSL_KEY_FILE) {
    const crtFile = path.resolve(paths.appPath, SSL_CRT_FILE);
    const keyFile = path.resolve(paths.appPath, SSL_KEY_FILE);
    const config = {
      cert: readEnvFile(crtFile, 'SSL_CRT_FILE'),
      key: readEnvFile(keyFile, 'SSL_KEY_FILE'),
    };
    return config;
  }
  return isHttps;
}

export {
  paths
}

// paths {
//   dotenv: '/Users/lyw/code/webpack5/my-app/.env',
//   appPath: '/Users/lyw/code/webpack5/my-app',
//   appBuild: '/Users/lyw/code/webpack5/my-app/build',
//   appPublic: '/Users/lyw/code/webpack5/my-app/public',
//   appHtml: '/Users/lyw/code/webpack5/my-app/public/index.html',
//   appIndexJs: '/Users/lyw/code/webpack5/my-app/src/index.js',
//   appPackageJson: '/Users/lyw/code/webpack5/my-app/package.json',
//   appSrc: '/Users/lyw/code/webpack5/my-app/src',
//   appTsConfig: '/Users/lyw/code/webpack5/my-app/tsconfig.json',
//   appJsConfig: '/Users/lyw/code/webpack5/my-app/jsconfig.json',
//   yarnLockFile: '/Users/lyw/code/webpack5/my-app/yarn.lock',
//   testsSetup: '/Users/lyw/code/webpack5/my-app/src/setupTests.js',
//   proxySetup: '/Users/lyw/code/webpack5/my-app/src/setupProxy.js',
//   appNodeModules: '/Users/lyw/code/webpack5/my-app/node_modules',
//   appWebpackCache: '/Users/lyw/code/webpack5/my-app/node_modules/.cache',
//   appTsBuildInfoFile: '/Users/lyw/code/webpack5/my-app/node_modules/.cache/tsconfig.tsbuildinfo',
//   swSrc: '/Users/lyw/code/webpack5/my-app/src/service-worker.js',
//   publicUrlOrPath: '/',
//   moduleFileExtensions: [
//     'web.mjs', 'mjs',
//     'web.js',  'js',
//     'web.ts',  'ts',
//     'web.tsx', 'tsx',
//     'json',    'web.jsx',
//     'jsx'
//   ]
// }