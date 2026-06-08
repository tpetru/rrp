import { useEffect, useState } from "react";
import { getHouses, createHouse, deleteHouse, assignHouse, getPlayers } from "../lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Home as HomeIcon, UserPlus } from "lucide-react";

export default function Case() {
  const [houses, setHouses] = useState([]);
  const [players, setPlayers] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ adresa: "", pret: 50000, interior_id: 1 });

  const refresh = () => getHouses().then(setHouses);
  useEffect(() => { refresh(); getPlayers().then(setPlayers); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createHouse({ adresa: form.adresa, pret: parseInt(form.pret), interior_id: parseInt(form.interior_id) });
      toast.success(`Casa "${form.adresa}" adaugata.`);
      setForm({ adresa: "", pret: 50000, interior_id: 1 });
      setShow(false);
      refresh();
    } catch (e) { toast.error(e.response?.data?.detail || "Eroare."); }
  };

  const assign = async (h) => {
    const pid = prompt("ID jucator proprietar?\n\n" + players.map(p => `${p.nume}: ${p.id}`).join("\n"));
    if (!pid) return;
    try {
      await assignHouse(h.id, pid.trim());
      toast.success("Casa atribuita.");
      refresh();
    } catch (e) { toast.error(e.response?.data?.detail || "Eroare."); }
  };

  const del = async (h) => {
    if (!confirm(`Sterge casa ${h.adresa}?`)) return;
    await deleteHouse(h.id);
    toast.success("Casa stearsa.");
    refresh();
  };

  return (
    <div className="px-8 py-10 animate-in" data-testid="case-page">
      <header className="flex items-end justify-between mb-10">
        <div>
          <p className="label-tactical text-[#FFD600]">Proprietati</p>
          <h1 className="font-display text-5xl mt-2">Case Personale</h1>
          <p className="text-zinc-500 mt-2">{houses.length} proprietati pe harta.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShow(!show)} data-testid="toggle-add-house">
          <Plus className="h-4 w-4" /> Adauga
        </button>
      </header>

      {show && (
        <form onSubmit={submit} className="tactical-card p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="add-house-form">
          <div className="md:col-span-2">
            <p className="label-tactical mb-2">Adresa</p>
            <input className="input-tactical" required value={form.adresa} onChange={e => setForm({ ...form, adresa: e.target.value })} data-testid="input-adresa" />
          </div>
          <div>
            <p className="label-tactical mb-2">Pret</p>
            <input type="number" className="input-tactical" value={form.pret} onChange={e => setForm({ ...form, pret: e.target.value })} data-testid="input-pret-casa" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full" data-testid="submit-add-house">Adauga</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {houses.map(h => (
          <div key={h.id} className="tactical-card p-5" data-testid={`house-card-${h.id}`}>
            <div className="flex items-start justify-between">
              <HomeIcon className="h-8 w-8 text-[#00E5FF]" strokeWidth={1.5} />
              {h.de_vanzare ? (
                <span className="label-tactical px-2 py-1 border border-[#00E676]/40 text-[#00E676]">DE VANZARE</span>
              ) : (
                <span className="label-tactical px-2 py-1 border border-zinc-700 text-zinc-500">VANDUTA</span>
              )}
            </div>
            <h3 className="font-display text-2xl mt-4">{h.adresa}</h3>
            <p className="text-zinc-500 text-sm mt-1">{h.proprietar_nume || "Fara proprietar"}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <p className="font-mono text-[#FFD600]">${h.pret?.toLocaleString()}</p>
              <div className="flex gap-3">
                <button onClick={() => assign(h)} className="text-[#00E5FF] hover:text-cyan-300" data-testid={`assign-house-${h.id}`}>
                  <UserPlus className="h-4 w-4" />
                </button>
                <button onClick={() => del(h)} className="text-[#FF3B30] hover:text-red-400" data-testid={`delete-house-${h.id}`}>
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
