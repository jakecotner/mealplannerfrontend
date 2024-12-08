const { override, addWebpackAlias, addWebpackModuleRule } = require("customize-cra");

module.exports = override(
  (config) => {
    config.resolve.fallback = {
      http: require.resolve("stream-http"),
      https: require.resolve("https-browserify"),
      zlib: require.resolve("browserify-zlib"),
      stream: require.resolve("stream-browserify"),
    };
    return config;
  }
);
