const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const mongooseAggregatePaginate = require('mongoose-aggregate-paginate-v2');

const OrderSchema = new mongoose.Schema({
    order_id: {
        type: String,
        required: true
    },
    customer_id: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'customers'
    },
    products: {
        type: Array,
        required: true
    },
    invoice_address: {
        type: Object,
        required: true
    },
    shipping_address: {
        type: Object,
        required: true
    },
    total_price: {
        type: Number,
        required: true
    },
    order_status: {
        type: String,
        required: false,
        default: null
    },
    transaction_id: {
        type: String,
        required: false,
        default: null
    },
    payment_status: {
        type: String,
        required: false,
        default: null
    },
    created_at: {
        type: Date,
        default: Date.now()
    },
    updated_at: {
        type: Date,
        default: null
    }
});

OrderSchema.plugin(mongoosePaginate);
OrderSchema.plugin(mongooseAggregatePaginate);

module.exports = mongoose.model('orders', OrderSchema);