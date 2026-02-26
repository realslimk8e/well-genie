import { mobileTabs } from '../features/navigation/nav';

type MobileNavKey = (typeof mobileTabs)[number];

export default function MobileTabBar({
  current,
  onNavigate,
}: {
  current: MobileNavKey;
  onNavigate: (k: MobileNavKey) => void;
}) {
  const Item = ({
    k,
    label,
    emoji,
  }: {
    k: MobileNavKey;
    label: string;
    emoji: string;
  }) => {
    const active = current === k;
    return (
      <button
        type="button"
        onClick={() => onNavigate(k)}
        className={`flex flex-col items-center gap-1 rounded-xl px-3 py-2 ${
          active ? 'bg-base-200' : 'hover:bg-base-200'
        }`}
        aria-label={label}
        aria-current={active ? 'page' : undefined}
      >
        <span className="text-lg leading-none">{emoji}</span>
        <span className="text-[11px] leading-none">{label}</span>
      </button>
    );
  };

  return (
    <nav
      className="bg-base-100 border-base-300 fixed inset-x-0 bottom-0 z-30 border-t md:hidden"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="flex justify-around py-2">
        <Item k="overview" label="Home" emoji="🏠" />
        <Item k="sleep" label="Sleep" emoji="🛌" />
        <Item k="diet" label="Diet" emoji="🍽️" />
        <Item k="exercise" label="Exercise" emoji="🏃" />
        <Item k="chatbot" label="Chatbot" emoji="🤖" />
      </div>
    </nav>
  );
}
