//mongoose.connect('mongodb://username:password@host:port/database?options...');
const crypto = require('crypto');

exports.env = {
    env: 'development',
    db: 'mongodb://localhost/network-monitoring',
    port: 3000,
    jwt_secret: crypto.randomBytes(256),
    
};

