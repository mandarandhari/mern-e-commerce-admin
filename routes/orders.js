const router = require('express').Router();
const moment = require('moment');

const auth = require('./../middlewares/auth');
const Order = require('./../models/Order');
const Customer = require('../models/Customer');

router.get('/', auth, async (req, res, next) => {
    let offset = 0;
    const limit = 10;

    let search_condition = {};

    if (req.query.searchterm && req.query.searchterm.length) {
        search_condition = {
            'order_id': {
                $regex: '.*' + req.query.searchterm + '.*'
            }
        }
    }

    let orderAggregate = Order.aggregate([
        {
            $match: {
                $and: [
                    {
                        payment_status: 'succeeded'
                    }, search_condition
                ]
            }
        }, {
            $lookup: {
                from: 'customers',
                localField: 'customer_id',
                foreignField: '_id',
                as: 'customer'
            }
        }, {
            $unwind: '$customer'
        }
    ]).sort({
        '_id': -1
    });

    await Order.aggregatePaginate(orderAggregate, {
        offset: offset,
        limit: limit
    }, (err, result) => {
        if (err) {
            console.log(err);
            res.redirect('/dashboard');
        } else {
            let orders = [];

            result.docs.forEach(order => {
                orders.push({
                    customer_name: order.customer.first_name + ' ' + order.customer.last_name,
                    order_id: order.order_id,
                    status: order.order_status,
                    created_at: moment(order.created_at).format('DD-MM-YYYY')
                });
            });

            res.render('orders/list', {
                activeTab: 'orders',
                userName: req.session.user.name,
                searchterm: req.query.searchterm ? req.query.searchterm : '',
                orders: orders,
                current: result.page,
                pages: result.totalPages,
                limit: result.limit,
                successMsg: req.flash('success'),
                errorMsg: req.flash('error')
            });
        }
    });
});

module.exports = router;