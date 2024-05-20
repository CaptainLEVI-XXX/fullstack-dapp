// components/CreateOffer.js
"use client";

import { useState, useEffect } from 'react';
import web3 from '../utils/web3.js';
import { abi, address } from '../contract.js';
import axios from 'axios';

export default function CreateOffer() {
  const [tokenA, setTokenA] = useState('');
  const [tokenB, setTokenB] = useState('');
  const [amountA, setAmountA] = useState('');
  const [amountB, setAmountB] = useState('');
  const [listingFee, setListingFee] = useState('0.001');
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

  const createOffer = async () => {
    try {
      const contract = new web3.eth.Contract(abi, address);
      const contractTokenA = new web3.eth.Contract(await fetchABI(tokenA), tokenA);

      await contractTokenA.methods.approve(address, amountA).send({ from: account });

      await contract.methods.createTradeOffer(tokenA, tokenB, amountA, amountB).send({
        from: account,
        value: web3.utils.toWei(listingFee, 'ether')
      });
      alert('Trade offer created successfully!');
    } catch (error) {
      console.error(error);
      alert('Error creating trade offer');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-semibold mb-4">Create Trade Offer</h2>
      <input
        type="text"
        value={tokenA}
        onChange={(e) => setTokenA(e.target.value)}
        placeholder="Token A Address"
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        value={tokenB}
        onChange={(e) => setTokenB(e.target.value)}
        placeholder="Token B Address"
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        value={amountA}
        onChange={(e) => setAmountA(e.target.value)}
        placeholder="Amount of Token A"
        className="border p-2 mb-2 w-full"
      />
      <input
        type="text"
        value={amountB}
        onChange={(e) => setAmountB(e.target.value)}
        placeholder="Amount of Token B"
        className="border p-2 mb-2 w-full"
      />
      <button onClick={createOffer} className="bg-blue-500 text-white px-4 py-2 rounded">
        Create Offer
      </button>
    </div>
  );
}
