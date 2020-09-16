const router = require('express').Router();
const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

const auth = require('../middlewares/auth');
const Order = require('../models/Order');
const Customer = require('../models/Customer');

const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_AUTH_USER,
        pass: process.env.EMAIL_AUTH_PASS
    }
});

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

                const customer = await Customer.findById(order.customer_id);

                if (req.body.status === 'shipped' || req.body.status === 'delivered' || req.body.status === 'cancelled') {
                    ejs.renderFile(path.join(path.resolve(), '/emails/order_status_update.ejs'), {
                        order: order,
                        order_status: req.body.status,
                        frontend_url: process.env.FRONTEND_URL
                    }, (err, data) => {
                        if (err) {
                            console.log(err);
                        } else {
                            const mainOptions = {
                                from: "'T shirt store' store@tshirtstore.com",
                                to: customer.email,
                                subject: req.body.status === 'shipped' ? 'Order Shipped' : ( req.body.status === 'delivered' ? 'Order Delivered' : 'Order Cancelled' ),
                                html: data
                            };

                            transporter.sendMail(mainOptions, (err, info) => {
                                if (err) {
                                    console.log(err);
                                }
                            });
                        }
                    });
                }

                return res.json({
                    status: true
                });
            } catch (error) {
                console.log(error);

                return res.json({
                    status: false
                });
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