const router = require('express').Router();

const Video = require('../model/Video')
const asyncHandler = require('express-async-handler')

const cloudinaryUploadVideo = require('../utlis/cloudinary');
const fs = require('fs');
const {Upload,postVideo} = require('../middleware/upload')

    

router.post("/video",Upload.single('.mp4'),
postVideo,asyncHandler(async(req,res) =>{
  const {title} = req.body;
  let VideoUrl;
  if (req.file) {
		const localPath = `public/video/posts/${req.file.filename}`;
		const uploadedVideo = await cloudinaryUploadVideo(localPath);
		VideoUrl = uploadedVideo.url;
		fs.unlinkSync(localPath);
	}

	try {
		const video = await Video.create({
			title,
			video: VideoUrl && VideoUrl,
		});

		res.json(video);
	} catch (error) {
		res.json({ message: error.message });
	}



 }))

router.get("/",asyncHandler(async(req,res) =>{
  try {
    const allVideo = await Video.find({})
    .sort('-createdAt');
    res.status(200).json(allVideo);
  } catch (error) {
    res.status(404).json(error.meesage);
  }



        
}))

module.exports = router