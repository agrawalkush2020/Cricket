'use client';
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export default function Page() {
  const [inning, setInning] = useState(null);
  const [firstInning, setFirstInning] = useState(null);

  const fetchInnings = async () => {
    const resCurrent = await api.get('/inning-details', {
      params: { id: 'current-inning-id' },
    });

    setInning(resCurrent.data.currentInning);
    setFirstInning(resCurrent.data.firstInningSummary);
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
  console.log(inning, firstInning);
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
    </div>
  )

   
}
