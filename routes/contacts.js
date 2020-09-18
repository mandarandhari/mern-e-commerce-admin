const router = require('express').Router();
const moment = require('moment');

const Contact = require('./../models/Contact');
const auth =  require('./../middlewares/auth');

router.get('/', auth, async (req, res) => {
    let offset = 0;
    const limit = 10;
    let searchquery = {};

    await Contact.paginate(searchquery, {
        offset: offset,
        limit: limit,
        sort: {
            _id: -1
        }
    }).then(result => {
        let contacts = [];

        result.docs.forEach(contact => {
            contacts.push({
                _id: contact._id,
                name: contact.name,
                email: contact.email,
                message: contact.message,
                added_on: moment(contact.created_on).format('DD-MM-YYYY')
            });
        });

        res.render('contacts', {
            activeTab: 'contacts',
            userName: req.session.user.name,
            contacts: contacts,
            current: result.page,
            pages: result.totalPages,
            limit: result.limit,
            searchterm: req.query.searchterm ? req.query.searchterm : '',
            successMsg: req.flash('success'),
            errorMsg: req.flash('error')
        });
    });
});

module.exports = router;