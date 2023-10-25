import chalk from 'chalk';
import webpack from 'webpack';
import forkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import WebpackDevServer from 'webpack-dev-server';
import configFactory from '../config/webpack.config';
import serverConfig from '../config/webpackDevServer.config';

process.env.NODE_ENV = 'development';
process.on('unhandledRejection', (err) => {
  throw err;
});

const config = configFactory('development');
const compiler = createCompiler(config);
const devServer = new WebpackDevServer(serverConfig, compiler);

// Launch WebpackDevServer.
devServer.startCallback(() => {
  clearConsole();
  console.log(chalk.cyan('Starting the development server...\n'));
});

['SIGINT', 'SIGTERM'].forEach(function (sig) {
  process.on(sig, function () {
    devServer.close();
    process.exit();
  });
});

if (process.env.CI !== 'true') {
  // Gracefully exit when stdin ends
  process.stdin.on('end', function () {
    devServer.close();
    process.exit();
  });
}

function createCompiler(config: webpack.Configuration) {
  let compiler: webpack.Compiler;
  try {
    compiler = webpack(config);
  } catch (err) {
    console.log(chalk.red('Failed to compile.'));
    console.log((err as Error).message || err);
    process.exit(1);
  }
  compiler.hooks.invalid.tap('invalid', () => {
    clearConsole();
    console.log('Compiling...');
  });

  forkTsCheckerWebpackPlugin
    .getCompilerHooks(compiler)
    .waiting.tap('awaitingTypeScriptCheck', () => {
      console.log(chalk.yellow('Files successfully emitted, waiting for type check results...'));
    });
  // "done" event fires when webpack has finished recompiling the bundle.
  // Whether or not you have warnings or errors, you will get this event.
  compiler.hooks.done.tap('done', async (stats) => {
    clearConsole();
    const statsData = stats.toJson({
      all: false,
      warnings: true,
      errors: true,
    });
    if (!statsData.errors && !statsData.warnings) {
      console.log(chalk.green('Compiled successfully!'));
      return;
    }
  });

  return compiler;
}

function clearConsole() {
  process.stdout.write(process.platform === 'win32' ? '\x1B[2J\x1B[0f' : '\x1B[2J\x1B[3J\x1B[H');
}
