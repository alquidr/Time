const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {User} = require('./../../models/user');
const {Project} = require('./../../models/project');


const userOneId = new ObjectID();
const userTwoId = new ObjectID();

const projectOneId = new ObjectID();
const projectTwoId = new ObjectID();

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

const populateProjects = (done) => {
  Project.remove({}).then(() => {
    return Project.insertMany(projects);
  }).then(() => done());
};

const populateUsers = (done) => {
  User.remove({}).then(() => {
    var userOne = new User(users[0]).save();
    var userTwo = new User(users[1]).save();

    return Promise.all([userOne, userTwo])
  }).then(() => done());
};

module.exports = {projects, populateProjects, users, populateUsers};
