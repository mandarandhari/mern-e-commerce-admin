var express = require('express');
var app = express();
var router = express.Router();
const path = require('path');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

if (typeof localStorage === "undefined" || localStorage === null) {
  var LocalStorage = require('node-localstorage').LocalStorage;
  localStorage = new LocalStorage('./scratch');
}

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

router.get('/ckeditor/ckeditor.js', (req, res) => {
  res.sendFile(path.join(path.resolve(), '/node_modules/@ckeditor/ckeditor5-build-classic/build/ckeditor.js'));
})

/* GET home page. */
router.get('/', auth, function(req, res, next) {
  res.redirect('/dashboard');
});

router.get('/login', function(req, res, next) {
  const user = localStorage.getItem('user');

  if (!user) {
    res.render('login', {
      error: '',
      username: ''
    });
  } else {
    res.redirect('/dashboard');
  }
});

router.get('/dashboard', auth, (req, res) => {
  const user = JSON.parse(localStorage.getItem('user'));

  res.render('dashboard', {
    activeTab: 'dashboard',
    userName: user.name
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
      const token = jwt.sign({
        id: user._id
      }, process.env.SECRET);

      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify({
        _id: user._id,
        name: user.name,
        email: user.email,
        created_at: user.created_at
      }));

      res.redirect('/dashboard');
    }
  }
});

router.post('/logout', auth, (req, res) => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');

  res.redirect('/login');
})

module.exports = router;
