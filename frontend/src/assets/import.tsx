import { useState } from "react";

type Row = {date: string;category: string;metric: string;value: number;};
export default function ImportPage({
onImported,
}: {
    onImported?: (added: number, skipped: number) => void;}) {
const [busy, setBusy] = useState(false);
const [lastSummary, setLastSummary] = useState<string>("");
const handleFile = async (file: File) => {
setBusy(true);
try {
    const text = await file.text();
    const parsed = parseCsv(text);
    const before = loadData();
    const merged = [...before, ...parsed];
    saveData(merged);
    const added = parsed.length;
    const skipped = 0;
    setLastSummary(`${added} rows imported, ${skipped} skipped.`);
    onImported?.(added, skipped);
} catch (e: any) {

    setLastSummary(`Import failed: ${e?.message ?? "unknown error"}`);

} finally {

    setBusy(false);
}
};
return (
<div className="space-y-4">
<div className="alert">
<span>
CSV must include headers: <b>date, category, metric, value</b>.
</span>
</div>

<input
type="file"
accept=".csv,text/csv"
className="file-input file-input-bordered w-full max-w-md"
onChange={(e) => {
const f = e.target.files?.[0];
if (f) handleFile(f);
}}
disabled={busy}/>

{lastSummary && (
<div className="toast toast-start">
<div className="alert alert-info">
<span>{lastSummary}</span>
</div>
</div>
)}
</div>);}

function loadData(): Row[] {
try {
    const raw = localStorage.getItem("wellgenie:data");
    return raw ? (JSON.parse(raw) as Row[]) : [];
} catch {
    return [];}
}

function saveData(data: Row[]) {
try {
    localStorage.setItem("wellgenie:data", JSON.stringify(data));
} catch {}
}

function parseCsv(text: string): Row[] {
const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
if (lines.length === 0) return [];
const headers = lines.shift()!.split(",").map((h) => h.trim().toLowerCase());
const iDate = headers.indexOf("date");
const iCategory = headers.indexOf("category");
const iMetric = headers.indexOf("metric");
const iValue = headers.indexOf("value");
if (iDate === -1 || iCategory === -1 || iMetric === -1 || iValue === -1) {
    throw new Error("CSV missing required headers: date, category, metric, value");
}
const rows: Row[] = [];
for (const line of lines) {
    const cols = line.split(",").map((c) => c.trim());
    const rawValue = cols[iValue];
    const value = rawValue !== undefined ? parseFloat(rawValue) : NaN;
if (cols[iDate] && cols[iCategory] && cols[iMetric] && !Number.isNaN(value)) {
rows.push({
date: cols[iDate],
category: cols[iCategory],
metric: cols[iMetric],
value,
});
}
}
return rows;
}