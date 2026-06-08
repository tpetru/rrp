import { NavLink, Outlet } from "react-router-dom";
import {
  LayoutDashboard, Shield, Users, Car, Home, Briefcase,
  Banknote, Vote, Terminal, Radio
} from "lucide-react";
import { Toaster } from "sonner";

const NAV = [
  { to: "/", icon: LayoutDashboard, label: "Dashboard", testId: "nav-dashboard" },
  { to: "/factiuni", icon: Shield, label: "Factiuni", testId: "nav-factiuni" },
  { to: "/jucatori", icon: Users, label: "Jucatori", testId: "nav-jucatori" },
  { to: "/masini", icon: Car, label: "Masini", testId: "nav-masini" },
  { to: "/case", icon: Home, label: "Case", testId: "nav-case" },
  { to: "/afaceri", icon: Briefcase, label: "Afaceri", testId: "nav-afaceri" },
  { to: "/payday", icon: Banknote, label: "PayDay", testId: "nav-payday" },
  { to: "/alegeri", icon: Vote, label: "Alegeri", testId: "nav-alegeri" },
  { to: "/consola", icon: Terminal, label: "Consola", testId: "nav-consola" },
];

export default function Layout() {
  return (
    <div className="min-h-screen flex bg-[#050507] text-white">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#0A0A0D",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#FFFFFF",
            borderRadius: 0,
            fontFamily: "Outfit, sans-serif",
          },
        }}
      />

      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-[#0A0A0D] flex flex-col" data-testid="sidebar">
        <div className="px-6 py-7 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 bg-[#FFD600] flex items-center justify-center">
              <Radio className="h-5 w-5 text-black" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="font-display text-lg leading-none tracking-wider">ROMANIA RP</h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.3em] mt-1">RageMP Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 py-5 px-3 space-y-1">
          {NAV.map(({ to, icon: Icon, label, testId }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              data-testid={testId}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-2.5 text-sm font-medium uppercase tracking-wider transition-all
                ${isActive
                  ? "bg-[#FFD600]/10 text-[#FFD600] border-l-2 border-[#FFD600]"
                  : "text-zinc-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent"}`
              }
            >
              <Icon className="h-4 w-4" strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-6 py-4 border-t border-white/5 text-[10px] text-zinc-600 uppercase tracking-widest">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-[#00E676] pulse-online inline-block" />
            Server Online
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-auto" data-testid="main-content">
        <Outlet />
      </main>
    </div>
  );
}
