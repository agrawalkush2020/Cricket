'use client';

export default function BatsmanStats({ batsmen }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Batsmen</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th><th>R</th><th>B</th><th>4s</th><th>6s</th><th>SR</th>
          </tr>
        </thead>
        <tbody>
          {batsmen.map((b) => (
            <tr key={b.name}>
              <td>{b.name}</td>
              <td>{b.runs}</td>
              <td>{b.ballsFaced}</td>
              <td>{b.fours}</td>
              <td>{b.sixes}</td>
              <td>{b.strikeRate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
