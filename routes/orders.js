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
            // $or: [
            //     {
            //         'order_id': {
            //             $regex: '.*' + req.query.searchterm + '.*'
            //         }
            //     }, {
            //         $regexFind: {
            //             input: '$customers.first_name',
            //             regex: '/' + req.query.searchterm + '/'
            //         }
            //     }, {
            //         $regexFind: {
            //             input: '$customers.last_name',
            //             regex: '/' + req.query.searchterm + '/'
            //         }
            //     }
            // ]
            $or: [
                {
                    'order_id': {
                        $regex: '.*' + req.query.searchterm + '.*'
                    }
                }, {
                    [Customer.first_name]: {
                        $regex: '.*' + req.query.searchterm + '.*'
                    }
                }, {
                    [Customer.last_name]: {
                        $regex: '.*' + req.query.searchterm + '.*'
                    }
                }
            ]
            // $or: [
            //     {
            //         'order_id': '/' + req.query.searchterm + '/'
            //     }, {
            //         'customers.first_name':  '/' + req.query.searchterm + '/'
            //     }, {
            //         'customers.last_name': '/' + req.query.searchterm + '/'
            //     }
            // ]
        }

        // console.log(search_condition);
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
        }, 
        // {
        //     $match: search_condition
        // }
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
console.log(result);
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