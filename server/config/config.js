var env = process.env.NODE_ENV || 'development';
console.log(env);
if (env === 'development') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://admin:admin1055912@ds143932.mlab.com:43932/qrvey-time';
} else if (env === 'production') {
  process.env.PORT = 3000;
  process.env.MONGODB_URI = 'mongodb://admin:admin1055912@ds143932.mlab.com:43932/qrvey-time';
}
