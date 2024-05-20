"use client";

import { useState, useEffect } from 'react';
import web3 from '../utils/web3.js';
import { abi, address } from '../contract.js';
import axios from 'axios';

export default function OfferList({ offers }) {
  const [amountsB, setAmountsB] = useState([]);
  const [account, setAccount] = useState('');

  async function fetchABI(contractAddress) {
    const url = `https://api-sepolia.etherscan.io/api?module=contract&action=getabi&address=${contractAddress}&apikey=${process.env.ETHERSCAN_API_KEY}`;
    const response = await axios.get(url);
    const abi = JSON.parse(response.data.result);
    return abi;
  }

  useEffect(() => {
    const getAccounts = async () => {
      const accounts = await web3.eth.getAccounts();
      setAccount(accounts[0]);
    };

    getAccounts();

    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0]);
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', (accounts) => {
          setAccount(accounts[0]);
        });
      }
    };
  }, []);

  const fillOffer = async (offer, index) => {
    try {
      const amountB = amountsB[index];
      const contract = new web3.eth.Contract(abi, address);
      const contractTokenB = new web3.eth.Contract(await fetchABI(offer.tokenB), offer.tokenB);

      await contractTokenB.methods.approve(address, amountB).send({ from: account });

      await contract.methods.fillTradeOffer(offer.offerId, offer.tokenB, amountB).send({
        from: account
      });
      alert('Trade offer filled successfully!');
    } catch (error) {
      console.error(error);
      alert('Error filling trade offer');
    }
  };

  const cancelOffer = async (offer) => {
    if (offer.maker !== account) {
      alert('Only the maker can cancel this offer');
      return;
    }
    try {
      const contract = new web3.eth.Contract(abi, address);
      await contract.methods.cancelTradeOffer(offer.offerId).send({
        from: account
      });
      alert('Trade offer canceled successfully!');
    } catch (error) {
      console.error(error);
      alert('Error canceling trade offer');
    }
  };

  const handleAmountBChange = (index, value) => {
    const updatedAmounts = [...amountsB];
    updatedAmounts[index] = value;
    setAmountsB(updatedAmounts);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Active Offers</h2>
      {offers.map((offer, index) => (
        <div key={index} className="bg-white p-4 rounded-lg shadow-md mb-4">
          <p>{offer.amountA} of {offer.tokenA} for {offer.amountB} of {offer.tokenB}</p>
          <input
            type="text"
            value={amountsB[index] || ''}
            onChange={(e) => handleAmountBChange(index, e.target.value)}
            placeholder="Amount of Token B"
            className="border p-2 mb-2 w-full"
          />
          <button onClick={() => fillOffer(offer, index)} className="bg-green-500 text-white px-4 py-2 rounded mr-2">
            Fill Offer
          </button>
          <button onClick={() => cancelOffer(offer)} className="bg-red-500 text-white px-4 py-2 rounded">
            Cancel Offer
          </button>
        </div>
      ))}
    </div>
  );
}
