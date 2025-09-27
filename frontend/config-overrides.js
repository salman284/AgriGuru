const path = require('path');

module.exports = function override(config, env) {
  // Add our custom JSON handling rule
  config.module.rules.push({
    test: /\.json$/,
    include: path.resolve(__dirname, 'src/i18n/locales'),
    type: 'javascript/auto',
    loader: require.resolve('json-loader')
  });

  // Force CI to be false to prevent treating warnings as errors
  process.env.CI = 'false';
  process.env.GENERATE_SOURCEMAP = 'false';
  process.env.DISABLE_ESLINT_PLUGIN = 'true';
  process.env.ESLINT_NO_DEV_ERRORS = 'true';
  process.env.TSC_COMPILE_ON_ERROR = 'true';
  
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

  // Remove all ESLint-related rules from module rules
  if (config.module && config.module.rules) {
    config.module.rules = config.module.rules.filter(rule => {
      if (rule.use && Array.isArray(rule.use)) {
        return !rule.use.some(loader => 
          loader && loader.loader && loader.loader.includes('eslint-loader')
        );
      }
      return true;
    });
  }

  // Disable source maps in production
  if (env === 'production') {
    config.devtool = false;
  }

  // Additional safeguards to disable ESLint
  config.ignoreWarnings = [/Failed to parse source map/];
  
  return config;
}
