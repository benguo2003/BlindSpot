module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ["module:react-native-dotenv", {
        moduleName: '@env',
        path: './.env',
        blacklist: null,
        whitelist: ['OPENAI_API_KEY', 'OPENAI_PROJECT_ID', 'FIREBASE_API_KEY', 'FIREBASE_AUTH_DOMAIN', 'FIREBASE_PROJECT_ID', 'FIREBASE_STORAGE_BUCKET', 'FIREBASE_MESSAGING_SENDER_ID', 'FIREBASE_APP_ID'],
        safe: false,
        allowUndefined: true
      }]
    ]
  };
};