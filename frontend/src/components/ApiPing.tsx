import { useEffect, useState } from "react";

export default function ApiPing() {
  const [msg, setMsg] = useState("Loading…");
  const [data, setData] = useState<unknown>(null);

  useEffect(() => {
    fetch("/api/sleep")
      .then(r => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then(json => {
        setData(json);
        setMsg("✅ /api/sleep loaded");
      })
      .catch(err => setMsg(`❌ ${String(err)}`));
  }, []);

  return (
    <div className="card bg-base-100 shadow-sm mt-3">
      <div className="card-body">
        <h3 className="card-title text-sm">{msg}</h3>
        <pre className="text-xs overflow-auto">{JSON.stringify(data, null, 2)}</pre>
      </div>
    </div>
  );
}
