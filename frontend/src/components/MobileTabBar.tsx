type NavKey = "overview" | "sleep" | "diet" | "exercise";

export default function MobileTabBar({
  current,
  onNavigate,
}: {
  current: NavKey;
  onNavigate: (k: NavKey) => void;
}) {
  const Item = ({ k, label, emoji }: { k: NavKey; label: string; emoji: string }) => {
    const active = current === k;
    return (
      <button
        type="button"
        onClick={() => onNavigate(k)}
        className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl ${
          active ? "bg-base-200" : "hover:bg-base-200"
        }`}
        aria-label={label}
        aria-current={active ? "page" : undefined}
      >
        <span className="text-lg leading-none">{emoji}</span>
        <span className="text-[11px] leading-none">{label}</span>
      </button>
    );
  };

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-base-100 border-t border-base-300"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around py-2">
        <Item k="overview" label="Home"     emoji="🏠" />
        <Item k="sleep"    label="Sleep"    emoji="🛌" />
        <Item k="diet"     label="Diet"     emoji="🍽️" />
        <Item k="exercise" label="Exercise" emoji="🏃" />
      </div>
    </nav>
  );
}
