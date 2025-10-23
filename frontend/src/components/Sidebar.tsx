type NavKey =
  | 'overview'
  | 'sleep'
  | 'diet'
  | 'exercise'
  | 'chatbot'
  | 'settings'
  | 'import';

export default function Sidebar({
  current,

  onNavigate,
}: {
  current: NavKey;

  onNavigate: (k: NavKey) => void;
}) {
  const items: { key: NavKey; label: string; emoji: string }[] = [
    { key: 'overview', label: 'Overview', emoji: '🏠' },

    { key: 'sleep', label: 'Sleep', emoji: '🛌' },

    { key: 'diet', label: 'Diet', emoji: '🍽️' },

    { key: 'exercise', label: 'Exercise', emoji: '🏃' },

    { key: 'chatbot', label: 'Chatbot', emoji: '🤖' },

    { key: 'import', label: 'Import', emoji: '📥' },

    { key: 'settings', label: 'Settings', emoji: '⚙️' },
  ];

  return (
    <aside className="bg-base-100 border-base-300 fixed inset-y-0 left-0 z-20 w-16 border-r md:w-64">
      <div className="flex h-16 items-center justify-center px-4 md:justify-start">
        <span className="text-base-content font-semibold">WellGenie</span>
      </div>

      <nav
        className="space-y-1 px-2 md:px-4"
        role="navigation"
        aria-label="Primary"
      >
        {items.map(({ key, label, emoji }) => {
          const active = current === key;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onNavigate(key)}
              className={`flex w-full items-center gap-3 rounded-xl p-3 text-left transition-colors ${active ? 'bg-base-200' : 'hover:bg-base-200'}`}
              aria-current={active ? 'page' : undefined}
            >
              <span className="text-lg">{emoji}</span>

              <span className="hidden text-sm md:inline">{label}</span>
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
