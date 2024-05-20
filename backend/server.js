const express = require('express')
const app = express()
const dotenv = require("dotenv").config(); 
const port = process.env.PORT || 3001
const Web3 = require('web3');
const cors = require('cors');
const web3 = new Web3(new Web3.providers.WebsocketProvider(process.env.NODE_URL));
const contractAddress = '0xB37653F22aA8533D276cF740DB62154a4F73db70';
const contractABI = require('./ABI.json');


const exchangeOfferContract = new web3.eth.Contract(contractABI, contractAddress);
const { connectToDb,getDb } = require('./databaseConnect.js');
const { createExchangeOffer, updateExchangeOffer } = require('./databaseModel.js');
const exchangeOfferRoutes = require('./routes/exchangeOfferRoutes.js');
const errorHandler = require('./middleware/errorHandler.js');
let db;



app.use(express.json())

connectToDb((err) => {
    if(!err){
      app.listen(port, () => {
        console.log(`app listening on port ${port}`)
      })
      db = getDb()
    }
  })

  app.use(cors({
    origin: `${process.env.ORIGIN}` // Replace with your frontend's origin
  }));

exchangeOfferContract.events.OfferCreated()
.on('data', async event => {
    const { maker, tokenA, tokenB, amountA, amountB, index } = event.returnValues;
    await createExchangeOffer({ maker, tokenA, tokenB, amountA, amountB, filled: false, offerId: index });
    console.log('Offer created:', {maker, tokenA, tokenB, amountA, amountB, offerId: index });
})
.on('error', console.error);

exchangeOfferContract.events.OfferCancelled()
.on('data', async event => {
    const { index } = event.returnValues;
    await updateExchangeOffer(index, { filled: true });
    console.log('Offer canceled:', index);
})
.on('error', console.error);

exchangeOfferContract.events.OfferFilled()
.on('data', async event => {
    const { index } = event.returnValues;
    const returnedValue= await updateExchangeOffer(index, { filled: true });
    console.log('Offer filled:', returnedValue);
})
.on('error', console.error);

exchangeOfferContract.events.PartialFill()
.on('data', async event => {
    const { amountA, amountB, index } = event.returnValues;
    await updateExchangeOffer(index, { amountA, amountB });
    console.log('Offer partially filled:', index);
})
.on('error', console.error);

// Use the trade offer routes
app.use('/api', exchangeOfferRoutes);

// Error handling middleware
app.use(errorHandler);

