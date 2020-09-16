const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ContactSchema = mongoose.Schema({
    name: {
        type: String
    },
    email: {
        type: String
    },
    message: {
        type: String
    },
    created_at: {
        type: Date
    }
});

ContactSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('contacts', ContactSchema);