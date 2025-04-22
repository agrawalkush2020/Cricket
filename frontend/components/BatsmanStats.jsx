import React, { useState, useEffect } from 'react';

function analyzeMatchData(matchData) {
  const batsmanStats = {};
  let totalWickets = 0;

  for (const ball of matchData) {
      const { batsman, runs, isWicket } = ball;

      // Initialize batsman if not already present
      if (!batsmanStats[batsman]) {
          batsmanStats[batsman] = {
              totalRuns: 0,
              ballsFaced: 0
          };
      }

      batsmanStats[batsman].totalRuns += runs;
      batsmanStats[batsman].ballsFaced++;

      if (isWicket) {
          totalWickets++;
      }
  }

  console.log("Batting Stats:");
  for (const batsman in batsmanStats) {
      const stats = batsmanStats[batsman];
      console.log(`${batsman} - Runs: ${stats.totalRuns}, Balls: ${stats.ballsFaced}`);
  }

  return batsmanStats;

  console.log(`\nTotal Wickets Fallen: ${totalWickets}`);
}


const BatsmanPerformance = ({ batsmen }) => {

  const [batsmanStats, setBatsmanStats] = useState({});
  useEffect(() => {
    const batsmanStats = analyzeMatchData(batsmen);
    console.log(batsmanStats);
    setBatsmanStats(batsmanStats);
  }, [batsmen]);

  console.log(batsmanStats);
  
  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">Batsman Performance Summary</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border rounded-lg overflow-hidden shadow-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-6 py-3 text-left">Name</th>
              <th className="px-6 py-3 text-center">Runs</th>
              <th className="px-6 py-3 text-center">Balls</th>
              <th className="px-6 py-3 text-center">Strike Rate</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
          {Object.entries(batsmanStats).length > 0 &&
            Object.entries(batsmanStats).map(([name, stats], index) => (
              <tr key={index}>
                <td className="px-6 py-4 font-medium text-gray-800">{name}</td>
                <td className="px-6 py-4 text-center">{stats.totalRuns}</td>
                <td className="px-6 py-4 text-center">{stats.ballsFaced}</td>
                <td className="px-6 py-4 text-center">
                  {stats.ballsFaced > 0
                    ? ((stats.totalRuns / stats.ballsFaced) * 100).toFixed(2)
                    : '0.00'}
                </td>
              </tr>
            ))}
          
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BatsmanPerformance;
