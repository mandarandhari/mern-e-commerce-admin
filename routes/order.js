const router = require('express').Router();
const auth = require('../middlewares/auth');
const Order = require('../models/Order');

router.get('/view/:order_id', auth, async (req, res) => {
    if (req.params.order_id) {
        const order = await Order.aggregate([
            {
                $match: {
                    order_id: req.params.order_id
                }
            }, {
                $lookup: {
                    from: 'order_has_products',
                    localField: 'order_id',
                    foreignField: 'order_id',
                    as: 'order_has_products'
                }
            }, {
                $unwind: '$order_has_products'
            }, {
                $lookup: {
                    from: 'products',
                    localField: 'order_has_products.product_id',
                    foreignField: '_id',
                    as: 'products'
                }
            }, {
                $unwind: '$products'
            }, {
                $lookup: {
                    from: 'invoice_addresses',
                    localField: 'order_id',
                    foreignField: 'order_id',
                    as: 'invoice_address'
                }
            }, {
                $unwind: '$invoice_address'
            }, {
                $lookup: {
                    from: 'shipping_addresses',
                    localField: 'order_id',
                    foreignField: 'order_id',
                    as: 'shipping_address'
                }
            }, {
                $unwind: '$shipping_address'
            }, {
                $group: {
                    "_id": "$order_id",
                    "price": {
                        "$first": "$total_price"
                    },
                    "transaction_id": {
                        "$first": "$transaction_id"
                    },
                    "order_status": {
                        "$first": "$order_status"
                    },
                    "order_has_products": {
                        $push: {
                            "_id": '$order_has_products._id',
                            "quantity": '$order_has_products.quantity',
                            "size": '$order_has_products.size',
                            "product_details": '$products'
                        }
                    },
                    "invoice_address": {
                        '$first': '$invoice_address'
                    },
                    "shipping_address": {
                        '$first': '$shipping_address'
                    }
                }
             }
        ]);

        console.log(order);

        res.render('orders/view', {
            activeTab: 'orders',
            userName: req.session.user.name,
            order: order[0]
        });
    } else {
        res.redirect('/dashboard');
    }
});

router.post('/change_status/:order_id', auth, async (req, res) => {
    if (req.params.order_id) {
        const order = await Order.findOne({
            order_id: req.params.order_id
        });

        if (order) {
            try {
                await Order.findOneAndUpdate({
                    order_id: req.params.order_id
                }, {
                    order_status: req.body.order_status
                });

                return res.json({
                    status: true
                })
            } catch (error) {
                console.log(error);

                return res.json({
                    status: false
                })
            }
        } else {
            return res.json({
                status: false
            });
        }
    } else {
        return res.json({
            status: false
        });
    }
})

module.exports = router;