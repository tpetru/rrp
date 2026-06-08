import { useEffect, useState } from "react";
import { getVehicles, createVehicle, deleteVehicle, getPlayers } from "../lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Car as CarIcon } from "lucide-react";

export default function Masini() {
  const [vehicles, setVehicles] = useState([]);
  const [players, setPlayers] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ proprietar_id: "", model: "", pret: 20000 });

  const refresh = () => getVehicles().then(setVehicles);
  useEffect(() => { refresh(); getPlayers().then(setPlayers); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createVehicle({ proprietar_id: form.proprietar_id, model: form.model, pret: parseInt(form.pret) });
      toast.success(`Masina "${form.model}" inregistrata.`);
      setForm({ proprietar_id: "", model: "", pret: 20000 });
      setShow(false);
      refresh();
    } catch (e) { toast.error(e.response?.data?.detail || "Eroare."); }
  };

  const del = async (v) => {
    if (!confirm(`Sterge masina ${v.model} (${v.numar})?`)) return;
    await deleteVehicle(v.id);
    toast.success("Masina stearsa.");
    refresh();
  };

  return (
    <div className="px-8 py-10 animate-in" data-testid="masini-page">
      <header className="flex items-end justify-between mb-10">
        <div>
          <p className="label-tactical text-[#FFD600]">Garaj</p>
          <h1 className="font-display text-5xl mt-2">Masini Personale</h1>
          <p className="text-zinc-500 mt-2">{vehicles.length} vehicule inregistrate.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShow(!show)} data-testid="toggle-add-vehicle">
          <Plus className="h-4 w-4" /> Adauga
        </button>
      </header>

      {show && (
        <form onSubmit={submit} className="tactical-card p-6 mb-8 grid grid-cols-1 md:grid-cols-4 gap-4" data-testid="add-vehicle-form">
          <div>
            <p className="label-tactical mb-2">Proprietar</p>
            <select className="input-tactical" required value={form.proprietar_id} onChange={e => setForm({ ...form, proprietar_id: e.target.value })} data-testid="select-proprietar">
              <option value="">Alege jucator...</option>
              {players.map(p => <option key={p.id} value={p.id}>{p.nume}</option>)}
            </select>
          </div>
          <div>
            <p className="label-tactical mb-2">Model</p>
            <input className="input-tactical" required placeholder="adder, t20, sultan..." value={form.model} onChange={e => setForm({ ...form, model: e.target.value })} data-testid="input-model" />
          </div>
          <div>
            <p className="label-tactical mb-2">Pret</p>
            <input type="number" className="input-tactical" value={form.pret} onChange={e => setForm({ ...form, pret: e.target.value })} data-testid="input-pret" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full" data-testid="submit-add-vehicle">Inregistreaza</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {vehicles.map(v => (
          <div key={v.id} className="tactical-card p-5" data-testid={`vehicle-card-${v.id}`}>
            <div className="flex items-start justify-between">
              <CarIcon className="h-8 w-8 text-[#FFD600]" strokeWidth={1.5} />
              <span className="label-tactical px-2 py-1 border border-[#FFD600]/30 text-[#FFD600] font-mono">{v.numar}</span>
            </div>
            <h3 className="font-display text-2xl mt-4 uppercase">{v.model}</h3>
            <p className="text-zinc-500 text-sm mt-1">{v.proprietar_nume}</p>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
              <p className="font-mono text-[#00E5FF]">${v.pret?.toLocaleString()}</p>
              <button onClick={() => del(v)} className="text-[#FF3B30] hover:text-red-400" data-testid={`delete-vehicle-${v.id}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
        {vehicles.length === 0 && (
          <div className="md:col-span-3 text-center text-zinc-500 py-16">Nicio masina inregistrata.</div>
        )}
      </div>
    </div>
  );
}
