const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");
const ModuleScopePlugin = require('react-dev-utils/ModuleScopePlugin');

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
  return config;
};