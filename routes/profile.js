const router = require('express').Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const auth = require('../middlewares/auth');

const User = require('../models/User');

router.get('/', auth, async (req, res) => {
    let user = {
        name: '',
        nameError: '',
        email: '',
        emailError: '',
        password: '',
        passwordError: '',
        confirmPassword: '',
        confirmPasswordError: ''
    };

    user.name = req.session.user.name;
    user.email = req.session.user.email;

    res.render('profile', {
        activeTab: 'profile',
        user: user,
        userName: req.session.user.name,
        successMsg: req.flash('success')
    });
});

router.post(
    '/',
    auth,
    [
        body('name').not().isEmpty().withMessage('Name is required')
    ],
    async (req, res) => {
    let user = {
        _id: req.session.user._id,
        name: req.body.name != '' ? req.body.name : req.session.user.name,
        nameError: '',
        email: req.session.user.email,
        emailError: '',
        password: '',
        passwordError: '',
        confirmPassword: '',
        confirmPasswordError: '',
        validation: true
    };

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        errors.forEach(error => {
            switch (error.param) {
                case 'name':
                    user.nameError = error.msg;
                    break;

                default:
                    return;
            }
        });

        user.validation = false;
    }

    if (req.body.password != '') {
        if (req.body.password.length >= 6) {
            if (req.body.confirmPassword != '') {
                if (req.body.password != req.body.confirmPassword) {
                    user.confirmPasswordError = 'Passwords not matching';
                    user.validation = false;
                }
            } else {
                user.confirmPasswordError = 'Confirm password field is required';
                user.validation = false;
            }
        } else {
            user.passwordError = 'Password must be at least 6 characters long';
            user.validation = false;
        }
    }

    if (!user.validation) {
        res.render('profile', {
            activeTab: 'profile',
            user: user,
            userName: user.name
        });
    } else {
        let profileData = {
            name: req.body.name,
            updated_at: Date.now()
        };

        if (req.body.password != '') {
            const salt = await bcrypt.genSalt(10);
            profileData.password = await bcrypt.hash(req.body.password, salt);
        }

        const updatedUser = await User.findByIdAndUpdate(user._id, profileData, { new: true });

        req.session.user = {
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            created_at: updatedUser.created_at
        }

        req.flash('success', 'Profile updated');

        res.redirect('/profile');
    }
});

module.exports = router;