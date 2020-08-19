const router = require('express').Router();

const auth = require('../middlewares/auth');

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

router.get('/', auth, (req, res) => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    res.render('products/list', {
        activeTab: 'products',
        userName: loggedInUser.name,
        products: {},
        searchterm: ''
    })
});

module.exports = router;