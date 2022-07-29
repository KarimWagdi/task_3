const express = require('express');
const router = express.Router();
const News = require('../models/news');
const auth = require('../middleware/auth');
const multer = require('multer');

router.post('/addNews', auth, (req, res) => {

  const news = new News({ ...req.body, owner: req.journalist._id });
  news
    .save()
    .then(() => {
      res.status(200).send(news);
    })
    .catch((e) => {
      res.status(400).send(e);
    });
});

router.get('/allNews', auth, async (req, res) => {

  try {
    await req.journalist.populate('news');
    res.status(200).send(req.journalist.news);
  } 
  catch (e) {
    res.status(500).send(e.message);
  }
});

router.get('/news/:id', auth, async (req, res) => {

  try {
    const _id = req.params.id;
    const news = await News.findOne({ _id, owner: req.journalist._id });
    if (!news) {
      return res.status(404).send('No news is found');
    }
    res.status(200).send(news);
  } 
  catch (e) {
    res.status(500).send(e.message);
  }
});

router.patch('/news/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const news = await News.findOneAndUpdate(
      { _id, owner: req.journalist._id },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    if (!news) {
      return res.status(404).send('No news is found');
    }
    res.status(200).send(news);
  } 
  catch (e) {
    res.status(400).send(e.message);
  }
});

router.delete('/news/:id', auth, async (req, res) => {
  try {
    const _id = req.params.id;
    const news = await News.findOneAndDelete({
      _id,
      owner: req.journalist._id,
    });
    if (!news) {
      return res.status(404).send('No news is found');
    }
    res.status(200).send(news);
  }
   catch (e) {
    res.status(500).send(e.message);
  }
});

const uploads = multer({

  limits: {
    fileSize: 100000000000,
  },

  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|png|jpeg)$/)) {
      return cb(new Error('Please Upload an image'));
    }
    cb(null, true);
  },
});

router.post('/newsImage/:id',auth,uploads.single('image'),async (req, res) => {

    try {
      const _id = req.params.id;
      const news = await News.findOne({ _id,owner: req.journalist._id });

      if (!news) {
        return res.status(404).send('No news is found');
      } else {
        try {
          news.image = req.file.buffer;
          news.save();
          res.send('Image uploaded successfully');
        } catch (e) {
          res.status(500).send(e.message);
        }
      }
    } 
    catch (e) {
      res.status(500).send(e.message);
    }
  }
);

module.exports = router;