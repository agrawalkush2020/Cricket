'use client';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import ScoreControls from '../components/ScoreControls';
import BatsmanStats from '../components/BatsmanStats';
import BowlerStats from '../components/BowlerStats';

export default function Page() {
  const [inning, setInning] = useState(null);
  const [firstInning, setFirstInning] = useState(null);

  const fetchInnings = async () => {
    const resCurrent = await api.get('/inning-details', {
      params: { id: 'current-inning-id' },
    });
    setInning(resCurrent.data);

    const resFirst = await api.get('/inning-details', {
      params: { id: 'first-inning-id' },
    });
    setFirstInning(resFirst.data);
  };

  const handleSubmit = async (deliveryData) => {
    await api.post('/deliveries', {
      ...deliveryData,
      inning: 'current-inning-id',
      batsman: 'batsman-id',
      bowler: 'bowler-id',
    });
    fetchInnings(); // Re-fetch both innings after submission
  };

  useEffect(() => {
    fetchInnings();
  }, []);

  return (
    <main className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Cricket Admin Panel</h1>

      {/* First Inning */}
      {firstInning && (
        <div className="border-b py-4">
          <h2 className="text-xl font-semibold">First Inning Summary</h2>
          <div>
            <p>
              Total Score: {firstInning.firstInningSummary.totalScore} /{' '}
              {firstInning.firstInningSummary.totalWickets} | Overs:{' '}
              {firstInning.firstInningSummary.totalOvers}
            </p>
          </div>
        </div>
      )}

      {/* Current Inning */}
      {inning && (
        <div className="py-4">
          <h2 className="text-xl font-semibold">Current Inning</h2>
          <div>
            <p>
              Total Score: {inning.currentInning.totalScore} /{' '}
              {inning.currentInning.totalWickets} | Overs: {inning.currentInning.totalOvers} | Run Rate:{' '}
              {inning.currentInning.runRate}
            </p>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Extras</h3>
              <p>
                Wide: {inning.currentInning.extras.wide} | No Ball:{' '}
                {inning.currentInning.extras.noBall} | Bye:{' '}
                {inning.currentInning.extras.bye} | Leg Bye:{' '}
                {inning.currentInning.extras.legBye}
              </p>
            </div>
          </div>

          {/* Batsman Stats */}
          <BatsmanStats batsmen={inning.currentInning.batsmen} />

          {/* Bowler Stats */}
          <BowlerStats bowlers={inning.currentInning.bowlers} />

          {/* Score Controls */}
          <ScoreControls onSubmit={handleSubmit} />
        </div>
      )}
    </main>
  );
}

