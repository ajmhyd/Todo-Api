var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/TodoApp', { useNewUrlParser: true });

module.exports = { mongoose };