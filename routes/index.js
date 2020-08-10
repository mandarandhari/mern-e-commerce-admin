var express = require('express');
var app = express();
var router = express.Router();
const path = require('path');

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

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/login');
});

router.get('/login', function(req, res, next) {
  res.render('login');
});

router.get('/dashboard', (req, res) => {
  res.render('dashboard', {
    activeTab: 'dashboard'
  });
});

module.exports = router;
