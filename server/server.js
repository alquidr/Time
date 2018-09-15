"use-strict"
require('./config/config');

const _ = require('lodash');
const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('./models/todo');
var {User} = require('./models/user');
var {Task} = require('./models/task');
var {Project} = require('./models/project');
var {authenticate} = require('./middleware/authenticate');

var app = express();
const port = process.env.PORT;

app.use(bodyParser.json());

//#region PROJECT API
/*Request to save projects in the database*/
app.post('/projects', authenticate, (req, res) => {
  var project = new Project({
    name: req.body.name,
    description: req.body.description,
    creationDate: new Date(),
    _creator: req.user._id
  });

  project.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

/*Request to get all projects per user*/
app.get('/projects', authenticate, (req, res) => {
  Project.find({
    _creator: req.user._id
  }).then((projects) => {
    res.send({projects});
  }, (e) => {
    res.status(400).send(e);
  });
});


/*Request to get a project by id */
app.get('/projects/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Project.findOne({
    _id: id,
    _creator: req.user._id
  }).then((project) => {
    if (!project) {
      return res.status(404).send();
    }
    res.send({project});
  }).catch((e) => {
    res.status(400).send();
  });
});

/*Request to update a project*/
app.patch('/projects/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  body.name = req.body.name
  body.description = req.body.description

  Project.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((project) => {
    if (!project) {
      return res.status(404).send();
    }

    res.send({project});
  }).catch((e) => {
    res.status(400).send();
  })
});

/*Request to delete a project */
app.delete('/projects/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Project.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((project) => {
    if (!project) {
      return res.status(404).send();
    }

    res.send({project});
  }).catch((e) => {
    res.status(400).send();
  });
});

//#endregion PROJECT API

//#region  TASK API
/*Request to save tasks in the database*/
app.post('/tasks', authenticate, (req, res) => {
  var task = new Task({
    name: req.body.name,
    description: req.body.description,
    startDate: new Date(),
    isPaused: req.body.isPaused,
    estimatedTime : req.body.estimatedTime,
    _creator: req.user._id,
    _project: req.body.project
  });

  task.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

/*Request to rehabilitate tasks given a name*/
app.post('/retryTasks', authenticate, (req, res) => {
  var task = new Task({
    name: req.body.name,
    description: req.body.description,
    startDate: new Date(),
    isPaused: req.body.isPaused,
    estimatedTime : req.body.estimatedTime,
    _creator: req.user._id,
    _project: req.body.project
  });

  task.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});


/*Request to get all the tasks*/
app.get('/tasks', authenticate, (req, res) => {
  Task.find({
    _creator: req.user._id
  }).then((tasks) => {
    res.send({tasks});
  }, (e) => {
    res.status(400).send(e);
  });
});

/*Request to get a task by id */
app.get('/tasks/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Task.findOne({
    _id: id,
    _creator: req.user._id
  }).then((task) => {
    if (!task) {
      return res.status(404).send();
    }

    res.send({task});
  }).catch((e) => {
    res.status(400).send();
  });
});

/*Request to update a task */
app.patch('/tasks/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['isPaused','elapsedTime','startDate']);
  var currentElapsedTime;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.isPaused) && body.isPaused) {   

        Task.findOne({
          _id: id,
          _creator: req.user._id
        }).then((task) => {
          if (!task) {
            return res.status(404).send();
          }
          else {
            console.log(body.isPaused);
            var taskStartTime = task.startDate;
            var taskPausedTime = new Date();
            currentElapsedTime = Math.round((taskPausedTime - taskStartTime) / 1000);
            body.elapsedTime = Math.round((taskPausedTime - taskStartTime) / 1000);
            /*console.log(taskStartTime);
            console.log(taskPausedTime);
            console.log(currentElapsedTime + "dif");*/
            body.name = req.body.name
            body.description = req.body.description
            body.isPaused = true;

            Task.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((task) => {
              if (!task) {
                return res.status(404).send();
              }
          
              res.send({task});
            }).catch((e) => {
              res.status(400).send();
            })
          }
          
        }).catch((e) => {
          res.status(400).send();
        });

  } else {
        //console.log("no hubo pausa");
        body.name = req.body.name;
        body.description = req.body.description;
        body.description = 
        Task.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((task) => {
          if (!task) {
            return res.status(404).send();
          }
          res.send({task});
        }).catch((e) => {
          res.status(400).send();
        })
  }
});

app.delete('/tasks/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Task.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((task) => {
    if (!task) {
      return res.status(404).send();
    }
    res.send({task});
  }).catch((e) => {
    res.status(400).send();
  });
});

/*Request to get the total time spent in seconds per project */
app.get('/projectsTimeSummary', authenticate, (req, res) => {

    Task.aggregate([
      { $group:{
        _id: "$_project",
        totalTimeElapsed :{ $sum: "$elapsedTime"} }
      }
        
    ]).exec(function (err, data) {
      if (err) return res.send(data);
      res.send(data);
    });

});

/*Request to get the total time spent in seconds per user */
app.get('/usersTimeSummary', authenticate, (req, res) => {

  Task.aggregate([
    { $group:{
      _id: "$_creator",
      totalTimeElapsed :{ $sum: "$elapsedTime"} }
    }
      
  ]).exec(function (err, data) {
    if (err) return res.send(data);
    res.send(data);
  });

});

//#endregion

//#region TODO API
app.post('/todos', authenticate, (req, res) => {
  var todo = new Todo({
    text: req.body.text,
    _creator: req.user._id
  });

  todo.save().then((doc) => {
    res.send(doc);
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos', authenticate, (req, res) => {
  Todo.find({
    _creator: req.user._id
  }).then((todos) => {
    res.send({todos});
  }, (e) => {
    res.status(400).send(e);
  });
});

app.get('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOne({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  Todo.findOneAndRemove({
    _id: id,
    _creator: req.user._id
  }).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  });
});

app.patch('/todos/:id', authenticate, (req, res) => {
  var id = req.params.id;
  var body = _.pick(req.body, ['text', 'completed']);

  if (!ObjectID.isValid(id)) {
    return res.status(404).send();
  }

  if (_.isBoolean(body.completed) && body.completed) {
    body.completedAt = new Date().getTime();
  } else {
    body.completed = false;
    body.completedAt = null;
  }

  Todo.findOneAndUpdate({_id: id, _creator: req.user._id}, {$set: body}, {new: true}).then((todo) => {
    if (!todo) {
      return res.status(404).send();
    }

    res.send({todo});
  }).catch((e) => {
    res.status(400).send();
  })
});
//#endregion

//#region API USERS
app.post('/users', (req, res) => {
  var body = _.pick(req.body, ['email', 'password']);
  var user = new User(body);

  user.save().then(() => {
    return user.generateAuthToken();
  }).then((token) => {
    res.header('x-auth', token).send(user);
  }).catch((e) => {
    res.status(400).send(e);
  })
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
  }).catch((e) => {
    res.status(400).send();
  });
});

app.delete('/users/me/token', authenticate, (req, res) => {
  req.user.removeToken(req.token).then(() => {
    res.status(200).send();
  }, () => {
    res.status(400).send();
  });
});

app.listen(port, () => {
  console.log(`Started up at port ${port}`);
});

//#endregion
module.exports = {app};
