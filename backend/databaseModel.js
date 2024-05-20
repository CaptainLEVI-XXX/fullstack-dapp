const { getDb } = require('./databaseConnect.js');

module.exports = {
    async createExchangeOffer(offerData) {
        try {
            const db = getDb();
            const result = await db.insertOne(offerData);
            return result; 
        } catch (error) {
            console.error('Error creating Exchange offer:', error);
            throw error;
        }
    },

    async getExchangeOfferById(offerId) {
        try {
            const db = getDb();
            return await db.findOne({ offerId });
        } catch (error) {
            console.error('Error getting Exchange offer by ID:', error);
            throw error;
        }
    },

    async updateExchangeOffer(offerId, updateData) {
        try {
            const db = getDb();
            const result = await db.updateOne({ offerId }, { $set: updateData });
            return result.modifiedCount; 
        } catch (error) {
            console.error('Error updating Exchange offer:', error);
            throw error;
        }
    },

    async deleteExchangeOffer(offerId) {
        try {
            const db = getDb();
            const result = await db.deleteOne({ offerId });
            return result.deletedCount;
        } catch (error) {
            console.error('Error deleting Exchange offer:', error);
            throw error;
        }
    }
};
