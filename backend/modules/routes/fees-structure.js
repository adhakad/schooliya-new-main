'use strict';
const express = require('express');
const router = express.Router();
const { GetSingleClassFeesStructure, CreateFeesStructure, DeleteFeesStructure } = require('../controllers/fees-structure');

router.post('/', CreateFeesStructure);
router.get('/admin/:id/class/:class/stream/:stream', GetSingleClassFeesStructure);
router.delete('/:id', DeleteFeesStructure)

module.exports = router;