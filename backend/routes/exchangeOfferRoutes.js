
const express = require('express');
const { getAllOffers,
     getOfferById} = require('../controllers/exchangeOfferController.js');

const router = express.Router();

router.get('/offers', getAllOffers);
router.get('/offer/:id', getOfferById);

module.exports = router;
