const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ProductSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    size: [
        {
            s: {
                type: Boolean,
                default: false
            },
            m: {
                type: Boolean,
                default: false
            },
            l: {
                type: Boolean,
                default: false
            },
            xl: {
                type: Boolean,
                default: false
            }
        }
    ],
    original_price: {
        type: String,
        required: true
    },
    discount: {
        type: String,
        default: 0
    },
    price: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: null
    },
    image_url: {
        type: String,
        default: null
    },
    show_on_banner: {
        type: Boolean,
        default: false
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

ProductSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('products', ProductSchema);