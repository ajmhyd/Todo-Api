require('./config/config');

var express = require('express');
var bodyParser = require('body-parser');
var { ObjectID } = require('mongodb');
var _ = require('lodash');

var { mongoose } = require('./db/mongoose');
var { authenticate } = require('./middleware/authenticate');
var Todo = require('./models/todo');
var User = require('./models/user');

var app = express();
app.use(bodyParser.json());
const port = process.env.PORT || 3000;

//CREATE
app.post('/todos', (req, res) => {
  Todo.create(req.body, (err, todo) => {
    if(err) {
      res.status(400).send(err)
      console.log(err);
    } else {
      res.send(todo);
    }
  });
});

//SHOW
app.get('/todos', (req, res) => {
  Todo.find().then((todos) => {
    res.send({todos});
  }, (err) => {
    res.status(400).send(err);
  });
});

app.get('/todos/:id', (req, res) => {

  if(!ObjectID.isValid(req.params.id)) {
    return res.status(404).send();
  }

  Todo.findById(req.params.id).then((todo) => {
    if (!todo){
      return res.status(404).send();
    }
    res.send({ todo });
  }).catch((err) => {
    res.status(400).send();
  });
});

//Delete
app.delete('/todos/:id', (req, res) => {

  if(!ObjectID.isValid(req.params.id)) {
    return res.status(404).send();
  }

  Todo.findByIdAndRemove(req.params.id).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((err) => {
    res.status(400).send();
  });
});

//EDIT
app.patch('/todos/:id', (req, res) => {
  var body = _.pick(req.body, ['text', 'completed']);

  if(!ObjectID.isValid(req.params.id)) {
    return res.status(404).send();
  }
  if(_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  }else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findByIdAndUpdate(req.params.id, {$set: body}, {new: true}).then((todo) => {
    if(!todo){
      return res.status(404).send();
    }
    res.send({todo});
  }).catch((err) => {
    res.status(400).send();
  })
});

//CREATE USERS
app.post('/users', (req,res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);
  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((err) => {
    res.status(400).send(err);
  });
});

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user);
});

app.post('/users/login', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);

  User.findByCredentials(body.email, body.password).then((user) => {
    return user.generateAuthToken().then((token) => {
      res.header('x-auth', token).send(user);
    });
  }).catch((err) => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});

module.exports = { app };