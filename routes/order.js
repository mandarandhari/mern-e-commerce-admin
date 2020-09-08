const router = require('express').Router();
const auth = require('../middlewares/auth');
const Order = require('../models/Order');

router.get('/view/:order_id', auth, async (req, res) => {
    if (req.params.order_id) {
        const order = await Order.findOne({
            order_id: req.params.order_id
        });

        console.log(order);

        res.render('orders/view', {
            activeTab: 'orders',
            userName: req.session.user.name,
            order: order
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
                    order_status: req.body.status,
                    updated_at: Date.now()
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