import { useEffect, useState } from "react";
import { getFactions, getFactionMembers } from "../lib/api";
import { Shield, ChevronRight, Users } from "lucide-react";

const TIP_LABEL = { politie: "Politie", medical: "Medical", clan: "Clan", vanzator: "Vanzatori" };

export default function Factiuni() {
  const [factions, setFactions] = useState([]);
  const [active, setActive] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => { getFactions().then(setFactions); }, []);
  useEffect(() => {
    if (active) getFactionMembers(active.id).then(setMembers);
    else setMembers([]);
  }, [active]);

  return (
    <div className="px-8 py-10 animate-in" data-testid="factiuni-page">
      <header className="mb-10">
        <p className="label-tactical text-[#FFD600]">Organizatii</p>
        <h1 className="font-display text-5xl mt-2">Factiuni</h1>
        <p className="text-zinc-500 mt-2">9 factiuni active + Vanzatori. Click pentru a vedea membri.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {factions.map((f) => (
          <button
            key={f.id}
            onClick={() => setActive(f)}
            data-testid={`faction-card-${f.id}`}
            className="tactical-card p-6 text-left group"
            style={{ borderLeft: `3px solid ${f.culoare}` }}
          >
            <div className="flex items-start justify-between mb-4">
              <Shield className="h-7 w-7" style={{ color: f.culoare }} strokeWidth={1.5} />
              <span className="label-tactical px-2 py-1 border" style={{ color: f.culoare, borderColor: `${f.culoare}55` }}>
                {TIP_LABEL[f.tip]}
              </span>
            </div>
            <h3 className="font-display text-2xl mb-3">{f.nume}</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <p className="label-tactical">Bonus Salariu</p>
                <p className="font-mono text-[#FFD600] mt-1">${f.bonus_salariu}</p>
              </div>
              <div>
                <p className="label-tactical">Bonus CASS</p>
                <p className="font-mono text-[#00E5FF] mt-1">${f.bonus_cass}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <span className="text-xs text-zinc-500 flex items-center gap-1.5">
                <Users className="h-3 w-3" /> {f.membri_count || 0} membri
              </span>
              <ChevronRight className="h-4 w-4 text-zinc-600 group-hover:text-[#FFD600] transition-colors" />
            </div>
          </button>
        ))}
      </div>

      {/* Drawer membri */}
      {active && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex justify-end" onClick={() => setActive(null)}>
          <div
            className="w-full max-w-xl h-full bg-[#0A0A0D] border-l overflow-auto"
            style={{ borderLeftColor: active.culoare }}
            onClick={(e) => e.stopPropagation()}
            data-testid="faction-drawer"
          >
            <div className="p-8 border-b border-white/5" style={{ background: `${active.culoare}11` }}>
              <p className="label-tactical" style={{ color: active.culoare }}>{TIP_LABEL[active.tip]}</p>
              <h2 className="font-display text-4xl mt-2">{active.nume}</h2>
              <button onClick={() => setActive(null)} className="btn-ghost mt-4" data-testid="close-drawer">Inchide</button>
            </div>
            <div className="p-8">
              <p className="label-tactical mb-4">Membri ({members.length})</p>
              {members.length === 0 && <p className="text-zinc-500">Nu exista membri.</p>}
              <div className="space-y-2">
                {members.map((m) => (
                  <div key={m.id} className="tactical-card p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium">{m.nume}</p>
                      <p className="text-xs text-zinc-500 font-mono">LVL {m.lvl} · GRAD {m.grad}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
