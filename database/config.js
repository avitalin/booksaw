const config = {
  development: {
    host: 'localhost',
    user: 'root',
    password: 'your_password',
    database: 'booksaw_db',
    connectionLimit: 10
  },
  production: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    connectionLimit: 20
  }
};

export default config[process.env.NODE_ENV || 'development']; 