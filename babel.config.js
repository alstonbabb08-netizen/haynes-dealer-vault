module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Strip console logs in production builds
      // This ensures console.log, console.error, etc. are removed from release builds
      // preventing performance degradation and API exposure to reviewers
      process.env.NODE_ENV === 'production' && 'transform-remove-console',
    ].filter(Boolean),
  };
};
