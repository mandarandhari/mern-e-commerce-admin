const jwt = require('jsonwebtoken');

if (typeof localStorage === 'undefined' || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

const auth = (req, res, next) => {
    const token = localStorage.getItem('token');

    try {
        jwt.verify(token, process.env.SECRET);
    } catch (error) {
        res.redirect('/login');
    }

    next();
}

module.exports = auth;