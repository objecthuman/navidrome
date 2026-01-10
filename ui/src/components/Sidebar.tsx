import { Heart, Disc, Mic, ListMusic, Library } from "lucide-react";

interface SidebarProps {
  isCollapsed: boolean;
}

interface NavItem {
  icon: typeof Heart;
  label: string;
  count: string | null;
}

const navItems: NavItem[] = [
  { icon: Heart, label: "Favorites", count: null },
  { icon: Disc, label: "Albums", count: "124" },
  { icon: Mic, label: "Artists", count: "48" },
  { icon: ListMusic, label: "Genres", count: "12" },
  { icon: Library, label: "Libraries", count: "3" },
];

export function Sidebar({ isCollapsed }: SidebarProps) {
  return (
    <>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-[60px] bottom-0 z-40 bg-zinc-900/95 backdrop-blur-sm border-r border-zinc-800 transition-all duration-300 ease-in-out overflow-hidden
          ${isCollapsed ? "w-0 md:w-16" : "w-64"}
        `}
      >
        <div className={`p-4 ${isCollapsed ? "md:p-2" : ""}`}>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href="#"
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-zinc-800 transition-colors group
                    ${isCollapsed ? "md:justify-center" : ""}
                  `}
                >
                  <Icon className="w-5 h-5 text-zinc-300 group-hover:text-violet-400 transition-colors flex-shrink-0" />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-sm font-medium text-zinc-200">
                        {item.label}
                      </span>
                      {item.count && (
                        <span className="text-xs text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded-full">
                          {item.count}
                        </span>
                      )}
                    </>
                  )}
                </a>
              );
            })}
          </nav>

          {!isCollapsed && (
            <div className="mt-8 pt-6 border-t border-zinc-800">
              <h3 className="px-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-3">
                Recently Played
              </h3>
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                  >
                    <div className="w-10 h-10 bg-zinc-800 rounded-md flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 truncate">
                        Recent Track {i}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        Artist Name
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {!isCollapsed && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => {
            // This will be handled by parent component state
            document.dispatchEvent(new CustomEvent("close-mobile-sidebar"));
          }}
        ></div>
      )}
    </>
  );
}
