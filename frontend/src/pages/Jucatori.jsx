import { useEffect, useState } from "react";
import { getPlayers, createPlayer, deletePlayer, updatePlayer, getFactions } from "../lib/api";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export default function Jucatori() {
  const [players, setPlayers] = useState([]);
  const [factions, setFactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nume: "", lvl: 1, factiune_id: "" });

  const refresh = () => getPlayers().then(setPlayers);

  useEffect(() => { refresh(); getFactions().then(setFactions); }, []);

  const factionName = (id) => factions.find(f => f.id === id)?.nume || "—";

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createPlayer({
        nume: form.nume,
        lvl: parseInt(form.lvl),
        factiune_id: form.factiune_id ? parseInt(form.factiune_id) : null
      });
      toast.success(`Jucator "${form.nume}" creat.`);
      setForm({ nume: "", lvl: 1, factiune_id: "" });
      setShowForm(false);
      refresh();
    } catch (e) {
      toast.error(e.response?.data?.detail || "Eroare.");
    }
  };

  const toggleOnline = async (p) => {
    await updatePlayer(p.id, { online: !p.online });
    refresh();
  };

  const del = async (p) => {
    if (!confirm(`Sterge jucatorul ${p.nume}?`)) return;
    await deletePlayer(p.id);
    toast.success("Jucator sters.");
    refresh();
  };

  return (
    <div className="px-8 py-10 animate-in" data-testid="jucatori-page">
      <header className="flex items-end justify-between mb-10">
        <div>
          <p className="label-tactical text-[#FFD600]">Conturi</p>
          <h1 className="font-display text-5xl mt-2">Jucatori</h1>
          <p className="text-zinc-500 mt-2">{players.length} conturi inregistrate.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShowForm(!showForm)} data-testid="toggle-add-player">
          <Plus className="h-4 w-4" /> Adauga
        </button>
      </header>

      {showForm && (
        <form onSubmit={submit} className="tactical-card p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="add-player-form">
          <div>
            <p className="label-tactical mb-2">Nume</p>
            <input className="input-tactical" value={form.nume} onChange={e => setForm({ ...form, nume: e.target.value })} required data-testid="input-nume" />
          </div>
          <div>
            <p className="label-tactical mb-2">Nivel</p>
            <input type="number" min="1" className="input-tactical" value={form.lvl} onChange={e => setForm({ ...form, lvl: e.target.value })} data-testid="input-lvl" />
          </div>
          <div>
            <p className="label-tactical mb-2">Factiune</p>
            <select className="input-tactical" value={form.factiune_id} onChange={e => setForm({ ...form, factiune_id: e.target.value })} data-testid="select-factiune">
              <option value="">Civil</option>
              {factions.map(f => <option key={f.id} value={f.id}>{f.nume}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full" data-testid="submit-add-player">Creeaza</button>
          </div>
        </form>
      )}

      <div className="tactical-card overflow-hidden">
        <table className="w-full text-sm" data-testid="players-table">
          <thead>
            <tr className="border-b border-white/5 text-left">
              <th className="px-5 py-3 label-tactical">Nume</th>
              <th className="px-5 py-3 label-tactical">Nivel</th>
              <th className="px-5 py-3 label-tactical">Bani</th>
              <th className="px-5 py-3 label-tactical">Cont Bancar</th>
              <th className="px-5 py-3 label-tactical">Factiune</th>
              <th className="px-5 py-3 label-tactical">Status</th>
              <th className="px-5 py-3 label-tactical">Actiuni</th>
            </tr>
          </thead>
          <tbody>
            {players.map(p => (
              <tr key={p.id} className="border-b border-white/5 hover:bg-white/[0.03]" data-testid={`player-row-${p.id}`}>
                <td className="px-5 py-4 font-medium">{p.nume}</td>
                <td className="px-5 py-4 font-mono text-[#FFD600]">{p.lvl}</td>
                <td className="px-5 py-4 font-mono">${p.bani?.toLocaleString()}</td>
                <td className="px-5 py-4 font-mono text-[#00E5FF]">${p.cont_bancar?.toLocaleString()}</td>
                <td className="px-5 py-4 text-zinc-400">{factionName(p.factiune_id)}</td>
                <td className="px-5 py-4">
                  <button
                    onClick={() => toggleOnline(p)}
                    className={`text-xs px-2 py-1 border ${p.online ? "border-[#00E676] text-[#00E676] bg-[#00E676]/10" : "border-zinc-700 text-zinc-500"}`}
                    data-testid={`toggle-online-${p.id}`}
                  >
                    {p.online ? "ONLINE" : "OFFLINE"}
                  </button>
                </td>
                <td className="px-5 py-4">
                  <button onClick={() => del(p)} className="text-[#FF3B30] hover:text-red-400" data-testid={`delete-player-${p.id}`}>
                    <Trash2 className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
            {players.length === 0 && (
              <tr><td colSpan="7" className="px-5 py-12 text-center text-zinc-500">Niciun jucator inregistrat. Adauga primul.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
