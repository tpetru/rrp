import { useEffect, useState } from "react";
import { getCurrentElection, castVote, finalizeElection, getPresident, setPresidentTaxes, getPlayers } from "../lib/api";
import { toast } from "sonner";
import { Crown, Vote as VoteIcon, CheckCircle } from "lucide-react";

const SUMA1_MAX = 5000;
const SUMA2_MAX = 1000;

export default function Alegeri() {
  const [election, setElection] = useState(null);
  const [rezultate, setRezultate] = useState([]);
  const [total, setTotal] = useState(0);
  const [pres, setPres] = useState(null);
  const [players, setPlayers] = useState([]);
  const [vot, setVot] = useState({ votant_id: "", candidat_nume: "" });
  const [taxes, setTaxes] = useState({ suma1: 2000, suma2: 500 });

  const refresh = async () => {
    const e = await getCurrentElection();
    setElection(e.election); setRezultate(e.rezultate); setTotal(e.total_voturi);
    const p = await getPresident();
    setPres(p); setTaxes({ suma1: p?.suma1 ?? 2000, suma2: p?.suma2 ?? 500 });
    getPlayers().then(setPlayers);
  };

  useEffect(() => { refresh(); }, []);

  const submitVote = async (e) => {
    e.preventDefault();
    try {
      await castVote(vot);
      toast.success("Vot inregistrat.");
      setVot({ votant_id: "", candidat_nume: "" });
      refresh();
    } catch (e) { toast.error(e.response?.data?.detail || "Eroare."); }
  };

  const finalize = async () => {
    if (!confirm("Finalizezi alegerile si declari castigator?")) return;
    try {
      const r = await finalizeElection();
      if (r.presedinte) toast.success(`Presedinte ales: ${r.presedinte} (${r.voturi} voturi)`);
      else toast.info(r.msg || "Finalizat.");
      refresh();
    } catch (e) { toast.error("Eroare."); }
  };

  const saveTaxes = async () => {
    try {
      await setPresidentTaxes({ suma1: parseInt(taxes.suma1), suma2: parseInt(taxes.suma2) });
      toast.success("Taxe Presedinte actualizate.");
      refresh();
    } catch (e) { toast.error(e.response?.data?.detail || "Eroare."); }
  };

  const maxVoturi = Math.max(...rezultate.map(r => r.voturi), 1);

  return (
    <div className="px-8 py-10 animate-in" data-testid="alegeri-page">
      <header className="mb-10">
        <p className="label-tactical text-[#FFD600]">Politica</p>
        <h1 className="font-display text-5xl mt-2">Alegeri Presedinte</h1>
        <p className="text-zinc-500 mt-2">Voturile se accepta in fiecare duminica. Comanda in joc: <span className="font-mono text-[#FFD600]">/euvotez &lt;nume&gt;</span></p>
      </header>

      {/* Presedinte curent */}
      <section className="tactical-card p-8 mb-8" style={{ borderLeft: "3px solid #FFD600" }} data-testid="presedinte-curent">
        <div className="flex items-start justify-between flex-wrap gap-6">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 bg-[#FFD600]/10 border border-[#FFD600]/40 flex items-center justify-center">
              <Crown className="h-10 w-10 text-[#FFD600]" />
            </div>
            <div>
              <p className="label-tactical">Presedinte In Functie</p>
              <p className="font-display text-4xl mt-2">{pres?.nume || "— Nimeni —"}</p>
              {pres?.inceput_mandat && (
                <p className="text-xs text-zinc-500 mt-1 font-mono">Din {new Date(pres.inceput_mandat).toLocaleDateString("ro-RO")}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 flex-1 min-w-[280px] max-w-md">
            <div>
              <p className="label-tactical mb-2">Suma1 — Bonus Salariu Factiune (0 — {SUMA1_MAX})</p>
              <input type="number" min="0" max={SUMA1_MAX} className="input-tactical" value={taxes.suma1} onChange={e => setTaxes({ ...taxes, suma1: e.target.value })} data-testid="input-suma1" />
            </div>
            <div>
              <p className="label-tactical mb-2">Suma2 — Bonus CASS (0 — {SUMA2_MAX})</p>
              <input type="number" min="0" max={SUMA2_MAX} className="input-tactical" value={taxes.suma2} onChange={e => setTaxes({ ...taxes, suma2: e.target.value })} data-testid="input-suma2" />
            </div>
            <button onClick={saveTaxes} className="btn-primary col-span-2" data-testid="save-taxes">Aplica taxele</button>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Voteaza */}
        <div className="tactical-card p-6">
          <div className="flex items-center gap-3 mb-5">
            <VoteIcon className="h-6 w-6 text-[#00E5FF]" />
            <h2 className="font-display text-2xl">Voteaza Acum</h2>
          </div>
          <form onSubmit={submitVote} className="space-y-4" data-testid="vote-form">
            <div>
              <p className="label-tactical mb-2">Esti tu (votant)</p>
              <select className="input-tactical" required value={vot.votant_id} onChange={e => setVot({ ...vot, votant_id: e.target.value })} data-testid="select-votant">
                <option value="">Alege jucator...</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.nume}</option>)}
              </select>
            </div>
            <div>
              <p className="label-tactical mb-2">Candidat (nume)</p>
              <input className="input-tactical" required value={vot.candidat_nume} onChange={e => setVot({ ...vot, candidat_nume: e.target.value })} data-testid="input-candidat" />
            </div>
            <button type="submit" className="btn-primary w-full" data-testid="submit-vote">Trimite votul</button>
          </form>

          <button onClick={finalize} className="btn-ghost w-full mt-4 flex items-center justify-center gap-2" data-testid="finalize-election">
            <CheckCircle className="h-4 w-4" /> Finalizeaza alegerea
          </button>
        </div>

        {/* Live results */}
        <div className="tactical-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display text-2xl">Rezultate Live</h2>
            <span className="label-tactical">{total} voturi total</span>
          </div>
          {rezultate.length === 0 && <p className="text-zinc-500 text-center py-8">Inca nu sunt voturi. Trimite primul vot!</p>}
          <div className="space-y-4">
            {rezultate.map((r, i) => (
              <div key={r.candidat_nume} data-testid={`result-${i}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{i === 0 && <Crown className="inline h-4 w-4 text-[#FFD600] mr-1 -mt-1" />}{r.candidat_nume}</span>
                  <span className="font-mono text-[#00E5FF] text-sm">{r.voturi} voturi</span>
                </div>
                <div className="h-2 bg-white/5 overflow-hidden">
                  <div
                    className="h-full transition-all"
                    style={{ width: `${(r.voturi / maxVoturi) * 100}%`, background: i === 0 ? "#FFD600" : "#00E5FF" }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
