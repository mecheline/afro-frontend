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
            className={`w-full flex items-center gap-2 rounded-lg px-3 py-2 text-left transition mt-2
              ${
                isActive
                  ? "bg-white/15 text-white border-l-4 border-[#EBC31E] shadow-md"
                  : "text-white/80 hover:bg-white/10"
              }`}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={`${isActive ? "text-white" : "text-[#cfcfcc]"}`}>
              {it.icon}
            </span>
            <span
              className={`${
                isActive ? "text-white font-bold" : "text-[#cfcfcc]"
              }`}
            >
              {it.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
