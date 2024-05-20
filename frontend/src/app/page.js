// pages/index.js
"use client";

import { useEffect, useState } from 'react';
import OfferList from '../../components/OfferList.js';
import CreateOffer from '../../components/CreateOffer.js';

export default function Home() {
  const [offers, setOffers] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3002/api/offers')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => setOffers(data))
      .catch((error) => console.error('There was a problem with the fetch operation:', error));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 py-10">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-10">Trade Offers: Just make sure that Both the token's Smart contract is verified on Etherscan sepolia testnet</h1>
        <CreateOffer />
        <OfferList offers={offers} />
      </div>
    </div>
  );
}
