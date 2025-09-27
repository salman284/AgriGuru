const path = require('path');

module.exports = function override(config, env) {
  // Add our custom JSON handling rule
  config.module.rules.push({
    test: /\.json$/,
    include: path.resolve(__dirname, 'src/i18n/locales'),
    type: 'javascript/auto',
    loader: require.resolve('json-loader')
  });

  // Force CI to be false
  process.env.CI = 'false';
  process.env.GENERATE_SOURCEMAP = 'false';
  
  // Disable ESLint plugin completely
  if (config.plugins) {
    config.plugins = config.plugins.filter(plugin => {
      // Remove ESLint plugin entirely
      if (plugin && plugin.constructor && plugin.constructor.name === 'ESLintWebpackPlugin') {
        return false;
      }
      return true;
    });
  }

  // Disable source maps in production
  if (env === 'production') {
    config.devtool = false;
  }

  return config;
}
