const multer = require('multer');
const sharp = require('sharp');
const path = require('path');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
	if (file.mimetype.startsWith('.mp4')) {
		cb(null, true);
	} else {
		cb(
			{
				message: 'Unsupported file format',
			},
			false
		);
	}
};

const Upload = multer({
	storage: multerStorage,
	filter: multerFilter,
	limits: {
		fileSize: 4000000,
	},
});

// Resize the profile image
const profilePhotoResize = async (req, res, next) => {
	if (!req.file) return next();

	req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

	await sharp(req.file.buffer)
		.resize(250, 250)
		.toFormat('jpeg')
		.jpeg({ quality: 90 })
		.toFile(path.join(`public/images/profile/${req.file.filename}`));

	// console.log('Resizing', req.file);

	next();
};

//upload video

const postVideo = async (req, res, next) => {
	if (!req.file) return next();

	req.file.filename = `user-${Date.now()}-${req.file.originalname}`;

	await sharp(req.file.buffer)
		.toFile(path.join(`public/images/video/${req.file.filename}`));

	next();
};

module.exports = { Upload, profilePhotoResize,  postVideo  };