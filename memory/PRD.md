# Romania RP — RageMP GTA5 Server + Web Admin Panel

## Problem Statement Original
User a cerut un server GTA5 RageMP, mod RolePlay cu:
- Factiuni: Politia Romana, Politia Locala, Politia Animalelor, SMURD, 5 clanuri (europeni, americani, rusi, asiatici, africani), Vanzatori
- Sistem masini personale, case personale, afaceri personale
- PayDay la ora fixa: salariu functie de lvl, impozit pe venit, impozit pe CAS, bonus factiune
- Sistem Presedinte ales prin `/euvotez [nume]` duminica; controleaza suma1 (bonus factiune) si suma2 (bonus CASS)

## User Choices (08-Feb-2026)
- (c) Ambele — cod RageMP + panel web admin
- Baza de date RageMP: **MySQL**
- Formula salariu: `lvl * 1000 + random(999)`
- Limba in joc: **Romana**
- Limite Presedinte: **suma1 0-5000, suma2 0-1000**

## Architecture
1. **RageMP Server** (`/app/ragemp-server/`) — Node.js + MySQL
   - Entry: `packages/core/index.js`
   - Module: database, players (bcrypt auth), factions, vehicles, houses, businesses, payday (cron `0 * * * *`), elections (cron duminica), commands (in romana)
   - Schema MySQL: `sql/schema.sql` (cu seed 10 factiuni)

2. **Web Admin Panel**
   - Backend: FastAPI + MongoDB (`/app/backend/server.py`) — oglindeste schema RageMP
   - Frontend: React + Tailwind + Shadcn (`/app/frontend/src`) — UI in romana, tema dark tactical (Anton + Outfit + JetBrains Mono, paleta asfalt/galben/cyan)

## Implemented (08-Feb-2026)
- [x] 10 factiuni pre-seed-uite (cu culori, bonusuri)
- [x] CRUD jucatori + atribuire factiune + toggle online
- [x] Masini personale (creare cu numar unic RO####)
- [x] Case personale (4 demo + adaugare/asignare)
- [x] Afaceri personale (3 demo + 6 tipuri)
- [x] PayDay: config taxe + buton run (formula `lvl*1000+random(999)` + bonusuri) + istoric
- [x] Alegeri: vot, finalize, presedinte ales, validare limite suma1/suma2
- [x] Comenzi in joc in romana: /inregistrare, /login, /factiuni, /cumparamasina, /masinilemele, /cumparacasa, /caseledemovanzare, /cumparaafacere, /afacerilemele, /euvotez, /presedinte, /setezetaxe, /payday
- [x] Tests: 14/14 backend pytest pass, frontend e2e 100%

## Personas
- **Admin server** — manageriaza factiuni, jucatori, economie din panel web
- **Player in joc** — interactioneaza prin comenzi RageMP
- **Presedinte ales** — controleaza taxele suma1/suma2

## Backlog / Next Tasks (P1/P2)
- P1: Admin authentication pentru panel (JWT)
- P1: Cleanup endpoint pentru date TEST_ ramase in db
- P2: Migrare `on_event` → `lifespan` context manager
- P2: Pydantic schema dedicata pentru PUT /api/players (in loc de dict)
- P2: Sync live RageMP ↔ panel via REST API in `packages/core/api-bridge.js`
- P2: Sistem grade in factiuni (UI pentru promovare/retrogradare)
- P2: Dashboard cu grafic istoric PayDay
- P2: Notificare in joc cand un nou Presedinte este ales
