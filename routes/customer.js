const router = require('express').Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

const auth = require('../middlewares/auth');
const Customer = require('../models/Customer');

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

router.get('/add', auth, (req,res) => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    res.render('customers/add', {
        activeTab: 'customer',
        customer: {},
        userName: loggedInUser.name
    });
});

router.post(
    '/add',
    auth,
    [
        body('firstName').trim().notEmpty().withMessage('Firstname is required'),
        body('lastName').trim().notEmpty().withMessage('Lastname is required'),
        body('email').trim().notEmpty().withMessage('Email is required')
            .isEmail().withMessage('Please provide valid email')
            .custom(async (email, {req}) => {
                const customerExist = await Customer.findOne({
                    email: email
                });

                if (customerExist) {
                    throw new Error('Customer already exists');
                } else {
                    return true
                }
            }),
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('password').trim().notEmpty().withMessage('Password is required')
            .isLength({min: 6}).withMessage('Password must be at least 6 characters long'),
        body('confirmPassword').trim().notEmpty().withMessage('Confirm Password is required')
            .custom((confirmPassword, {req}) => {
                if (confirmPassword !== req.body.password) {
                    throw new Error('Passwords not matching');
                } else {
                    return true;
                }
            })
    ],
    async (req, res) => {
        const customer = {
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email,
            phone: req.body.phone
        };

        const loggedInUser = JSON.parse(localStorage.getItem('user'));

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            errors.array({ onlyFirstError: true }).forEach(error => {
                switch (error.param) {
                    case 'firstName':
                        customer.firstNameError = error.msg;
                        break;

                    case 'lastName':
                        customer.lastNameError = error.msg;
                        break;

                    case 'email':
                        customer.emailError = error.msg;
                        break;

                    case 'phone':
                        customer.phoneError = error.msg;
                        break;

                    case 'password':
                        customer.passwordError = error.msg;
                        break;

                    case 'confirmPassword':
                        customer.confirmPasswordError = error.msg
                        break;

                    default:
                        break;
                }
            });

            res.render('customers/add', {
                activeTab: 'customer',
                customer: customer,
                userName: loggedInUser.name
            });
        } else {
            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.body.password, salt);

            try {
                const customerData = new Customer({
                    first_name: req.body.firstName,
                    last_name: req.body.lastName,
                    email: req.body.email,
                    phone: req.body.phone,
                    password: password
                });

                await customerData.save();

                req.flash('success', 'New customer added');
            } catch (e) {
                req.flash('error', 'Something went wrong');
            }

            res.redirect('/customers');
        }
    }
);

router.get('/edit/:id', auth, async (req, res) => {
    const editCustomer = await Customer.findById(req.params.id);

    if (editCustomer) {
        const customer = {
            _id: editCustomer._id,
            firstName: editCustomer.first_name,
            lastName: editCustomer.last_name,
            email: editCustomer.email,
            phone: editCustomer.phone
        };

        const loggedInUser = JSON.parse(localStorage.getItem('user'));

        res.render('customers/edit', {
            activeTab: customer,
            customer: customer,
            userName: loggedInUser.name
        });
    } else {
        req.flash('error', 'Customer does not exists');
        res.redirect('/customers');
    }
});

router.post(
    '/edit/:id',
    auth,
    [
        body('firstName').trim().notEmpty().withMessage('Firstname is required'),
        body('lastName').trim().notEmpty().withMessage('Lastname is required'),
        body('phone').trim().notEmpty().withMessage('Phone number is required'),
        body('password').trim().custom((password, {req}) => {
            if (password !== '' && password.length < 6) {
                throw new Error('Password must be at least 6 characters long');
            } else {
                return true;
            }
        }),
        body('confirmPassword').trim().custom((confirmPassword, {req}) => {
            if (req.body.password !== '') {
                if (confirmPassword !== req.body.password) {
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
        const customerEdit = await Customer.findById(req.params.id);

        if (customerEdit) {
            const customer = {
                _id: req.params.id,
                firstName: req.body.firstName.length ? req.body.firstName : customerEdit.first_name,
                lastName: req.body.lastName.length ? req.body.lastName : customerEdit.last_name,
                email: customerEdit.email,
                phone: req.body.phone.length ? req.body.phone : customerEdit.phone
            }

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                errors.array({ onlyFirstError: true }).forEach(error => {
                    switch (error.param) {
                        case 'firstName':
                            customer.firstNameError = error.msg;
                            break;

                        case 'lastName':
                            customer.lastNameError = error.msg;
                            break;

                        case 'phone':
                            customer.firstNameError = error.msg;
                            break;

                        case 'password':
                            customer.passwordError = error.msg;
                            break;

                        case 'confirmPassword':
                            customer.confirmPasswordError = error.msg;
                            break;

                        default:
                            break;
                    }
                });

                const loggedInUser = JSON.parse(localStorage.getItem('user'));

                res.render('customers/edit', {
                    activeTab: 'customer',
                    customer: customer,
                    userName: loggedInUser.name
                });
            } else {
                console.log(customer);
                const customerData = {
                    first_name: customer.firstName,
                    last_name: customer.lastName,
                    phone: customer.phone,
                    updated_at: Date.now()
                };

                if (req.body.password !== '' && req.body.confirmPassword !== '') {
                    const salt = await bcrypt.genSalt(10);
                    customerData.password = await bcrypt.hash(req.body.password, salt);
                }

                try {
                    await Customer.findByIdAndUpdate(req.params.id, customerData, { new: true });

                    req.flash('success', 'Customer data updated');
                } catch(e) {
                    req.flash('error', 'Something went wrong');
                }

                res.redirect('/customers');
            }
        } else {
            req.flash('error', 'Customer does not exists');
            redirect('/customers');
        }
    }
);

router.post('/delete/:id', auth, async (req, res) => {
    try {
        await Customer.findByIdAndDelete(req.params.id);

        req.flash('success', 'Customer deleted');
    } catch (e) {
        req.flash('error', 'Something went wrong');
    }

    res.redirect('/customers');
});

module.exports = router;