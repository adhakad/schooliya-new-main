'use strict';
const express = require('express');
const router = express.Router();
const fileUpload = require('../helpers/file-upload');
const {GetSingleSchoolNameLogo,GetSingleSchool,CreateSchool,UpdateSchool,DeleteSchool} = require('../controllers/school');

router.get('/name-logo',GetSingleSchoolNameLogo);
router.get('/:id',GetSingleSchool);
// router.post('/',fileUpload.schoolLogo.single('schoolLogo'),CreateSchool);
router.post('/', (req, res) => {
    fileUpload.schoolLogo.single('schoolLogo')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json('Upload logo under 50KB size limit');
        }
        return res.status(400).json('Upload logo under 50KB size limit');
      }
      // Call the controller function to create the school
      CreateSchool(req, res);
    });
  });
  router.put('/:id', (req, res) => {
    fileUpload.schoolLogo.single('schoolLogo')(req, res, (err) => {
      if (err) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json('Upload logo under 50KB size limit');
        }
        return res.status(400).json('Upload logo under 50KB size limit');
      }
      // Call the controller function to update the school
      UpdateSchool(req, res);
    });
  });
router.delete('/:id',DeleteSchool);

module.exports = router;