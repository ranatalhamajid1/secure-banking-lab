const multer = require('multer');
const path = require('path');


// storage

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(null, 'uploads/');

    },


    filename: (req, file, cb) => {

        cb(
            null,
            Date.now() + path.extname(file.originalname)
        );

    }

});


// allow images only

const fileFilter = (req, file, cb) => {

    if (
        file.mimetype === 'image/jpeg' ||
        file.mimetype === 'image/png'
    ) {

        cb(null, true);

    } else {

        cb(
            new Error('Only images allowed'),
            false
        );

    }

};


const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 2 * 1024 * 1024
    }

});


module.exports = upload;