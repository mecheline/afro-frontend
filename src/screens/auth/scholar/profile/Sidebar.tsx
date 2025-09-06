// Sidebar.tsx

import type { SectionKey, SidebarItem } from "./Layout";


export default function Sidebar({
  items,
  active,
  onSelect,
}: {
  items: SidebarItem[];
  active: SectionKey;
  onSelect: (key: SectionKey) => void;
}) {
  return (
    <nav className="p-3 space-y-1">
      {items.map((it) => {
        const isActive = active === it.key;
        return (
          <button
            key={it.key}
            onClick={() => onSelect(it.key)}
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition
              ${
                isActive
                  ? "bg-white/15 text-white"
                  : "text-white/80 hover:bg-white/10"
              }`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className="text-[#EBC31E]">{it.icon}</span>
            <span>{it.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
