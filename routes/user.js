const router = require('express').Router();
const bcrypt = require('bcrypt');

const User = require('../models/User');

const user = {
    name: '',
    nameError: '',
    email: '',
    emailError: '',
    password: '',
    passwordError: '',
    confirmPassword: '',
    confirmPasswordError: ''
};

router.get('/add', (req, res) => {
    res.render('users/add', {
        activeTab: 'user',
        user: user
    });
});

router.post('/add', async (req, res) => {
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('aaaaaa', salt);

    const newUser = new User({
        name: 'Admin',
        email: 'admin@test.com',
        password: password
    });

    newUser.save();

    res.redirect('/users');
})

module.exports = router;