'use strict';

var async = require('async');
require('colors');
var request = require('supertest');

var app = require('../app');
var User = require('../api/user/user.model');

var answerData = {
  createdAt: new Date(),
  paymentOption: 'email',
  answers: [
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    },
    {
      phrase: 'qwe',
      category: 'asd',
      time: 0.5
    }
  ]
};

var jobData = {
  title: 'Task',
  stream: 'Testing',
  workers: 4,
  publication: {
    status: 'DRAFT'
  },
  textsPerTask: 20,
  amount: 0.020,
  amountByPhrase: 1,
  skipCK: true,
  input: {
    corpus: [
      'x men the last stand the game',
      'sundresses',
      'blackberry creek association elburn il',
      'irish wedding cake tops',
      'mens rights',
      'san leandro california history',
      'critter ridder book',
      'volunteer work in dayton ohio',
      'horse farms for sale in saratoga springs',
      'split rock resort',
      'myrtle beach top restaurants',
      'zone alarm utility suite',
      'lycos.com',
      'youth stuff',
      'pittsburgh police',
      'bathroom television',
      'houses for sell in florence sc',
      'fidelity.com',
      'james blunt tickets',
      'cantante sheila',
      'angela winbush',
      'plentyoffish.com',
      'cartoon network',
      'mapquest',
      'arrhythmia',
      'new homes chicago',
      '1980 pulitzer book',
      'www lists of celebrities that have posed nude for playboy',
      'mothers and daughters',
      'baby shower ideas'
    ],
    dataType: 'Human Text Classification'
  }
};

var taxonomyData = {
  title: 'lorem',
  categories: [
    {test: 'test'},
    {test2: 'test2'}
  ],
  categoryName: 'Category',
  maxCategoriesPerText: 1,
  onlyLastLevelCategories: true
};

var users = [
  {
    provider: 'local',
    name: 'Al',
    email: 'al@test.com',
    bitcoinAddress: 'mvaiTcwyVXbsbqV4KwSnJbw7vGHuLqmZVk',
    password: 'password'
  }, {
    provider: 'local',
    name: 'Bob',
    email: 'bob@test.com',
    password: 'password'
  }, {
    provider: 'local',
    name: 'Chas',
    email: 'chas@test.com',
    password: 'password'
  }, {
    provider: 'local',
    name: 'Dave',
    email: 'dave@test.com',
    password: 'password'
  }, {
    provider: 'local',
    name: 'Ed',
    email: 'ed@test.com',
    password: 'password'
  }, {
    provider: 'local',
    name: 'Fred',
    email: 'fred@test.com',
    password: 'password'
  }, {
    provider: 'local',
    name: 'George',
    email: 'george@test.com',
    password: 'password'
  }, {
    provider: 'local',
    role: 'admin',
    name: 'Admin',
    email: 'nhx@eircom.net',
    password: 'admin'
  }
];

var Seed = {
  isLoggingEnabled: true,

  _ids: {},
  tokens: {},
  users: [],
  workerResponses: [],

  answerData: answerData,
  jobData: jobData,
  taxonomyData: taxonomyData,

  seedUsers: seedUsers
};

module.exports = Seed;

// Implementation below

function seedUsers (done) {
  User
    .find({})
    .remove()
    .then(function () {
      User.create(users, function () {
        Seed.users = users;
        _authAll(done);

        if (Seed.isLoggingEnabled) {
          console.log('*Seeding Users finished'.cyan);
        }
      });
    });
}

function _auth (email, password, callback) {
  request(app)
    .post('/api/auth/local')
    .send({
      email: email,
      password: password
    })
    .end(function (err, res) {
      if (err) {
        return callback(err);
      }

      var token = res.body.token;
      request(app)
        .get('/api/users/me')
        .set('Authorization', 'Bearer ' + token)
        .end(function (meErr, profileRes) {
          profileRes.body.token = token;
          callback(profileRes.body);
        });
    });
}

function _authAll (done) {
  async.each(Seed.users, function (user, cb) {
    _auth(user.email, user.password, function (resp) {
      user.token = resp.token;

      Seed.tokens[user.name] = resp.token;
      Seed._ids[user.name] = resp._id;

      cb();
    });
  }, done);
}
