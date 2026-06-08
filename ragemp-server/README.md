# Romania RP — Server RageMP (GTA V)

Server RolePlay pentru RageMP, scris in Node.js + MySQL.

## Functionalitati

- **Factiuni**: Politia Romana, Politia Locala, Politia Animalelor, SMURD, 5 clanuri (Europeni, Americani, Rusi, Asiatici, Africani), Vanzatori.
- **Masini personale** (`/cumparamasina <model>`).
- **Case personale** (`/cumparacasa <id>`, `/caseledemovanzare`).
- **Afaceri personale** (`/cumparaafacere <id>`, `/afacerilemele`).
- **PayDay** la fiecare ora fixa (cron `0 * * * *`):
  - Salariu brut = `lvl * 1000 + random(999)`
  - Impozit pe venit (config global, default 10%)
  - Impozit pe CAS (config global, default 5%)
  - Daca esti in factiune: bonus salariu (suma1) + bonus CASS (suma2)
- **Alegeri Presedinte** in fiecare duminica:
  - Voturi prin `/euvotez <nume_jucator>` (un singur vot/saptamana).
  - La 23:55 duminica se desemneaza castigatorul.
  - Presedintele controleaza `suma1` (0–5000) si `suma2` (0–1000) prin `/setezetaxe <suma1> <suma2>`.

## Instalare

1. Descarca serverul RageMP de pe [rage.mp](https://rage.mp/) si extrage-l.
2. Pune folderul acestui proiect peste root-ul serverului (suprascrie `conf.json` daca ti se cere).
3. Instaleaza dependentele:
   ```bash
   cd ragemp-server
   npm install
   ```
4. Importa schema MySQL:
   ```bash
   mysql -u root -p < sql/schema.sql
   ```
5. Copiaza `.env.example` in `.env` si pune credentialele MySQL:
   ```bash
   cp .env.example .env
   ```
6. Porneste serverul:
   ```bash
   ./ragemp-server   # Linux
   ragemp-server.exe # Windows
   ```

## Structura

```
ragemp-server/
├── conf.json
├── package.json
├── .env.example
├── sql/
│   └── schema.sql
├── packages/
│   └── core/
│       ├── index.js        (entry point)
│       ├── database.js     (MySQL pool)
│       ├── players.js      (login/register/save)
│       ├── factions.js     (cele 10 factiuni)
│       ├── vehicles.js     (masini personale)
│       ├── houses.js       (case personale)
│       ├── businesses.js   (afaceri personale)
│       ├── payday.js       (cron orar)
│       ├── elections.js    (alegeri duminica)
│       └── commands.js     (toate comenzile RP)
└── client_packages/
    └── index.js
```

## Comenzi principale

| Comanda                     | Descriere                                   |
|----------------------------|---------------------------------------------|
| `/inregistrare <parola>`   | Creeaza cont nou                            |
| `/login <parola>`          | Logheaza-te                                 |
| `/factiuni`                | Listeaza toate factiunile                   |
| `/cumparamasina <model>`   | Cumpara masina personala                    |
| `/masinilemele`            | Vezi masinile tale                          |
| `/caseledemovanzare`       | Listeaza casele de vanzare                  |
| `/cumparacasa <id>`        | Cumpara casa                                |
| `/cumparaafacere <id>`     | Cumpara afacere                             |
| `/afacerilemele`           | Vezi afacerile tale                         |
| `/euvotez <nume_jucator>`  | Voteaza pentru presedinte (duminica)        |
| `/presedinte`              | Vezi presedintele curent + suma1/suma2      |
| `/setezetaxe <s1> <s2>`    | Doar Presedinte: seteaza taxele (0-5000 / 0-1000) |
| `/payday`                  | (admin) Forteaza PayDay                     |

## Panel Web Admin

Acest proiect include si un panel web (React + FastAPI + MongoDB) pentru gestiunea live a serverului. Vezi `/app/frontend` si `/app/backend`.
