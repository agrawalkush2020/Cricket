'use client';

export default function BowlerStats({ bowlers }) {
  return (
    <div>
      <h2 className="text-xl font-bold mb-2">Bowlers</h2>
      <table className="w-full border">
        <thead>
          <tr>
            <th>Name</th><th>Overs</th><th>Runs</th><th>Wickets</th><th>Eco</th>
          </tr>
        </thead>
        <tbody>
          {bowlers.map((b) => (
            <tr key={b.name}>
              <td>{b.name}</td>
              <td>{b.overs}</td>
              <td>{b.runs}</td>
              <td>{b.wickets}</td>
              <td>{b.economy}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
