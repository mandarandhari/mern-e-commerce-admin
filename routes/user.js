const router = require('express').Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const auth = require('../middlewares/auth');

const User = require('../models/User'); //User Model

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

router.get('/add', auth, (req, res) => {
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

    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    res.render('users/add', {
        activeTab: 'user',
        user: user,
        userName: loggedInUser.name
    });
});

router.post(
    '/add',
    auth,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').trim().isEmail().withMessage('Email is required'),
        body('password').isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
        body('confirmPassword').custom(async (confirmPassword, {req}) => {
            if (req.body.password != confirmPassword) {
                throw new Error('Password not matching');
            }
        })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        const user = {
            name: req.body.name,
            nameError: '',
            email: req.body.email,
            emailError: '',
            password: '',
            passwordError: '',
            confirmPassword: '',
            confirmPasswordError: '',
            validation: true
        };

        if (!errors.isEmpty()) {
            errors.errors.forEach(error => {
                switch (error.param) {
                    case 'name':
                        user.nameError = error.msg;
                        break;

                    case 'email':
                        user.emailError = error.msg;
                        break;

                    case 'password':
                        user.passwordError = error.msg;
                        break;

                    case 'confirmPassword':
                        user.confirmPasswordError = error.msg;
                        break;
                    
                    default:
                        return;
                }
            });

            user.validation = false;
        }

        if (user.email != '' && user.emailError == '') {
            const isUserExists = await User.findOne({
                email: user.email
            });

            if (isUserExists) {
                user.emailError = 'User already exists';
                user.validation = false;
            }
        }

        if (!user.validation) {
            const loggedInUser = JSON.parse(localStorage.getItem('user'));

            res.render('users/add', {
                activeTab: 'user',
                user: user,
                userName: loggedInUser.name
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.body.password, salt);

            const newUser = new User({
                name: req.body.name,
                email: req.body.email,
                password: password
            });

            newUser.save();

            res.redirect('/users');
        }
    }
);

router.get('/edit/:id', auth, async (req, res) => {
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

    const userEdit = await User.findById(req.params.id);

    user.name = userEdit.name;
    user.email = userEdit.email;
    user._id = userEdit._id;

    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    res.render('users/edit', {
        activeTab: 'user',
        user: user,
        userName: loggedInUser.name
    });
});

router.post(
    '/edit/:id',
    auth,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').trim().isEmail().withMessage('Email is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);

        const userEdit = await User.findById(req.params.id);

        const user = {
            _id: userEdit._id,
            name: req.body.name ? req.body.name : userEdit.name,
            nameError: '',
            email: req.body.email ? req.body.email : userEdit.email,
            emailError: '',
            password: '',
            passwordError: '',
            confirmPassword: '',
            confirmPasswordError: '',
            validation: true
        };

        if (!errors.isEmpty()) {
            errors.errors.forEach(error => {
                switch (error.param) {
                    case 'name':
                        user.nameError = error.msg;
                        break;

                    case 'email':
                        user.emailError = error.msg;
                        break;

                    case 'password':
                        user.passwordError = error.msg;
                        break;

                    case 'confirmPassword':
                        user.confirmPasswordError = error.msg;
                        break;
                    
                    default:
                        return;
                }
            });

            user.validation = false;
        }

        if (user.email != '' && user.emailError == '') {
            const isUserExists = await User.findOne({
                $and: [
                    {
                        email: req.body.email
                    },
                    {
                        _id: { $ne: req.params.id }
                    }
                ]
                
            });

            if (isUserExists) {
                user.emailError = 'User already exists';
                user.validation = false;
            }
        }

        if (req.body.password != '') {
            if (req.body.confirmPassword != '') {
                if (req.body.password != req.body.confirmPassword) {
                    user.confirmPasswordError = 'Passwords not matching';
                }
            } else {
                user.confirmPasswordError = 'Confirm password field is required';
            }
        }

        if (!user.validation) {
            const loggedInUser = JSON.parse(localStorage.getItem('user'));

            res.render('users/edit', {
                activeTab: 'user',
                user: user,
                userName: loggedInUser.name
            });
        } else {
            let updateData = {
                name: req.body.name
            }

            if (req.body.password != '') {
                const salt = await bcrypt.genSalt(10);
                updateData.password = await bcrypt.hash(req.body.password, salt);
            }

            await User.findByIdAndUpdate(userEdit._id, updateData, { new: true });

            res.redirect('/users');
        }
    }
)

module.exports = router;