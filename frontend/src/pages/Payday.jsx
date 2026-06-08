import { useEffect, useState } from "react";
import { getPaydayConfig, updatePaydayConfig, runPayday, getPaydayHistory } from "../lib/api";
import { toast } from "sonner";
import { Banknote, PlayCircle, History } from "lucide-react";

export default function Payday() {
  const [cfg, setCfg] = useState(null);
  const [history, setHistory] = useState([]);
  const [tv, setTv] = useState(10);
  const [tc, setTc] = useState(5);

  const refresh = () => {
    getPaydayConfig().then(c => { setCfg(c); setTv(c.tax_venit); setTc(c.tax_cas); });
    getPaydayHistory().then(setHistory);
  };
  useEffect(() => { refresh(); }, []);

  const save = async () => {
    try {
      await updatePaydayConfig({ tax_venit: parseInt(tv), tax_cas: parseInt(tc) });
      toast.success("Configuratie salvata.");
      refresh();
    } catch (e) { toast.error(e.response?.data?.detail || "Eroare."); }
  };

  const run = async () => {
    try {
      const r = await runPayday();
      toast.success(`PayDay rulat: ${r.procesati} jucatori procesati.`);
      refresh();
    } catch (e) { toast.error("Eroare la PayDay."); }
  };

  return (
    <div className="px-8 py-10 animate-in" data-testid="payday-page">
      <header className="mb-10">
        <p className="label-tactical text-[#FFD600]">Economie</p>
        <h1 className="font-display text-5xl mt-2">Sistem PayDay</h1>
        <p className="text-zinc-500 mt-2">Se ruleaza automat la fiecare ora fixa. Formula: <span className="font-mono text-[#FFD600]">lvl × 1000 + random(999)</span></p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="tactical-card p-6 lg:col-span-2">
          <div className="flex items-center gap-3 mb-6">
            <Banknote className="h-6 w-6 text-[#FFD600]" />
            <h2 className="font-display text-2xl">Configuratie Taxe</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="label-tactical mb-2">Impozit pe Venit (%)</p>
              <input type="number" min="0" max="50" className="input-tactical" value={tv} onChange={e => setTv(e.target.value)} data-testid="input-tax-venit" />
            </div>
            <div>
              <p className="label-tactical mb-2">Impozit pe CAS (%)</p>
              <input type="number" min="0" max="50" className="input-tactical" value={tc} onChange={e => setTc(e.target.value)} data-testid="input-tax-cas" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <p className="label-tactical mb-2">Bonus Salariu Factiune (Suma1) — setat de Presedinte</p>
              <p className="font-mono text-2xl text-[#FFD600]">${cfg?.bonus_factiune?.toLocaleString() ?? "—"}</p>
              <p className="text-xs text-zinc-500 mt-1">Limite: 0 — 5,000</p>
            </div>
            <div>
              <p className="label-tactical mb-2">Bonus CASS (Suma2) — setat de Presedinte</p>
              <p className="font-mono text-2xl text-[#FFD600]">${cfg?.bonus_cass?.toLocaleString() ?? "—"}</p>
              <p className="text-xs text-zinc-500 mt-1">Limite: 0 — 1,000</p>
            </div>
          </div>
          <button onClick={save} className="btn-primary mt-6" data-testid="save-payday-config">Salveaza taxele</button>
        </div>

        <div className="tactical-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <PlayCircle className="h-6 w-6 text-[#00E676]" />
            <h2 className="font-display text-2xl">Forteaza PayDay</h2>
          </div>
          <p className="text-sm text-zinc-500 mb-6">Distribuie salarii imediat pentru toti jucatorii.</p>
          <button onClick={run} className="btn-primary w-full" data-testid="run-payday-now">Ruleaza acum</button>
        </div>
      </div>

      <div className="tactical-card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/5 flex items-center gap-3">
          <History className="h-5 w-5 text-[#00E5FF]" />
          <h3 className="font-display text-xl">Istoric PayDay</h3>
          <span className="ml-auto text-xs text-zinc-500 font-mono">{history.length} intrari</span>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="px-5 py-3 label-tactical">Jucator</th>
              <th className="px-5 py-3 label-tactical">Brut</th>
              <th className="px-5 py-3 label-tactical">Tax Venit</th>
              <th className="px-5 py-3 label-tactical">Tax CAS</th>
              <th className="px-5 py-3 label-tactical">Bonus Fac</th>
              <th className="px-5 py-3 label-tactical">Bonus CASS</th>
              <th className="px-5 py-3 label-tactical">Net</th>
              <th className="px-5 py-3 label-tactical">Data</th>
            </tr>
          </thead>
          <tbody>
            {history.slice(0, 50).map(h => (
              <tr key={h.id} className="border-b border-white/5 hover:bg-white/[0.03] font-mono text-xs" data-testid={`history-row-${h.id}`}>
                <td className="px-5 py-3 text-white">{h.player_nume}</td>
                <td className="px-5 py-3 text-[#FFD600]">${h.salariu_brut}</td>
                <td className="px-5 py-3 text-[#FF3B30]">-${h.tax_venit_aplicat}</td>
                <td className="px-5 py-3 text-[#FF3B30]">-${h.tax_cas_aplicat}</td>
                <td className="px-5 py-3 text-[#00E676]">+${h.bonus_factiune}</td>
                <td className="px-5 py-3 text-[#00E676]">+${h.bonus_cass}</td>
                <td className="px-5 py-3 text-[#00E5FF]">${h.salariu_net}</td>
                <td className="px-5 py-3 text-zinc-500">{new Date(h.creat_la).toLocaleString("ro-RO")}</td>
              </tr>
            ))}
            {history.length === 0 && (
              <tr><td colSpan="8" className="px-5 py-12 text-center text-zinc-500">Niciun PayDay rulat inca. Apasa "Ruleaza acum".</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
