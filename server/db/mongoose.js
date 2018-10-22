var mongoose = require('mongoose');

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost/TodoApp', { useNewUrlParser: true });

module.exports = { mongoose };