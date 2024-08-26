const jwt = require('jsonwebtoken');

const secretKey = 'your-very-secret-key'; // Replace with your actual secret key

const token = jwt.sign({}, secretKey, { expiresIn: '9999 years' });
console.log('Token:', token);
