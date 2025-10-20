type NavKey = "overview" | "sleep" | "diet" | "exercise" | "chatbot" |"settings";

export default function Sidebar({
  current,
  onNavigate,
}: {
  current: NavKey;
  onNavigate: (k: NavKey) => void;
}) {
  const items: { key: NavKey; label: string; emoji: string }[] = [
    { key: "overview", label: "Overview", emoji: "🏠" },
    { key: "sleep",    label: "Sleep",    emoji: "🛌" },
    { key: "diet",     label: "Diet",     emoji: "🍽️" },
    { key: "exercise", label: "Exercise", emoji: "🏃" },
    { key: "chatbot", label: "Chatbot", emoji: "🤖" },
    { key: "settings", label: "Settings", emoji: "⚙️" },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-20 w-16 md:w-64 bg-base-100 border-r border-base-300">
      <div className="h-16 flex items-center justify-center md:justify-start px-4">
        <span className="font-semibold text-base-content">WellGenie</span>
      </div>
      <nav className="px-2 md:px-4 space-y-1" role="navigation" aria-label="Primary">
        {items.map(({ key, label, emoji }) => {
          const active = current === key;
          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              className={`w-full text-left flex items-center gap-3 p-3 rounded-xl transition-colors
                ${active ? "bg-base-200" : "hover:bg-base-200"}`}
              aria-current={active ? "page" : undefined}
            >
              <span className="text-lg">{emoji}</span>
              <span className="hidden md:inline text-sm">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
