const router = require('express').Router();
var multer = require('multer');
const Dropbox = require('dropbox').Dropbox;
const fs = require('fs');
const fetch = require('node-fetch');
const { body, validationResult } = require('express-validator');

const auth = require('../middlewares/auth');
const { localsName } = require('ejs');
const Product = require('../models/Product');

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}

const multerConfig = {
    storage: multer.diskStorage({
        filename: (req, file, next) => {
            var filename = file.fieldname + '-' + Date.now() + '.' + file.mimetype.split('/')[1];
            next(null, filename);
        }
    })
}

router.get('/add', auth, (req, res) => {
    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    res.render('products/add', {
        activeTab: 'product',
        userName: loggedInUser.name,
        product: {}
    });
});

router.post(
    '/add',
    auth,
    multer(multerConfig).single('productImage'),
    [
        body('title').notEmpty().withMessage('Product title is required'),
        body('description').notEmpty().withMessage('Product description is required'),
        body('originalPrice').notEmpty().withMessage('Product price is required')
            .isNumeric().withMessage('Price value should be numeric'),
        body('discount').isNumeric().withMessage('Discount value should be numeric')
            .custom((discount, {req}) => {
                if (discount !== '') {
                    if (parseInt(discount) < 0) {
                        throw new Error('Discount cannot be less than 0');
                    } else if (parseInt(discount) > 99) {
                        throw new Error('Discount cannot be greater than 99');
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        )
    ],
    async (req, res) => {
        const errors = validationResult(req);

        const product = {
            title: req.body.title,
            description: req.body.description,
            size: {
                s: typeof req.body.size !== 'undefined' ? (req.body.size.s === 'on' ? true : false) : false,
                m: typeof req.body.size !== 'undefined' ? (req.body.size.m === 'on' ? true : false) : false,
                l: typeof req.body.size !== 'undefined' ? (req.body.size.l === 'on' ? true : false) : false,
                xl: typeof req.body.size !== 'undefined' ? (req.body.size.xl === 'on' ? true : false) : false
            },
            originalPrice: req.body.originalPrice,
            discount: req.body.discount,
            price: parseInt(req.body.originalPrice) - ( parseInt(req.body.originalPrice) * ( parseInt(req.body.discount) / 100 ) ),
            showOnBanner: req.body.showOnBanner  === 'on' ? true : false
        };

        let validation = true;

        const mimetypes = [
            'image/jpeg',
            'image/png'
        ];

        const loggedInUser = localStorage.getItem('user');

        if (!errors.isEmpty()) {
            errors.array({ onlyFirstError: true }).forEach(error => {
                switch (error.param) {
                    case 'title':
                        product.titleError = error.msg;
                        break;

                    case 'description':
                        product.descriptionError = error.msg;
                        break;

                    case 'originalPrice':
                        product.originalPriceError = error.msg;
                        break;

                    case 'discount':
                        product.discountError = error.msg;
                        break;

                    case 'price':
                        product.priceError = error.msg;
                        break;

                    default:
                        break;
                }
            });

            validation = false;
        }

        if (req.file === undefined) {
            product.imageError = 'Product image is required';
            validation = false;
        } else if (mimetypes.indexOf(req.file.mimetype) == -1) {
            product.imageError = 'Please select an image file';
            validation = false;
        } else if (req.file.size > (4 * 1024 * 1024)) {
            product.imageError = 'Image size must be less than 4 MB';
            validation = false;
        }

        if (req.body.size === undefined) {
            product.sizeError = 'Size is required';
            validation = false;
        }

        if (!validation) {
            res.render('products/add', {
                activeTab: 'product',
                userName: loggedInUser.name,
                product: product
            });
        } else {
            try {
                if (req.body.showOnBanner !== undefined) {
                    await Product.findOneAndUpdate({
                        show_on_banner: true
                    }, {
                        show_on_banner: false
                    });
                }

                const newProduct = new Product({
                    title: req.body.title,
                    description: req.body.description,
                    size: [
                        {
                            s: req.body.size.s === 'on' ? true : false,
                            m: req.body.size.m === 'on' ? true : false,
                            l: req.body.size.l === 'on' ? true : false,
                            xl: req.body.size.xl === 'on' ? true : false
                        }
                    ],
                    original_price: req.body.originalPrice,
                    discount: req.body.discount,
                    price: parseInt(req.body.originalPrice) - ( parseInt(req.body.originalPrice) * ( parseInt(req.body.discount) / 100 ) ),
                    show_on_banner: req.body.showOnBanner !== undefined ? true : false,
                    created_at: Date.now()
                });

                newProduct.save();

                var dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_KEY, fetch: fetch });

                fs.readFile(req.file.path, (err, contents) => {
                    if (err) {
                        console.log('Error: ', err);
                    }
                    
                    dbx.filesUpload({path: '/mern-e-commerce/products/' + newProduct._id +'/' + req.file.filename, contents: contents})
                    .then(async response => {
                        await dbx.sharingCreateSharedLink({path: response.path_lower});
                        const imgData = await dbx.sharingListSharedLinks({path: response.path_lower, direct_only: true});
                        
                        await Product.findByIdAndUpdate(newProduct._id, {
                            image: imgData.links[0].path_lower,
                            image_url: imgData.links[0].url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '')
                        });

                        req.flash('success', 'New product added');

                        res.redirect('/products');
                    })
                    .catch(err => {
                        req.flash('error', 'An unexpected error occured');

                        res.render('products/add', {
                            activeTab: 'product',
                            userName: loggedInUser.name,
                            product: product
                        });
                    })
                })
            } catch (e) {
                req.flash('error', 'An unexpected error occured');

                res.render('products/add', {
                    activeTab: 'product',
                    userName: loggedInUser.name,
                    product: product
                });
            }
        }
    }
);

router.get('/edit/:id', auth, async (req, res) => {
    const product = await Product.findById(req.params.id);

    const loggedInUser = JSON.parse(localStorage.getItem('user'));

    res.render('products/edit', {
        activeTab: 'product',
        userName: loggedInUser.name,
        product: product
    });
});

router.post(
    '/edit/:id',
    auth,
    multer(multerConfig).single('productImage'),
    [
        body('title').notEmpty().withMessage('Product title is required'),
        body('description').notEmpty().withMessage('Product description is required'),
        body('originalPrice').notEmpty().withMessage('Product price is required')
            .isNumeric().withMessage('Price value should be numeric'),
        body('discount').isNumeric().withMessage('Discount value should be numeric')
            .custom((discount, {req}) => {
                if (discount !== '') {
                    if (parseInt(discount) < 0) {
                        throw new Error('Discount cannot be less than 0');
                    } else if (parseInt(discount) > 99) {
                        throw new Error('Discount cannot be greater than 99');
                    } else {
                        return true;
                    }
                } else {
                    return true;
                }
            }
        )
    ],
    async (req, res) => {
        const productInfo = await Product.findById(req.params.id);

        if (productInfo) {
            const product = {
                _id: productInfo._id,
                title: req.body.title.length ? req.body.title : productInfo.title,
                description: req.body.description.length ? req.body.description : productInfo.description,
                size: [
                    {
                        s: typeof req.body.size !== 'undefined' ? (req.body.size.s === 'on' ? true : false) : false,
                        m: typeof req.body.size !== 'undefined' ? (req.body.size.m === 'on' ? true : false) : false,
                        l: typeof req.body.size !== 'undefined' ? (req.body.size.l === 'on' ? true : false) : false,
                        xl: typeof req.body.size !== 'undefined' ? (req.body.size.xl === 'on' ? true : false) : false,
                    }
                ],
                original_price: req.body.originalPrice.length ? req.body.originalPrice : productInfo.original_price,
                discount: req.body.discount.length ? req.body.discount : productInfo.discount,
                image_url: productInfo.image_url,
                show_on_banner: typeof req.body.showOnBanner !== 'undefined' ? true : false
            };

            product.price = parseInt(product.original_price) - (parseInt(product.original_price) * (parseInt(product.discount) / 100));

            let validation = true;

            const mimetypes = [
                'image/jpeg',
                'image/png'
            ];

            const errors = validationResult(req);

            if (!errors.isEmpty()) {
                errors.array({ onlyFirstError: true }).forEach(error => {
                    switch (error.param) {
                        case 'title':
                            product.titleError = error.msg;
                            break;

                        case 'description':
                            product.descriptionError = error.msg;
                            break;

                        case 'originalPrice':
                            product.originalPriceError = error.msg;
                            break;

                        case 'discount':
                            product.discountError = error.msg;
                            break;

                        default:
                            break;
                    }
                });

                validation = false;
            }

            if (req.file !== undefined) {
                if (mimetypes.indexOf(req.file.mimetype) == -1) {
                    product.imageError = 'Please select an image file';
                    validation = false;
                } else if (req.file.size > (4 * 1024 * 1024)) {
                    product.imageError = 'Image size must be less than 4 MB';
                    validation = false;
                }
            }

            if (req.body.size === undefined) {
                product.sizeError = 'Size is required';
                validation = false;
            }

            const loggedInUser = JSON.parse(localStorage.getItem('user'));

            if (!validation) {

                res.render('products/edit', {
                    activeTab: 'product',
                    userName: loggedInUser.name,
                    product: product
                });
            } else {
                try {
                    if (product.show_on_banner !== undefined) {
                        await Product.findOneAndUpdate({
                            show_on_banner: true
                        }, {
                            show_on_banner: false
                        });
                    }

                    await Product.findByIdAndUpdate(req.params.id, {
                        title: product.title,
                        description: product.description,
                        size: [
                            {
                                s: product.size[0].s ? true : false,
                                m: product.size[0].m ? true : false,
                                l: product.size[0].l ? true : false,
                                xl: product.size[0].xl ? true : false
                            }
                        ],
                        original_price: product.original_price,
                        discount: product.discount,
                        price: parseInt(product.original_price) - ( parseInt(product.original_price) * ( parseInt(product.discount) / 100 ) ),
                        show_on_banner: product.show_on_banner !== undefined ? true : false,
                        updated_at: Date.now()
                    });

                    if (req.file !== undefined) {
                        var dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_KEY, fetch: fetch });

                        await dbx.filesDeleteV2({path: productInfo.image});

                        fs.readFile(req.file.path, async (err, contents) => {
                            if (err) {
                                console.log('Error: ', err);
                            }
                            
                            await dbx.filesUpload({path: '/mern-e-commerce/products/' + product._id +'/' + req.file.filename, contents: contents})
                            .then(async response => {
                                await dbx.sharingCreateSharedLink({path: response.path_lower});
                                const imgData = await dbx.sharingListSharedLinks({path: response.path_lower, direct_only: true});
                                
                                await Product.findByIdAndUpdate(product._id, {
                                    image: imgData.links[0].path_lower,
                                    image_url: imgData.links[0].url.replace('www.dropbox.com', 'dl.dropboxusercontent.com').replace('?dl=0', '')
                                });
        
                                req.flash('success', 'New product added');
        
                                res.redirect('/products');
                            })
                            .catch(err => {
                                console.log(err);
                                res.render('products/edit', {
                                    activeTab: 'product',
                                    userName: loggedInUser.name,
                                    product: product,
                                    errorMsg: 'An unexpected error occured'
                                });
                            })
                        });
                    } else {
                        req.flash('success', 'Product data updated');

                        res.redirect('/products');
                    }
                } catch (e) {
                    console.log(e);
                    res.render('products/edit', {
                        activeTab: 'product',
                        userName: loggedInUser.name,
                        product: product,
                        errorMsg: 'An unexpected error occured'
                    });
                }
            }
        } else {
            req.flash('Product does not exists');

            res.redirect('/products');
        }
    }
);

router.post('/delete/:id', auth, async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        var dbx = new Dropbox({ accessToken: process.env.DROPBOX_ACCESS_KEY, fetch: fetch });

        try {
            await dbx.filesDeleteV2({path: product.image});

            await Product.findByIdAndDelete(req.params.id);

            req.flash('success', 'Product deleted');
        } catch (e) {
            console.log(e);
            req.flash('error', 'An unexpected error occured');
        }

        res.redirect('/products');
    } else {
        req.flash('error', 'Product does not exists');

        res.redirect('/products');
    }
});

module.exports = router;