const path = require('path');

module.exports = function override(config, env) {
  // Add our custom JSON handling rule
  config.module.rules.push({
    test: /\.json$/,
    include: path.resolve(__dirname, 'src/i18n/locales'),
    type: 'javascript/auto',
    loader: require.resolve('json-loader')
  });

  return config;
}
