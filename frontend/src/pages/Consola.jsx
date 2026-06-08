import { Terminal } from "lucide-react";

const COMENZI = [
  { cmd: "/inregistrare <parola>", desc: "Creeaza cont nou pe server." },
  { cmd: "/login <parola>", desc: "Conecteaza-te la cont." },
  { cmd: "/factiuni", desc: "Listeaza toate cele 10 factiuni." },
  { cmd: "/cumparamasina <model> [pret]", desc: "Cumpara o masina personala." },
  { cmd: "/masinilemele", desc: "Listeaza masinile detinute." },
  { cmd: "/caseledemovanzare", desc: "Listeaza casele de vanzare." },
  { cmd: "/cumparacasa <id>", desc: "Cumpara o casa dupa ID." },
  { cmd: "/cumparaafacere <id>", desc: "Cumpara o afacere dupa ID." },
  { cmd: "/afacerilemele", desc: "Listeaza afacerile detinute." },
  { cmd: "/euvotez <nume_jucator>", desc: "Voteaza un candidat pentru Presedinte (duminica)." },
  { cmd: "/presedinte", desc: "Vezi presedintele curent si valorile suma1/suma2." },
  { cmd: "/setezetaxe <suma1> <suma2>", desc: "Doar Presedinte. Limite: 0-5000 / 0-1000." },
  { cmd: "/payday", desc: "(admin) Forteaza PayDay imediat." },
];

const SETUP_STEPS = [
  "1. Descarca server RageMP de pe rage.mp si extrage-l intr-un folder.",
  "2. Suprapune folderul /app/ragemp-server peste root-ul serverului.",
  "3. cd ragemp-server && npm install",
  "4. mysql -u root -p < sql/schema.sql",
  "5. cp .env.example .env  &&  edit .env (credentiale MySQL)",
  "6. Porneste: ./ragemp-server (Linux) sau ragemp-server.exe (Windows).",
];

export default function Consola() {
  return (
    <div className="px-8 py-10 animate-in" data-testid="consola-page">
      <header className="mb-10">
        <p className="label-tactical text-[#FFD600]">Documentatie</p>
        <h1 className="font-display text-5xl mt-2">Consola & Comenzi</h1>
        <p className="text-zinc-500 mt-2">Toate comenzile disponibile in joc si pasii de instalare a serverului.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="console-box">
          <div className="flex items-center gap-3 mb-5">
            <Terminal className="h-5 w-5 text-[#00E5FF]" />
            <h2 className="font-display text-xl text-white tracking-widest">COMENZI IN JOC</h2>
          </div>
          <div className="space-y-3 text-sm">
            {COMENZI.map((c, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                <code className="text-[#FFD600] font-mono whitespace-nowrap">{c.cmd}</code>
                <span className="text-zinc-400 text-xs">{c.desc}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="console-box" style={{ borderColor: "rgba(255, 214, 0, 0.3)" }}>
          <div className="flex items-center gap-3 mb-5">
            <Terminal className="h-5 w-5 text-[#FFD600]" />
            <h2 className="font-display text-xl text-white tracking-widest">SETUP SERVER</h2>
          </div>
          <div className="space-y-3 text-sm">
            {SETUP_STEPS.map((s, i) => (
              <p key={i} className="text-zinc-300 font-mono">{s}</p>
            ))}
          </div>
          <p className="mt-6 text-xs text-zinc-500">
            Toate fisierele sursa sunt in <code className="text-[#FFD600]">/app/ragemp-server/</code>.
            Vezi <code className="text-[#FFD600]">README.md</code> pentru detalii.
          </p>
        </div>
      </div>

      <section className="mt-8 tactical-card p-8">
        <h3 className="font-display text-2xl mb-3">Formula PayDay</h3>
        <div className="font-mono text-sm bg-[#050505] p-5 border border-white/5 space-y-1">
          <p><span className="text-[#FFD600]">salariu_brut</span> = lvl × 1000 + random(0..999)</p>
          <p><span className="text-[#FF3B30]">tax_venit</span>   = salariu_brut × tax_venit_pct / 100</p>
          <p><span className="text-[#FF3B30]">tax_cas</span>     = salariu_brut × tax_cas_pct / 100</p>
          <p><span className="text-[#00E676]">bonus_fac</span>   = (factiune?) suma1 : 0   // 0 — 5000</p>
          <p><span className="text-[#00E676]">bonus_cass</span>  = (factiune?) suma2 : 0   // 0 — 1000</p>
          <p className="text-white pt-2 border-t border-white/5">
            <span className="text-[#00E5FF]">net</span> = brut − tax_venit − tax_cas + bonus_fac + bonus_cass
          </p>
        </div>
      </section>
    </div>
  );
}
