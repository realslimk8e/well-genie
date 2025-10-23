export default function BannerTile() {
  return (
    <div className="card bg-gradient-to-br from-emerald-600/40 to-lime-500/30 border border-emerald-300/20">
      <div className="hero min-h-[120px]">
        <div className="hero-content flex-col lg:flex-row w-full justify-between">
          <div>
            <h2 className="text-2xl font-bold">Let’s level up your week</h2>
            <p className="opacity-80">Import your latest data and get AI tips.</p>
          </div>
          <button className="btn btn-sm btn-ghost glass">View Insights →</button>
        </div>
      </div>
    </div>
  );
}
