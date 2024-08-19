'use strict';
const express = require('express');
const router = express.Router();
const fileUpload = require('../helpers/file-upload');
const {GetSingleSchoolNameLogo,GetSingleSchool,CreateSchool,UpdateSchool,DeleteSchool} = require('../controllers/school');

router.get('/name-logo',GetSingleSchoolNameLogo);
router.get('/:id',GetSingleSchool);
router.post('/',fileUpload.schoolLogo.single('schoolLogo'),CreateSchool);
router.put('/:id',UpdateSchool);
router.delete('/:id',DeleteSchool);

module.exports = router;