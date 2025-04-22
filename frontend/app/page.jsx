'use client';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

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

  // debugger
  // console.log(inning, firstInning);
//   firstInning = {
//     "totalScore": 120,
//     "totalWickets": 5,
//     "totalOvers": "20.0"
// }

  if(!firstInning) {
    return (
      <div>
        <h1>No first inning data</h1>
      </div>
    )
  }

  const sectionStyle = {
    margin: '20px 0',
    padding: '20px',
    borderRadius: '8px',
    backgroundColor: '#f9f9f9',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  };
  
  const headerStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '10px',
    color: '#333',
  };
  
  const paragraphStyle = {
    margin: '5px 0',
    fontSize: '16px',
    color: '#555',
  };
  
  const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    flexDirection: 'column',
  };

  return (
    <div style={containerStyle}>
      <div style={sectionStyle}>
        <h3 style={headerStyle}>First Inning</h3>
        <p style={paragraphStyle}><strong>Total Score:</strong> {firstInning.totalScore}</p>
        <p style={paragraphStyle}><strong>Total Wickets:</strong> {firstInning.totalWickets}</p>
        <p style={paragraphStyle}><strong>Total Overs:</strong> {firstInning.totalOvers}</p>
      </div>

      <div style={sectionStyle}>
        <h3 style={headerStyle}>Current Inning</h3>
        <p style={paragraphStyle}><strong>Total Score:</strong> {inning.totalScore}</p>
        <p style={paragraphStyle}><strong>Total Wickets:</strong> {inning.totalWickets}</p>
        <p style={paragraphStyle}><strong>Total Overs:</strong> {inning.totalOvers}</p>
      </div>

      <div style={sectionStyle}>
        <h3 style={headerStyle}>Select Players</h3>
        
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

      </div>
      
    </div>
  )

   
}
