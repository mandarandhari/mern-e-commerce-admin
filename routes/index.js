var express = require('express');
var app = express();
var router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
var session = require('express-session');

const auth = require('../middlewares/auth'); //Middleware
const User = require('../models/User'); //User Model

app.use(express.static(__dirname + '/public'));

router.get('/fontawesome-free/css/fontawesome.min.css', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/@fortawesome/fontawesome-free/css/fontawesome.min.css'));
});

router.get('/fontawesome-free/css/regular.min.css', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/@fortawesome/fontawesome-free/css/regular.min.css'));
});

router.get('/fontawesome-free/css/brands.min.css', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/@fortawesome/fontawesome-free/css/brands.min.css'));
});

router.get('/fontawesome-free/css/solid.min.css', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/@fortawesome/fontawesome-free/css/solid.min.css'));
});

router.get('/fontawesome-free/webfonts/fa-solid-900.woff2', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/@fortawesome/fontawesome-free/webfonts/fa-solid-900.woff2'));
});

router.get('/fontawesome-free/webfonts/fa-solid-900.woff', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/@fortawesome/fontawesome-free/webfonts/fontawesome-free/webfonts/fa-solid-900.woff'));
});

router.get('/fontawesome-free/webfonts/fa-regular-400.woff2', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.woff2'));
});

router.get('/fontawesome-free/webfonts/fa-regular-400.woff', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/@fortawesome/fontawesome-free/webfonts/fa-regular-400.woff'));
});

router.get('/admin-lte/dist/css/adminlte.min.css', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/admin-lte/dist/css/adminlte.min.css'));
});

router.get('/icheck-bootstrap/icheck-bootstrap.min.css', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/icheck-bootstrap/icheck-bootstrap.min.css'));
});

router.get('/jquery/dist/jquery.js', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/jquery/dist/jquery.js'));
});

router.get('/bootstrap/dist/js/bootstrap.bundle.js', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/bootstrap/dist/js/bootstrap.bundle.js'));
});

router.get('/admin-lte/dist/js/adminlte.js', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/admin-lte/dist/js/adminlte.js'));
});

router.get('/toastr/build/toastr.min.css', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/toastr/build/toastr.min.css'));
});

router.get('/toastr/build/toastr.min.js', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/toastr/build/toastr.min.js'));
});

/* GET home page. */
router.get('/', auth, function(req, res, next) {
  res.redirect('/dashboard');
});

router.get('/login', function(req, res, next) {
  if (!req.session.user) {
    res.render('login', {
      error: '',
      username: ''
    });
  } else {
    res.redirect('/dashboard');
  }
});

router.get('/dashboard', auth, (req, res) => {
  res.render('dashboard', {
    activeTab: 'dashboard',
    userName: req.session.user.name
  });
});

router.post('/login', async (req, res) => {
  const user = await User.findOne({
    email: req.body.email
  });

  if (!user) {
    res.render('login', {
      error: 'Invalid credentials',
      username: req.body.email
    });
  } else {
    const match = await bcrypt.compare(req.body.password, user.password);

    if (!match) {
      res.render('login', {
        error: 'Invalid credentials',
        username: req.body.email
      });
    } else {
      req.session.user = {
        _id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }

      if (req.body.remember === 'on') {
        req.session.cookie.maxAge = 3600*24*365;
      }

      res.redirect('/dashboard');
    }
  }
});

router.post('/logout', auth, (req, res) => {
  req.session.destroy();

  res.redirect('/login');
})

module.exports = router;
