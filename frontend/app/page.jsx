'use client';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import DeliveryForm from '../components/delivery';
import BatsmanPerformance from '../components/BatsmanStats';

export default function Page() {
  const [inning, setInning] = useState(null);
  const [firstInning, setFirstInning] = useState(null);
  const [battingTeam, setBattingTeam] = useState(null);
  const [bowlingTeam, setBowlingTeam] = useState(null);

  const fetchInnings = async () => {
    const resCurrent = await api.get('/inning-details', {
      params: { id: 'current-inning-id' },
    });

    console.log(resCurrent.data);

    setInning(resCurrent.data.currentInning);
    setFirstInning(resCurrent.data.firstInningSummary);
    setBattingTeam(resCurrent.data.battingTeam);
    setBowlingTeam(resCurrent.data.bowlingTeam);
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

  if(!firstInning) {
    return (
      <div>
        <h1>No first inning data</h1>
      </div>
    )
  }
  const boxStyle = {
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '12px 16px',
    margin: '10px',
    backgroundColor: '#f9f9f9',
    fontFamily: 'sans-serif',
    width: 'fit-content',
    textAlign: 'center',
  };
  
  const titleStyle = {
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
  };
  
  const scoreStyle = {
    fontSize: '18px',
    color: '#333',
  };

  return (
    <div >
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
        <div style={boxStyle}>
          <div style={titleStyle}>First Inning</div>
          <div style={scoreStyle}>
            {firstInning.totalScore}/{firstInning.totalWickets} in {firstInning.totalOvers} overs
          </div>
        </div>

        <div style={boxStyle}>
          <div style={titleStyle}>Current Inning</div>
          <div style={scoreStyle}>
            {inning.totalScore}/{inning.totalWickets} in {inning.totalOvers} overs
          </div>
        </div>
      </div>

      <BatsmanPerformance batsmen={inning?.deliveries} />

      <div>
        <h3>Select Players</h3>
        
        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px', color: '#444'}}>
            Select Striker:
          </label>
          <select 
            style={{
              width: '100%',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">Choose striker batsman</option>
            {battingTeam.players.map((player) => (
              <option key={player._id} value={player._id}>{player.name}</option>
            ))}
          </select>
        </div>

        <div style={{marginBottom: '15px'}}>
          <label style={{display: 'block', marginBottom: '5px', color: '#444'}}>
            Select Bowler:
          </label>
          <select
            style={{
              width: '100%',
              padding: '8px', 
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          >
            <option value="">Choose bowler</option>
            {bowlingTeam.players.map((player) => (
              <option key={player._id} value={player._id}>{player.name}</option>
            ))}
          </select>
        </div>

        <DeliveryForm
          inningId={inning._id}
          batsmanId={battingTeam.players[0]._id}
          bowlerId={bowlingTeam.players[0]._id}
        />


      </div>
      
    </div>
  )

   
}
