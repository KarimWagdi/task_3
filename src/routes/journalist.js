const express = require('express');
const router = express.Router();
const Journalist = require('../models/journalist');
const auth = require('../middleware/auth');
const multer = require('multer');


router.post('/signup', async (req, res) => {
  try {
    const journalist = new Journalist(req.body);
    const token = await journalist.generateToken();
    await journalist.save();
    res.status(201).send({ journalist, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});


router.post('/login', async (req, res) => {
  try {
    const journalist = await Journalist.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await journalist.generateToken();
    res.status(200).send({ journalist, token });
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.get('/profile', auth, async (req, res) => {
  res.status(200).send(req.journalist);
});


router.patch('/journalist', auth, async (req, res) => {
  try {
    const journalist = await Journalist.findByIdAndUpdate(
      req.journalist,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );
    if (!journalist) {
      return res.status(404).send('No journalist is found');
    }
    res.status(200).send(req.journalist);
  } catch (e) {
    res.status(400).send(e);
  }
});


router.delete('/journalist', auth, async (req, res) => {
  try {
    const journalist = await Journalist.findByIdAndDelete(req.journalist);
    if (!journalist) {
      return res.status(404).send('No journalist is found');
    }
    res.status(200).send(journalist);
  } catch (e) {
    res.status(500).send(e);
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

router.post('/profileImage',auth,uploads.single('image'),async (req, res) => {
    try {
      req.journalist.image = req.file.buffer;
      await req.journalist.save();
      res.send();
    } catch (e) {
      res.status(500).send(e);
    }
  }
);

module.exports = router;