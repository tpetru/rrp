import { useEffect, useState } from "react";
import { getBusinesses, createBusiness, deleteBusiness, assignBusiness, getPlayers } from "../lib/api";
import { toast } from "sonner";
import { Plus, Trash2, Briefcase, UserPlus } from "lucide-react";

const TIPURI = [
  { v: "benzinarie", l: "Benzinarie" },
  { v: "magazin_24", l: "Magazin 24/7" },
  { v: "restaurant", l: "Restaurant" },
  { v: "club", l: "Club" },
  { v: "spalatorie", l: "Spalatorie" },
  { v: "dealership", l: "Dealership" },
];

export default function Afaceri() {
  const [items, setItems] = useState([]);
  const [players, setPlayers] = useState([]);
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ nume: "", tip: "benzinarie", adresa: "", pret: 100000, venit_zilnic: 5000 });

  const refresh = () => getBusinesses().then(setItems);
  useEffect(() => { refresh(); getPlayers().then(setPlayers); }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await createBusiness({ ...form, pret: parseInt(form.pret), venit_zilnic: parseInt(form.venit_zilnic) });
      toast.success(`Afacere "${form.nume}" adaugata.`);
      setForm({ nume: "", tip: "benzinarie", adresa: "", pret: 100000, venit_zilnic: 5000 });
      setShow(false);
      refresh();
    } catch (e) { toast.error(e.response?.data?.detail || "Eroare."); }
  };

  const assign = async (b) => {
    const pid = prompt("ID jucator proprietar?\n\n" + players.map(p => `${p.nume}: ${p.id}`).join("\n"));
    if (!pid) return;
    try {
      await assignBusiness(b.id, pid.trim());
      toast.success("Afacere atribuita.");
      refresh();
    } catch (e) { toast.error(e.response?.data?.detail || "Eroare."); }
  };

  const del = async (b) => {
    if (!confirm(`Sterge afacerea ${b.nume}?`)) return;
    await deleteBusiness(b.id);
    refresh();
  };

  return (
    <div className="px-8 py-10 animate-in" data-testid="afaceri-page">
      <header className="flex items-end justify-between mb-10">
        <div>
          <p className="label-tactical text-[#FFD600]">Business</p>
          <h1 className="font-display text-5xl mt-2">Afaceri Personale</h1>
          <p className="text-zinc-500 mt-2">{items.length} afaceri active.</p>
        </div>
        <button className="btn-primary flex items-center gap-2" onClick={() => setShow(!show)} data-testid="toggle-add-business">
          <Plus className="h-4 w-4" /> Adauga
        </button>
      </header>

      {show && (
        <form onSubmit={submit} className="tactical-card p-6 mb-8 grid grid-cols-2 md:grid-cols-6 gap-4" data-testid="add-business-form">
          <div className="md:col-span-2">
            <p className="label-tactical mb-2">Nume</p>
            <input className="input-tactical" required value={form.nume} onChange={e => setForm({ ...form, nume: e.target.value })} data-testid="input-biz-nume" />
          </div>
          <div>
            <p className="label-tactical mb-2">Tip</p>
            <select className="input-tactical" value={form.tip} onChange={e => setForm({ ...form, tip: e.target.value })} data-testid="select-biz-tip">
              {TIPURI.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
          </div>
          <div>
            <p className="label-tactical mb-2">Adresa</p>
            <input className="input-tactical" required value={form.adresa} onChange={e => setForm({ ...form, adresa: e.target.value })} data-testid="input-biz-adresa" />
          </div>
          <div>
            <p className="label-tactical mb-2">Pret</p>
            <input type="number" className="input-tactical" value={form.pret} onChange={e => setForm({ ...form, pret: e.target.value })} data-testid="input-biz-pret" />
          </div>
          <div className="flex items-end">
            <button type="submit" className="btn-primary w-full" data-testid="submit-add-business">Salveaza</button>
          </div>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(b => (
          <div key={b.id} className="tactical-card p-5" data-testid={`business-card-${b.id}`}>
            <div className="flex items-start justify-between">
              <Briefcase className="h-8 w-8 text-[#00E676]" strokeWidth={1.5} />
              <span className="label-tactical px-2 py-1 border border-[#00E676]/30 text-[#00E676]">
                {TIPURI.find(t => t.v === b.tip)?.l || b.tip}
              </span>
            </div>
            <h3 className="font-display text-2xl mt-4">{b.nume}</h3>
            <p className="text-zinc-500 text-sm mt-1">{b.adresa}</p>
            <p className="text-zinc-400 text-sm mt-2">{b.proprietar_nume || "Fara proprietar"}</p>
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
              <div>
                <p className="label-tactical">Pret</p>
                <p className="font-mono text-[#FFD600] text-sm mt-1">${b.pret?.toLocaleString()}</p>
              </div>
              <div>
                <p className="label-tactical">Venit/zi</p>
                <p className="font-mono text-[#00E5FF] text-sm mt-1">${b.venit_zilnic?.toLocaleString()}</p>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => assign(b)} className="text-[#00E5FF] hover:text-cyan-300" data-testid={`assign-business-${b.id}`}>
                <UserPlus className="h-4 w-4" />
              </button>
              <button onClick={() => del(b)} className="text-[#FF3B30] hover:text-red-400" data-testid={`delete-business-${b.id}`}>
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
