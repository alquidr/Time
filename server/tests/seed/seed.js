const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');
const {Project} = require('./../../models/project');
const {Task} = require('./../../models/task');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const projectOneId = new ObjectID();
const projectTwoId = new ObjectID();

const taskOneId = new ObjectID();
const taskTwoId = new ObjectID();
const taskThreeId = new ObjectID();
const taskFourId = new ObjectID();

const users = [{
  _id: userOneId,
  email: 'andrew@qrvey.com',
  password: 'userOnePass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userOneId, access: 'auth'}, 'abc123').toString()
  }]
}, {
  _id: userTwoId,
  email: 'jen@qrvey.com',
  password: 'userTwoPass',
  tokens: [{
    access: 'auth',
    token: jwt.sign({_id: userTwoId, access: 'auth'}, 'abc123').toString()
  }]
}];

const projects = [{
  _id : projectOneId,
  name: "My first Project",
  description: "This is my first project description",
  creationDate : new Date(),
  _creator: userOneId
},{
  _id : projectTwoId,
    name: "My second Project",
    description: "This is my second project description",
    creationDate : new Date(),
    _creator: userTwoId
},
];

const tasks = [{
  _id : taskOneId,
  name: "My first task",
  description: "This is my first task description",
  startDate : new Date(),
  isPaused : true,
  elapsedTime : null,
  _creator: userOneId,
  _project:projectOneId
},{
  _id : taskTwoId,
  name: "My second task",
  description: "This is my second task description",
  startDate : new Date(),
  isPaused : true,
  elapsedTime : null,
  _creator: userOneId,
  _project:projectOneId
},{
  _id : taskThreeId,
  name: "My third task",
  description: "This is my third task description",
  startDate : new Date(),
  isPaused : true,
  elapsedTime : null,
  _creator: userTwoId,
  _project:projectTwoId
},
{
  _id : taskFourId,
  name: "My fourth task",
  description: "This is my fourth task description",
  startDate : new Date(),
  isPaused : true,
  elapsedTime : null,
  _creator: userTwoId,
  _project:projectOneId
}
];


const todos = [{
  _id: new ObjectID(),
  text: 'First test todo',
  _creator: userOneId
}, {
  _id: new ObjectID(),
  text: 'Second test todo',
  completed: true,
  completedAt: 333,
  _creator: userTwoId
}];

const populateTasks = (done) => {
  Task.remove({}).then(() => {
    return Task.insertMany(tasks);
  }).then(() => done());
};

const populateProjects = (done) => {
  Project.remove({}).then(() => {
    return Project.insertMany(projects);
  }).then(() => done());
};

const populateTodos = (done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {todos, populateTodos, tasks, populateTasks, projects, populateProjects, users, populateUsers};
