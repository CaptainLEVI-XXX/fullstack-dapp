const {getDb} = require('../databaseConnect.js');

const getAllOffers = async (req, res) => {
    try {
        const db = getDb(); 
        if (!db) {
            throw new Error('Database connection not established');
        }
        const offers = await db.find({ filled: false }).toArray(); 
        res.json(offers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getOfferById = async (req, res) => {
    try {
        const db = getDb();  
        const offer = await db.findOne({ offerId: req.params.id });
        if (!offer) return res.status(404).json({ message: 'Offer not found' });
        res.json(offer);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getAllOffers,
    getOfferById
};



