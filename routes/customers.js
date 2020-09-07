const router = require('express').Router();
const moment = require('moment');

const auth = require('../middlewares/auth');
const Customer = require('../models/Customer');

router.get('/', auth, (req, res) => {
    let offset = 0;
    const limit = 10;
    let searchquery = {};

    if (req.query.page) {
        offset = parseInt(req.query.page) > 1 ? limit * (parseInt(req.query.page) - 1) : offset;
    }

    if (req.query.searchterm) {
        searchquery = {
            $or: [
                {
                    first_name: {
                        $regex: '.*' + req.query.searchterm + '.*'
                    }
                },
                {
                    last_name: {
                        $regex: '.*' + req.query.searchterm + '.*'
                    }
                },
                {
                    email: {
                        $regex: '.*' + req.query.searchterm + '.*'
                    }
                }
            ]
        };
    }

    Customer.paginate(searchquery, {
        offset: offset,
        limit: limit
    })
    .then(result => {
        let customers = [];

        result.docs.forEach(customer => {
            customers.push({
                _id: customer._id,
                firstName: customer.first_name,
                lastName: customer.last_name,
                email: customer.email,
                phone: customer.phone,
                created_at: moment(customer.created_at).format('DD-MM-YYYY')
            });
        });

        res.render('customers/list', {
            activeTab: 'customers',
            userName: req.session.user.name,
            customers: customers,
            current: result.page,
            pages: result.totalPages,
            limit: result.limit,
            searchterm: req.query.searchterm ? req.query.searchterm : '',
            successMsg: req.flash('success'),
            errorMsg: req.flash('error')
        })
    });
});

module.exports = router;