const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {User} = require('./../models/user');
const {Project} = require('./../models/project');
const {users, populateUsers, projects, populateProjects} = require('./seed/seed');

beforeEach(populateUsers);
beforeEach(populateProjects);



//#region USERS TESTS
describe('GET /users/me', () => {
  it('should return user if authenticated', (done) => {
    request(app)
      .get('/users/me')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body._id).toBe(users[0]._id.toHexString());
        expect(res.body.email).toBe(users[0].email);
      })
      .end(done);
  });

  it('should return 401 if not authenticated', (done) => {
    request(app)
      .get('/users/me')
      .expect(401)
      .expect((res) => {
        expect(res.body).toEqual({});
      })
      .end(done);
  });
});

describe('POST /users', () => {
  it('should create a user', (done) => {
    var email = 'example@example.com';
    var password = '123mnb!';

    request(app)
      .post('/users')
      .send({email, password})
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
        expect(res.body._id).toExist();
        expect(res.body.email).toBe(email);
      })
      .end((err) => {
        if (err) {
          return done(err);
        }

        User.findOne({email}).then((user) => {
          expect(user).toExist();
          expect(user.password).toNotBe(password);
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return validation errors if request invalid', (done) => {
    request(app)
      .post('/users')
      .send({
        email: 'and',
        password: '123'
      })
      .expect(400)
      .end(done);
  });

  it('should not create user if email in use', (done) => {
    request(app)
      .post('/users')
      .send({
        email: users[0].email,
        password: 'Password123!'
      })
      .expect(400)
      .end(done);
  });
});

describe('POST /users/login', () => {
  it('should login user and return auth token', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password
      })
      .expect(200)
      .expect((res) => {
        expect(res.headers['x-auth']).toExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens[1]).toInclude({
            access: 'auth',
            token: res.headers['x-auth']
          });
          done();
        }).catch((e) => done(e));
      });
  });

  it('should reject invalid login', (done) => {
    request(app)
      .post('/users/login')
      .send({
        email: users[1].email,
        password: users[1].password + '1'
      })
      .expect(400)
      .expect((res) => {
        expect(res.headers['x-auth']).toNotExist();
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[1]._id).then((user) => {
          expect(user.tokens.length).toBe(1);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('DELETE /users/me/token', () => {
  it('should remove auth token on logout', (done) => {
    request(app)
      .delete('/users/me/token')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        User.findById(users[0]._id).then((user) => {
          expect(user.tokens.length).toBe(0);
          done();
        }).catch((e) => done(e));
      });
  });

});

//#endregion

//#region PROJECTS TESTS
describe('POST/projects', () => {
  it('should create a new project', (done) => {
    var name = 'Test project name';

    request(app)
      .post('/projects')
      .set('x-auth', users[0].tokens[0].token)
      .send({name})
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe(name);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Project.find({name}).then((projects) => {
          expect(projects.length).toBe(1);
          expect(projects[0].name).toBe(name);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /projects', () => {
  it('should get all projects', (done) => {
    request(app)
      .get('/projects')
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.projects.length).toBe(1);
      })
      .end(done);
  });
});

describe('GET /projects/:id', () => {
  it('should return project doc', (done) => {
    request(app)
      .get(`/projects/${projects[0]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.project.text).toBe(projects[0].text);
      })
      .end(done);
  });

  it('should not return project doc created by other user', (done) => {
    request(app)
      .get(`/projects/${projects[1]._id.toHexString()}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if project not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .get(`/projects/${hexId}`)
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });

   it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/projects/123abc')
      .set('x-auth', users[0].tokens[0].token)
      .expect(404)
      .end(done);
  });
});

describe('DELETE /projects/:id', () => {
  it('should remove a project', (done) => {
    var hexId = projects[1]._id.toHexString();

    request(app)
      .delete(`/projects/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(200)
      .expect((res) => {
        expect(res.body.project._id).toBe(hexId);
      })
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Project.findById(hexId).then((project) => {
          expect(project).toNotExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should remove a project', (done) => {
    var hexId = projects[0]._id.toHexString();

    request(app)
      .delete(`/projects/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end((err, res) => {
        if (err) {
          return done(err);
        }

        Project.findById(hexId).then((project) => {
          expect(project).toExist();
          done();
        }).catch((e) => done(e));
      });
  });

  it('should return 404 if project not found', (done) => {
    var hexId = new ObjectID().toHexString();

    request(app)
      .delete(`/projects/${hexId}`)
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  it('should return 404 if object id is invalid', (done) => {
    request(app)
      .delete('/projects/123abc')
      .set('x-auth', users[1].tokens[0].token)
      .expect(404)
      .end(done);
  });

  /*PATCH PROJECTS TESTS*/
  describe('PATCH /projects/:id', () => {
    it('should update the project', (done) => {
      var hexId = projects[0]._id.toHexString();
      var description = 'This should be the new description';
  
      request(app)
        .patch(`/projects/${hexId}`)
        .set('x-auth', users[0].tokens[0].token)
        .send({
          description
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.project.description).toBe(description);
        })
        .end(done);
    });
  
    it('should not update the project created by other user', (done) => {
      var hexId = projects[0]._id.toHexString();
      var description = 'This should be the new description';
  
      request(app)
        .patch(`/projects/${hexId}`)
        .set('x-auth', users[1].tokens[0].token)
        .send({
          description
        })
        .expect(404)
        .end(done);
    });
  });
});
//#endregion


