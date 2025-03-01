const webpack = require('webpack');

const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

// experiments.lazyCompilation uses the `server.address()` as the one mentioned in the compilation targets, not
// accounting for possible differences between server & client targets.
const lazyCompilationBackend = (options) => (compiler, callback) => {
  const logger = compiler.getInfrastructureLogger("LazyCompilationBackend");
  const activeModules = new Map();
  const prefix = "/lazy-compilation-using-";

  const isHttps =
      options.protocol === "https" ||
      (typeof options.server === "object" &&
          ("key" in options.server || "pfx" in options.server));

  const createServer =
      typeof options.server === "function"
          ? options.server
          : (() => {
            const http = isHttps ? require("https") : require("http");
            return http.createServer.bind(http, options.server);
          })();
  const listen =
      typeof options.listen === "function"
          ? options.listen
          : server => {
            let listen = options.listen;
            if (typeof listen === "object" && !("port" in listen))
              listen = {...listen, port: undefined};
            server.listen(listen);
          };

  const protocol = options.protocol || (isHttps ? "https" : "http");

  const requestListener = (req, res) => {
    const keys = req.url.slice(prefix.length).split("@");
    req.socket.on("close", () => {
      setTimeout(() => {
        for (const key of keys) {
          const oldValue = activeModules.get(key) || 0;
          activeModules.set(key, oldValue - 1);
          if (oldValue === 1) {
            logger.log(
                `${key} is no longer in use. Next compilation will skip this module.`
            );
          }
        }
      }, 120000);
    });
    req.socket.setNoDelay(true);
    res.writeHead(200, {
      "content-type": "text/event-stream",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "*",
      "Access-Control-Allow-Headers": "*"
    });
    res.write("\n");
    let moduleActivated = false;
    for (const key of keys) {
      const oldValue = activeModules.get(key) || 0;
      activeModules.set(key, oldValue + 1);
      if (oldValue === 0) {
        logger.log(`${key} is now in use and will be compiled.`);
        moduleActivated = true;
      }
    }
    if (moduleActivated && compiler.watching) compiler.watching.invalidate();
  };

  const server = /** @type {import("net").Server} */ (createServer());
  server.on("request", requestListener);

  let isClosing = false;
  /** @type {Set<import("net").Socket>} */
  const sockets = new Set();
  server.on("connection", socket => {
    sockets.add(socket);
    socket.on("close", () => {
      sockets.delete(socket);
    });
    if (isClosing) socket.destroy();
  });
  server.on("clientError", e => {
    if (e.message !== "Server is disposing") logger.warn(e);
  });
  server.on("listening", err => {
    if (err) return callback(err);
    const addr = server.address();
    if (typeof addr === "string") throw new Error("addr must not be a string");
    const urlBase =
        addr.address === "::" || addr.address === "0.0.0.0"
            ? `${protocol}://localhost:${addr.port}`
            : addr.family === "IPv6"
                ? `${protocol}://[${addr.address}]:${addr.port}`
                : `${protocol}://${addr.address}:${addr.port}`;
    logger.log(
        `Server-Sent-Events server for lazy compilation open at ${urlBase}.`
    );
    callback(null, {
      dispose(callback) {
        isClosing = true;
        // Removing the listener is a workaround for a memory leak in node.js
        server.off("request", requestListener);
        server.close(err => {
          callback(err);
        });
        for (const socket of sockets) {
          socket.destroy(new Error("Server is disposing"));
        }
      },
      module(originalModule) {
        const key = `${encodeURIComponent(
            originalModule.identifier().replace(/\\/g, "/").replace(/@/g, "_")
        ).replace(/%(2F|3A|24|26|2B|2C|3B|3D|3A)/g, decodeURIComponent)}`;
        const active = activeModules.get(key) > 0;

        const clientUrlBase = options.client === undefined ? urlBase : options.client;
        return {
          client: `${require.resolve('webpack/hot/lazy-compilation-web.js')}?${encodeURIComponent(clientUrlBase + prefix)}`,
          data: key,
          active
        };
      }
    });
  });
  listen(server);
};

// https://github.com/facebook/create-react-app/issues/11756
module.exports = function override(config, env) {

  config.resolve.plugins = config.resolve.plugins.filter(plugin => !(plugin instanceof ModuleScopePlugin));

  config.plugins.push(new NodePolyfillPlugin({
    excludeAliases: [
      // "assert",
      // "console",
      // "constants",
      // // "crypto",
      // "domain",
      // "events",
      // "http",
      // "https",
      // "os",
      // // "path",
      // "punycode",
      // "querystring",
      // "_stream_duplex",
      // "_stream_passthrough",
      // "_stream_transform",
      // "_stream_writable",
      // "string_decoder",
      // "sys",
      // "timers",
      // "tty",
      // "url",
      // "util",
      // "vm",
      // "zlib"
    ]
  }));

  // https://github.com/Emurgo/cardano-serialization-lib/issues/295#issuecomment-995943141
  const wasmExtensionRegExp = /\.wasm$/;
  config.resolve.extensions.push('.wasm');
  config.experiments = {
    asyncWebAssembly: false,

    // https://github.com/webpack/webpack/blob/main/lib/hmr/lazyCompilationBackend.js
    // https://webpack.js.org/configuration/experiments/#experimentslazycompilation
    // Fix: https://github.com/webpack/webpack/compare/main...FadiShawki:webpack:fix-lazy-compilation-client-option
    // lazyCompilation: {
    //   backend: lazyCompilationBackend({
    //     client: process.env.LAZY_COMPILATION_CLIENT_URL,
    //     listen: {
    //       host: '0.0.0.0',
    //       port: parseInt(process.env.LAZY_COMPILATION_PORT) || 40000,
    //     }
    //   })
    // },

    syncWebAssembly: true,
    topLevelAwait: true,
  };
  config.resolve.fallback = {
    buffer: require.resolve('buffer/')
  }
  config.module.rules.forEach((rule) => {
    (rule.oneOf || []).forEach((oneOf) => {
      if (oneOf.type === "asset/resource") {
        oneOf.exclude.push(wasmExtensionRegExp);
      }
    });
  });
  config.plugins.push(new webpack.ProvidePlugin({
    Buffer: ['buffer', 'Buffer'],
  }));

  return config;
};