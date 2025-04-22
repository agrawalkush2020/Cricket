'use client';

import { useState } from 'react';

export default function ScoreControls({ onSubmit }) {
  const [runs, setRuns] = useState(0);
  const [deliveryType, setDeliveryType] = useState("normal");
  const [isWicket, setIsWicket] = useState(false);

  return (
    <div className="space-y-3">
      <input
        type="number"
        value={runs}
        onChange={(e) => setRuns(Number(e.target.value))}
        className="border p-2 rounded"
        placeholder="Runs"
      />

      <select
        value={deliveryType}
        onChange={(e) => setDeliveryType(e.target.value)}
        className="border p-2 rounded"
      >
        <option value="normal">Normal</option>
        <option value="bye">Bye</option>
        <option value="legbye">Leg Bye</option>
        <option value="noball">No Ball</option>
        <option value="wide">Wide</option>
        <option value="wicket">Wicket</option>
      </select>

      <label className="flex items-center gap-2">
        <input type="checkbox" checked={isWicket} onChange={(e) => setIsWicket(e.target.checked)} />
        Wicket
      </label>

      <button
        onClick={() => onSubmit({ runs, deliveryType, isWicket })}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Submit Delivery
      </button>
    </div>
  );
}
