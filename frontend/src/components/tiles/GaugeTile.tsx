type Props = {
  title: string;
  percent: number;        // 0..100
  subtitle?: string;
  tone?: "success" | "warning" | "error" | "info";
};

export default function GaugeTile({ title, percent, subtitle, tone = "success" }: Props) {
  const toneClass =
    tone === "success" ? "text-success" :
    tone === "warning" ? "text-warning" :
    tone === "error"   ? "text-error"   :
                         "text-info";

  return (
    <div className="card bg-base-100/80 border border-base-300">
      <div className="card-body p-4">
        <h3 className="card-title text-base">{title}</h3>
        <div className="mt-3 flex items-center gap-4">
          <div className={`radial-progress ${toneClass}`} style={{ "--value": percent } as any}>
            {percent}%
          </div>
          <div className="text-sm text-base-content/70">
            {subtitle || "Deviation Index 2%"}
          </div>
        </div>
      </div>
    </div>
  );
}
