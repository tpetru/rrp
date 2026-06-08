# Romania RP — FiveM Server (QBCore + Lua)

Server FiveM RolePlay bazat pe **QBCore Framework**, cu adaugiri custom: factiuni romanesti, PayDay extins, alegeri Presedinte, sistem admin 1-10.

## Cerinte
- **txAdmin** sau FiveM server vanilla
- **MariaDB / MySQL 8+**
- Resurse obligatorii (instalate inainte):
  - `oxmysql` — [github.com/overextended/oxmysql](https://github.com/overextended/oxmysql)
  - `ox_lib` — [github.com/overextended/ox_lib](https://github.com/overextended/ox_lib)
  - `qb-core` — [github.com/qbcore-framework/qb-core](https://github.com/qbcore-framework/qb-core)
  - Restul resurselor QBCore standard (qb-spawn, qb-multicharacter, qb-banking, etc.)

## Instalare

1. **Instaleaza QBCore complet** dupa documentatia oficiala: [docs.qbcore.org](https://docs.qbcore.org)
2. Copiaza folderul `resources/[rrp]/` in folderul `resources/` al serverului tau FiveM.
3. **Importa schema SQL** custom:
   ```bash
   mysql -u root -p qbcore < resources/[rrp]/rrp-core/sql/install.sql
   ```
4. Editeaza `server.cfg` si adauga:
   ```
   ensure rrp-core
   ```
   (dupa `ensure qb-core` si dependintele).
5. Restart server: `txAdmin → Restart`.

## Features

### Factiuni (10)
Configurate in `config.lua` ca **QBCore Jobs**: Politia Romana, Politia Locala, Politia Animalelor, SMURD, Clan Europeni/Americani/Rusi/Asiatici/Africani, Vanzatori.

### PayDay (la fiecare ora)
- Formula: `lvl × 1000 + random(0..999)` (lvl = grad QBCore +1)
- Impozit venit (default 10%) + impozit CAS (default 5%)
- Daca jucatorul are job intr-o factiune: + suma1 (bonus) + suma2 (CASS)
- Istoric in `rrp_payday_history`

### Alegeri Presedinte
- Voturile se accepta **doar duminica**
- `/euvotez <nume>` — un vot/saptamana/jucator
- `/setezetaxe <suma1> <suma2>` — doar Presedintele (limite: 0-5000 si 0-1000)
- `/finalizeazaalegerile` — doar admin lvl 10

### Admin Levels 1-10
Sistem custom, stocat in `rrp_admins`. Comenzi (toate cer **lvl 10**):
- `/teleportla <id|nume>` — tp la jucator
- `/teleportpe <id|nume>` — aduce jucatorul la tine
- `/masina <model>` — spawneaza vehicul
- `/addbani <id|nume> <suma>` — adauga/scade cash
- `/setadmin <cid|nume> <0-10>` — promoveaza/retrogradeaza
- `/admins` — lista admini online
- `/payday` — forteaza PayDay manual

## Setezi primul admin

```sql
INSERT INTO rrp_admins (citizenid, admin_level) VALUES ('CITIZENID_TAU', 10);
```
Afli `citizenid` din tabela `players` (QBCore).

## Structura

```
resources/[rrp]/rrp-core/
├── fxmanifest.lua
├── config.lua
├── server/
│   ├── main.lua          (init QBCore, cache admin, seed)
│   ├── factions.lua      (/factiuni, /alaturafactiune)
│   ├── payday.lua        (cron + /payday)
│   ├── elections.lua     (/euvotez, /presedinte, /setezetaxe, /finalizeazaalegerile)
│   └── admin.lua         (/teleportla, /teleportpe, /masina, /addbani, /setadmin, /admins)
├── client/
│   └── main.lua          (spawn vehicul, welcome)
└── sql/
    └── install.sql       (tabele rrp_*)
```

## Note

- **Casele si afacerile personale** sunt deja gestionate de QBCore (`qb-houses`, `qb-management`). Nu am scris fisiere custom pentru ele — folosesti resursele standard QBCore. Daca vrei custom logic peste, deschide un issue/ticket.
- **Masinile personale** sunt gestionate de `qb-vehicleshop` + `qb-garages`. Comanda admin `/masina` spawneaza temporar (nu se salveaza in garaj).
