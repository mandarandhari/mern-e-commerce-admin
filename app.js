var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var session = require('express-session');
var flash = require('req-flash');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var userRouter = require('./routes/user');
var customersRouter = require('./routes/customers');
var customerRouter = require('./routes/customer');
var profileRouter = require('./routes/profile');
var productsRouter = require('./routes/products');
var productRouter = require('./routes/product');
var ordersRouter = require('./routes/orders');
var orderRouter = require('./routes/order');
var contactsRouter = require('./routes/contacts');
var contactRouter = require('./routes/contact');

var app = express();

var connectDB = require('./config/db');
connectDB();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true
}));
app.use(flash());

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/user', userRouter);
app.use('/profile', profileRouter);
app.use('/customers', customersRouter);
app.use('/customer', customerRouter);
app.use('/products', productsRouter);
app.use('/product', productRouter);
app.use('/orders', ordersRouter);
app.use('/order', orderRouter);
app.use('/contacts', contactsRouter);
app.use('/contact', contactRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
