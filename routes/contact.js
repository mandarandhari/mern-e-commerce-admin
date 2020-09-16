const router = require('express').Router();

const auth = require('./../middlewares/auth');
const Contact = require('./../models/Contact');

router.post('/delete/:id', auth, async (req, res) => {
    if (req.params.id) {
        const contact = await Contact.findById(req.params.id);

        if (contact) {
            try {
                await Contact.findByIdAndDelete(contact._id);

                req.flash('success', 'Contact deleted');
            } catch (error) {
                req.flash('error', 'Something went wrong');
            }
        } else {
            req.flash('error', 'Contact does not exists');
        }
    } else {
        req.flash('error', 'Something went wrong');
    }

    res.redirect('/contacts');
});

module.exports = router;