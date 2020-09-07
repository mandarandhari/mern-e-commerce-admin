var express = require('express');
var router = express.Router();
var moment = require('moment');

const auth = require('../middlewares/auth'); //Auth Middleware
const User = require('../models/User');

/* GET users listing. */
router.get('/', auth, function(req, res, next) {
  let offset = 1;
  const limit = 10;

  if (req.query.page) {
    offset = parseInt(req.query.page) > 1 ? limit * (parseInt(req.query.page) - 1) + 1 : offset;
  }

  var searchterm = {
    _id: { $ne: req.session.user._id }
  };

  if (req.query.searchterm) {
    searchterm = {
      $and: [
        {
          _id: { $ne: req.session.user._id }
        },
        {
          $or: [
            {
              'name': {
                $regex: '.*' + req.query.searchterm + '.*' 
              }
            },
            {
              'email': {
                $regex: '.*' + req.query.searchterm + '.*'
              }
            }
          ]
        }
      ]
      
    };
  }

  User.paginate(searchterm, {
    offset: offset,
    limit: limit
  })
  .then(result => {
    let users =[];

    result.docs.forEach(user => {
      users.push({
        _id: user._id,
        name: user.name,
        email: user.email,
        created_at: moment(user.created_at).format('DD-MM-YYYY')
      })
    })

    res.render('users/list', {
      activeTab: 'users',
      userName: req.session.user.name,
      users: users,
      current: result.page,
      pages: result.totalPages,
      limit: result.limit,
      searchterm: req.query.searchterm ? req.query.searchterm : '',
      successMsg: req.flash('success'),
      errorMsg: req.flash('error')
    });
  });
});

module.exports = router;
