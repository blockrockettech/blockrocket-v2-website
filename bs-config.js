module.exports = {
  server: { baseDir: 'dist', serveStaticOptions: { extensions: ['html'] } }, // clean URLs in dev, as in server.js
  files: ['dist/**/*'],
  watchOptions: { ignoreInitial: true },
  port: 3000,
  notify: false
};
