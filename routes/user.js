const router = require('express').Router();
const bcrypt = require('bcrypt');
const { body, validationResult } = require('express-validator');

const auth = require('../middlewares/auth');

const User = require('../models/User'); //User Model

router.get('/add', auth, (req, res) => {
    res.render('users/add', {
        activeTab: 'user',
        user: {},
        userName: req.session.user.name
    });
});

router.post(
    '/add',
    auth,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').trim()
            .notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide valid email')
            .custom(async (email, {req}) => {
                const isUserExists = await User.findOne({
                    email: email
                });

                if (isUserExists) {
                    throw new Error('User already exists');
                } else {
                    return true;
                }
            }
        ),
        body('password').trim()
            .notEmpty().withMessage('Password is required')
            .isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
        body('confirmPassword').trim()
            .notEmpty().withMessage('Confirm Password is required')
            .custom(async (confirmPassword, {req}) => {
                if (req.body.password != confirmPassword) {
                    throw new Error('Password not matching');
                } else {
                    return true;
                }
            })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        const user = {
            name: req.body.name,
            email: req.body.email,
        };

        if (!errors.isEmpty()) {
            errors.array({onlyFirstError: true}).forEach(error => {
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

            res.render('users/add', {
                activeTab: 'user',
                user: user,
                userName: req.session.user.name
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.body.password, salt);

            try {
                const newUser = new User({
                    name: req.body.name,
                    email: req.body.email,
                    password: password
                });

                await newUser.save();

                req.flash('success', 'New user added');
            } catch(e) {
                req.flash('error', 'Something went wrong');
            }
            res.redirect('/users');
        }
    }
);

router.get('/edit/:id', auth, async (req, res) => {
    const userEdit = await User.findById(req.params.id);

    if (userEdit) {
        let user = {
            _id: userEdit._id,
            name: userEdit.name,
            email: userEdit.email
        };

        res.render('users/edit', {
            activeTab: 'user',
            user: user,
            userName: req.session.user.name
        });
    } else {
        req.flash('error', 'Something went wrong');
        res.redirect('/users');
    }
});

router.post(
    '/edit/:id',
    auth,
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('password').trim().custom((password, {req}) => {
            if (password !== "" && password.length < 6) {
                throw new Error("Password must be at least 6 characters long");
            } else {
                return true;
            }
        }),
        body('confirmPassword').trim().custom((confirmPassword, {req}) => {
            if (req.body.password !== '') {
                if (confirmPassword === '') {
                    throw new Error('Confirm Password is required');
                } else if (confirmPassword !== req.body.password) {
                    throw new Error('Passwords not matching');
                } else {
                    return true;
                }
            } else {
                return true;
            }
        })
    ],
    async (req, res) => {
        const userEdit = await User.findById(req.params.id);

        if (userEdit) {
            const errors = validationResult(req);


            const user = {
                _id: userEdit._id,
                name: req.body.name != '' ? req.body.name : userEdit.name,
                email: userEdit.email,
                validation: true
            };

            if (!errors.isEmpty()) {
                errors.array({ onlyFirstError: true }).forEach(error => {
                    switch (error.param) {
                        case 'name':
                            user.nameError = error.msg;
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

                res.render('users/edit', {
                    activeTab: 'user',
                    user: user,
                    userName: req.session.user.name
                });
            } else {
                let updateData = {
                    name: req.body.name,
                    updated_at: Date.now()
                }

                if (req.body.password != '') {
                    const salt = await bcrypt.genSalt(10);
                    updateData.password = await bcrypt.hash(req.body.password, salt);
                }

                await User.findByIdAndUpdate(userEdit._id, updateData, { new: true });

                req.flash('success', 'User data updated');
            }
        } else {
            req.flash('error', 'User does not exist');
        }

        res.redirect('/users');
    }
)

router.post('/delete/:id', auth, async (req, res) => {
    const user = await User.findById(req.params.id);

    if (user) {
        await User.findByIdAndDelete(req.params.id);
        req.flash('success', 'User deleted');
    } else {
        req.flash('error', 'User does not exist');
    }

    res.redirect('/users');
});

module.exports = router;