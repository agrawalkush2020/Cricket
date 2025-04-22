'use client';

import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ScoreControls from '../components/ScoreControls';
import BatsmanStats from '../components/BatsmanStats';
import BowlerStats from '../components/BowlerStats';

export default function Page() {
  const [inning, setInning] = useState(null);

  const fetchInning = async () => {
    const res = await api.get('/inning-details', {
      params: { id: 'your-inning-id' }
    });
    setInning(res.data);
  };

  const handleSubmit = async (deliveryData) => {
    await api.post('/deliveries', {
      ...deliveryData,
      inning: 'your-inning-id',
      batsman: 'batsman-id',
      bowler: 'bowler-id'
    });
    fetchInning();
  };

  useEffect(() => {
    fetchInning();
  }, []);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Cricket Admin Panel</h1>

      {inning && (
        <>
          <div className="text-lg font-semibold">
            Score: {inning.totalScore}/{inning.totalWickets} | Overs: {inning.totalOvers}
          </div>

          <ScoreControls onSubmit={handleSubmit} />
          <BatsmanStats batsmen={inning.batsmen} />
          <BowlerStats bowlers={inning.bowlers} />
        </>
      )}
    </main>
  );
}
