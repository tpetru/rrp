import { useEffect, useState } from "react";
import { getStats, getPaydayConfig, getPresident } from "../lib/api";
import { Activity, Car, Home, Briefcase, Users, Shield, Crown, Clock } from "lucide-react";

function StatCard({ label, value, icon: Icon, accent = "yellow", testId }) {
  const accents = {
    yellow: "border-[#FFD600]/30 text-[#FFD600]",
    cyan: "border-[#00E5FF]/30 text-[#00E5FF]",
    green: "border-[#00E676]/30 text-[#00E676]",
    red: "border-[#FF3B30]/30 text-[#FF3B30]",
  };
  return (
    <div className={`tactical-card p-6 border-l-2 ${accents[accent]}`} data-testid={testId}>
      <div className="flex items-start justify-between">
        <div>
          <p className="label-tactical">{label}</p>
          <p className="font-display text-4xl mt-3 text-white">{value}</p>
        </div>
        <Icon className={`h-6 w-6 ${accents[accent].split(" ")[1]}`} strokeWidth={1.5} />
      </div>
    </div>
  );
}

function nextPaydayCountdown() {
  const now = new Date();
  const next = new Date(now);
  next.setHours(now.getHours() + 1, 0, 0, 0);
  const ms = next - now;
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [cfg, setCfg] = useState(null);
  const [pres, setPres] = useState(null);
  const [countdown, setCountdown] = useState(nextPaydayCountdown());

  useEffect(() => {
    Promise.all([getStats(), getPaydayConfig(), getPresident()])
      .then(([s, c, p]) => { setStats(s); setCfg(c); setPres(p); })
      .catch(console.error);
    const t = setInterval(() => setCountdown(nextPaydayCountdown()), 1000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="px-8 py-10 animate-in" data-testid="dashboard-page">
      <header className="flex items-end justify-between mb-10">
        <div>
          <p className="label-tactical text-[#FFD600]">Panou de Control</p>
          <h1 className="font-display text-5xl mt-2">Dashboard Server</h1>
          <p className="text-zinc-500 mt-2">Privire de ansamblu asupra serverului GTA5 RP.</p>
        </div>
        <div className="text-right">
          <p className="label-tactical">Urmatorul PayDay</p>
          <p className="font-mono text-3xl text-[#00E5FF] mt-2 tabular-nums" data-testid="dashboard-countdown">
            <Clock className="inline h-6 w-6 mr-2 -mt-1" />{countdown}
          </p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Jucatori Online" value={stats?.jucatori_online ?? "—"} icon={Activity} accent="green" testId="stat-online" />
        <StatCard label="Total Jucatori" value={stats?.jucatori_total ?? "—"} icon={Users} accent="cyan" testId="stat-jucatori" />
        <StatCard label="Total Masini" value={stats?.masini_total ?? "—"} icon={Car} accent="yellow" testId="stat-masini" />
        <StatCard label="Total Case" value={stats?.case_total ?? "—"} icon={Home} accent="cyan" testId="stat-case" />
        <StatCard label="Total Afaceri" value={stats?.afaceri_total ?? "—"} icon={Briefcase} accent="yellow" testId="stat-afaceri" />
        <StatCard label="Factiuni" value={stats?.factiuni_total ?? "—"} icon={Shield} accent="red" testId="stat-factiuni" />
        <StatCard label="Case De Vanzare" value={stats?.case_de_vanzare ?? "—"} icon={Home} accent="green" testId="stat-case-vanzare" />
        <StatCard label="Tax Venit" value={cfg ? `${cfg.tax_venit}%` : "—"} icon={Activity} accent="cyan" testId="stat-tax-venit" />
      </div>

      {/* Presedinte */}
      <section className="tactical-card p-8" data-testid="dashboard-presedinte">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            <div className="h-16 w-16 bg-[#FFD600]/10 border border-[#FFD600]/40 flex items-center justify-center">
              <Crown className="h-8 w-8 text-[#FFD600]" />
            </div>
            <div>
              <p className="label-tactical">Presedinte In Functie</p>
              <p className="font-display text-3xl mt-1">{pres?.nume || "— Nimeni —"}</p>
              <p className="text-zinc-500 text-sm mt-1">
                Bonus salariu factiune: <span className="font-mono text-[#FFD600]">${pres?.suma1 ?? "—"}</span>
                {"  "}|{"  "}
                Bonus CASS: <span className="font-mono text-[#FFD600]">${pres?.suma2 ?? "—"}</span>
              </p>
            </div>
          </div>
          <div className="font-mono text-xs text-zinc-500 max-w-md">
            <p className="text-zinc-300 mb-1 uppercase tracking-widest">Comanda in joc</p>
            /euvotez &lt;nume_jucator&gt;
            <br />
            <span className="text-zinc-600">Voturile se acumuleaza in fiecare duminica.</span>
          </div>
        </div>
      </section>
    </div>
  );
}
