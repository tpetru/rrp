"""
Backend FastAPI pentru Panel Admin Web - Romania RP (RageMP)
Mongo store care oglindeste schema MySQL a serverului de joc.
"""
from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import random
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="Romania RP Admin API")
api_router = APIRouter(prefix="/api")

# ---------- CONSTANTE ----------
SUMA1_MIN, SUMA1_MAX = 0, 5000
SUMA2_MIN, SUMA2_MAX = 0, 1000

FACTIUNI_SEED = [
    {"id": 1,  "nume": "Politia Romana",       "tip": "politie",  "culoare": "#0A84FF", "bonus_salariu": 3000, "bonus_cass": 800},
    {"id": 2,  "nume": "Politia Locala",       "tip": "politie",  "culoare": "#3CC3FF", "bonus_salariu": 2500, "bonus_cass": 700},
    {"id": 3,  "nume": "Politia Animalelor",   "tip": "politie",  "culoare": "#00E676", "bonus_salariu": 2200, "bonus_cass": 600},
    {"id": 4,  "nume": "SMURD",                "tip": "medical",  "culoare": "#FF453A", "bonus_salariu": 2800, "bonus_cass": 750},
    {"id": 5,  "nume": "Clan Europeni",        "tip": "clan",     "culoare": "#FFD600", "bonus_salariu": 1500, "bonus_cass": 400},
    {"id": 6,  "nume": "Clan Americani",       "tip": "clan",     "culoare": "#FF8A00", "bonus_salariu": 1500, "bonus_cass": 400},
    {"id": 7,  "nume": "Clan Rusi",            "tip": "clan",     "culoare": "#9C27B0", "bonus_salariu": 1500, "bonus_cass": 400},
    {"id": 8,  "nume": "Clan Asiatici",        "tip": "clan",     "culoare": "#00E5FF", "bonus_salariu": 1500, "bonus_cass": 400},
    {"id": 9,  "nume": "Clan Africani",        "tip": "clan",     "culoare": "#FF3B30", "bonus_salariu": 1500, "bonus_cass": 400},
    {"id": 10, "nume": "Vanzatori",            "tip": "vanzator", "culoare": "#A1A1AA", "bonus_salariu": 1200, "bonus_cass": 300},
]

# ---------- MODELE ----------
def new_id() -> str:
    return str(uuid.uuid4())

class Faction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: int
    nume: str
    tip: str
    culoare: str
    bonus_salariu: int
    bonus_cass: int
    lider_nume: Optional[str] = None

class Player(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    nume: str
    lvl: int = 1
    bani: int = 5000
    cont_bancar: int = 0
    factiune_id: Optional[int] = None
    grad: int = 0
    online: bool = False
    ore_jucate: int = 0
    creat_la: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())

class PlayerCreate(BaseModel):
    nume: str
    lvl: int = 1
    factiune_id: Optional[int] = None

class Vehicle(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    proprietar_id: str
    proprietar_nume: Optional[str] = None
    model: str
    numar: str
    pret: int = 20000
    locatie: str = "Los Santos"
    benzina: float = 100.0
    blocata: bool = False

class VehicleCreate(BaseModel):
    proprietar_id: str
    model: str
    pret: int = 20000

class House(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    proprietar_id: Optional[str] = None
    proprietar_nume: Optional[str] = None
    adresa: str
    pret: int = 50000
    interior_id: int = 1
    de_vanzare: bool = True

class HouseCreate(BaseModel):
    adresa: str
    pret: int = 50000
    interior_id: int = 1

class Business(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=new_id)
    proprietar_id: Optional[str] = None
    proprietar_nume: Optional[str] = None
    nume: str
    tip: str
    adresa: str
    pret: int = 100000
    venit_zilnic: int = 5000
    deschisa: bool = True
    de_vanzare: bool = True

class BusinessCreate(BaseModel):
    nume: str
    tip: str
    adresa: str
    pret: int = 100000
    venit_zilnic: int = 5000

class PaydayConfig(BaseModel):
    tax_venit: int = 10
    tax_cas: int = 5

class PaydayConfigUpdate(BaseModel):
    tax_venit: int
    tax_cas: int

class PresidentTaxes(BaseModel):
    suma1: int
    suma2: int

class PresidentInfo(BaseModel):
    player_id: Optional[str] = None
    nume: Optional[str] = None
    suma1: int = 2000
    suma2: int = 500
    inceput_mandat: Optional[str] = None

class VoteRequest(BaseModel):
    votant_id: str
    candidat_nume: str

# ---------- HELPERS ----------
async def get_player_by_id(pid: str) -> Optional[dict]:
    return await db.players.find_one({"id": pid}, {"_id": 0})

async def get_player_by_name(name: str) -> Optional[dict]:
    return await db.players.find_one({"nume": name}, {"_id": 0})

def next_sunday():
    now = datetime.now(timezone.utc)
    days_ahead = (6 - now.weekday()) % 7  # weekday: mon=0..sun=6
    if days_ahead == 0 and now.hour >= 23 and now.minute >= 55:
        days_ahead = 7
    start = (now + timedelta(days=days_ahead)).replace(hour=0, minute=0, second=0, microsecond=0)
    return start

# ---------- SEED ----------
async def seed_if_empty():
    if await db.factions.count_documents({}) == 0:
        await db.factions.insert_many([f.copy() for f in FACTIUNI_SEED])
        logging.info("Seeded 10 factiuni.")

    if await db.payday_config.count_documents({}) == 0:
        await db.payday_config.insert_one({"_singleton": True, "tax_venit": 10, "tax_cas": 5})

    if await db.president.count_documents({}) == 0:
        await db.president.insert_one({
            "_singleton": True, "player_id": None, "nume": None,
            "suma1": 2000, "suma2": 500, "inceput_mandat": None
        })

    # seed cateva case si afaceri demo daca lista e goala
    if await db.houses.count_documents({}) == 0:
        demo_houses = [
            {"id": new_id(), "proprietar_id": None, "proprietar_nume": None,
             "adresa": "Vinewood Hills #12", "pret": 250000, "interior_id": 1, "de_vanzare": True},
            {"id": new_id(), "proprietar_id": None, "proprietar_nume": None,
             "adresa": "Grove Street #7", "pret": 90000, "interior_id": 2, "de_vanzare": True},
            {"id": new_id(), "proprietar_id": None, "proprietar_nume": None,
             "adresa": "Rockford Hills #3", "pret": 480000, "interior_id": 3, "de_vanzare": True},
            {"id": new_id(), "proprietar_id": None, "proprietar_nume": None,
             "adresa": "Sandy Shores #21", "pret": 65000, "interior_id": 1, "de_vanzare": True},
        ]
        await db.houses.insert_many(demo_houses)

    if await db.businesses.count_documents({}) == 0:
        demo_biz = [
            {"id": new_id(), "proprietar_id": None, "proprietar_nume": None,
             "nume": "Benzinaria 24/7 LS", "tip": "benzinarie", "adresa": "Strawberry Ave",
             "pret": 350000, "venit_zilnic": 12000, "deschisa": True, "de_vanzare": True},
            {"id": new_id(), "proprietar_id": None, "proprietar_nume": None,
             "nume": "Magazin Hai Mart", "tip": "magazin_24", "adresa": "Vespucci Blvd",
             "pret": 180000, "venit_zilnic": 6000, "deschisa": True, "de_vanzare": True},
            {"id": new_id(), "proprietar_id": None, "proprietar_nume": None,
             "nume": "Bahama Mamas", "tip": "club", "adresa": "Del Perro Pier",
             "pret": 750000, "venit_zilnic": 25000, "deschisa": True, "de_vanzare": True},
        ]
        await db.businesses.insert_many(demo_biz)

@app.on_event("startup")
async def on_startup():
    await seed_if_empty()

# ============================================================
# FACTIUNI
# ============================================================
@api_router.get("/factions", response_model=List[Faction])
async def list_factions():
    rows = await db.factions.find({}, {"_id": 0}).sort("id", 1).to_list(100)
    # attach member count
    for r in rows:
        r["membri_count"] = await db.players.count_documents({"factiune_id": r["id"]})
    return rows

@api_router.get("/factions/{fid}/members")
async def faction_members(fid: int):
    members = await db.players.find({"factiune_id": fid}, {"_id": 0}).sort("grad", -1).to_list(500)
    return members

# ============================================================
# JUCATORI
# ============================================================
@api_router.get("/players")
async def list_players():
    rows = await db.players.find({}, {"_id": 0}).sort("lvl", -1).to_list(1000)
    return rows

@api_router.post("/players", response_model=Player)
async def create_player(p: PlayerCreate):
    if await get_player_by_name(p.nume):
        raise HTTPException(400, "Nume deja folosit.")
    player = Player(nume=p.nume, lvl=p.lvl, factiune_id=p.factiune_id, online=False)
    await db.players.insert_one(player.model_dump())
    return player

@api_router.put("/players/{pid}")
async def update_player(pid: str, data: dict):
    data.pop("id", None); data.pop("_id", None)
    res = await db.players.update_one({"id": pid}, {"$set": data})
    if res.matched_count == 0:
        raise HTTPException(404, "Jucator inexistent.")
    return await get_player_by_id(pid)

@api_router.delete("/players/{pid}")
async def delete_player(pid: str):
    await db.players.delete_one({"id": pid})
    return {"ok": True}

# ============================================================
# MASINI
# ============================================================
@api_router.get("/vehicles")
async def list_vehicles():
    rows = await db.vehicles.find({}, {"_id": 0}).to_list(2000)
    return rows

@api_router.post("/vehicles", response_model=Vehicle)
async def create_vehicle(v: VehicleCreate):
    owner = await get_player_by_id(v.proprietar_id)
    if not owner:
        raise HTTPException(404, "Proprietar inexistent.")
    numar = f"RO{random.randint(1000,9999)}"
    veh = Vehicle(
        proprietar_id=v.proprietar_id, proprietar_nume=owner["nume"],
        model=v.model, numar=numar, pret=v.pret
    )
    await db.vehicles.insert_one(veh.model_dump())
    return veh

@api_router.delete("/vehicles/{vid}")
async def delete_vehicle(vid: str):
    await db.vehicles.delete_one({"id": vid})
    return {"ok": True}

# ============================================================
# CASE
# ============================================================
@api_router.get("/houses")
async def list_houses():
    return await db.houses.find({}, {"_id": 0}).to_list(1000)

@api_router.post("/houses", response_model=House)
async def create_house(h: HouseCreate):
    house = House(adresa=h.adresa, pret=h.pret, interior_id=h.interior_id)
    await db.houses.insert_one(house.model_dump())
    return house

@api_router.post("/houses/{hid}/assign/{pid}")
async def assign_house(hid: str, pid: str):
    owner = await get_player_by_id(pid)
    if not owner:
        raise HTTPException(404, "Jucator inexistent.")
    res = await db.houses.update_one(
        {"id": hid},
        {"$set": {"proprietar_id": pid, "proprietar_nume": owner["nume"], "de_vanzare": False}}
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Casa inexistenta.")
    return {"ok": True}

@api_router.delete("/houses/{hid}")
async def delete_house(hid: str):
    await db.houses.delete_one({"id": hid})
    return {"ok": True}

# ============================================================
# AFACERI
# ============================================================
@api_router.get("/businesses")
async def list_businesses():
    return await db.businesses.find({}, {"_id": 0}).to_list(1000)

@api_router.post("/businesses", response_model=Business)
async def create_business(b: BusinessCreate):
    biz = Business(**b.model_dump())
    await db.businesses.insert_one(biz.model_dump())
    return biz

@api_router.post("/businesses/{bid}/assign/{pid}")
async def assign_business(bid: str, pid: str):
    owner = await get_player_by_id(pid)
    if not owner:
        raise HTTPException(404, "Jucator inexistent.")
    res = await db.businesses.update_one(
        {"id": bid},
        {"$set": {"proprietar_id": pid, "proprietar_nume": owner["nume"], "de_vanzare": False}}
    )
    if res.matched_count == 0:
        raise HTTPException(404, "Afacere inexistenta.")
    return {"ok": True}

@api_router.delete("/businesses/{bid}")
async def delete_business(bid: str):
    await db.businesses.delete_one({"id": bid})
    return {"ok": True}

# ============================================================
# PAYDAY
# ============================================================
@api_router.get("/payday/config")
async def get_payday_config():
    cfg = await db.payday_config.find_one({"_singleton": True}, {"_id": 0})
    pres = await db.president.find_one({"_singleton": True}, {"_id": 0})
    return {
        "tax_venit": cfg.get("tax_venit", 10),
        "tax_cas": cfg.get("tax_cas", 5),
        "bonus_factiune": pres.get("suma1", 2000),
        "bonus_cass": pres.get("suma2", 500),
        "presedinte_nume": pres.get("nume")
    }

@api_router.put("/payday/config")
async def update_payday_config(cfg: PaydayConfigUpdate):
    if cfg.tax_venit < 0 or cfg.tax_venit > 50:
        raise HTTPException(400, "tax_venit trebuie intre 0-50")
    if cfg.tax_cas < 0 or cfg.tax_cas > 50:
        raise HTTPException(400, "tax_cas trebuie intre 0-50")
    await db.payday_config.update_one(
        {"_singleton": True},
        {"$set": {"tax_venit": cfg.tax_venit, "tax_cas": cfg.tax_cas}}
    )
    return await get_payday_config()

@api_router.post("/payday/run")
async def run_payday():
    cfg = await get_payday_config()
    players = await db.players.find({}, {"_id": 0}).to_list(5000)
    history_entries = []
    for p in players:
        lvl = p.get("lvl", 1)
        salariu_brut = lvl * 1000 + random.randint(0, 999)
        tax_venit_aplicat = salariu_brut * cfg["tax_venit"] // 100
        tax_cas_aplicat = salariu_brut * cfg["tax_cas"] // 100
        bonus_f = cfg["bonus_factiune"] if p.get("factiune_id") else 0
        bonus_c = cfg["bonus_cass"] if p.get("factiune_id") else 0
        net = salariu_brut - tax_venit_aplicat - tax_cas_aplicat + bonus_f + bonus_c
        await db.players.update_one(
            {"id": p["id"]},
            {"$inc": {"cont_bancar": net, "ore_jucate": 1}}
        )
        history_entries.append({
            "id": new_id(),
            "player_id": p["id"],
            "player_nume": p["nume"],
            "salariu_brut": salariu_brut,
            "tax_venit_aplicat": tax_venit_aplicat,
            "tax_cas_aplicat": tax_cas_aplicat,
            "bonus_factiune": bonus_f,
            "bonus_cass": bonus_c,
            "salariu_net": net,
            "creat_la": datetime.now(timezone.utc).isoformat()
        })
    if history_entries:
        await db.payday_history.insert_many(history_entries)
    return {"ok": True, "procesati": len(history_entries)}

@api_router.get("/payday/history")
async def payday_history():
    return await db.payday_history.find({}, {"_id": 0}).sort("creat_la", -1).to_list(200)

# ============================================================
# ALEGERI / PRESEDINTE
# ============================================================
async def ensure_active_election():
    """Asigura ca exista o alegere activa pentru duminica curenta sau urmatoare."""
    now = datetime.now(timezone.utc)
    active = await db.elections.find_one({
        "finalizata": False,
        "end_date": {"$gte": now.isoformat()}
    }, {"_id": 0})
    if active:
        return active
    start = next_sunday()
    end = start.replace(hour=23, minute=59, second=59)
    el = {
        "id": new_id(),
        "start_date": start.isoformat(),
        "end_date": end.isoformat(),
        "finalizata": False,
        "castigator_id": None
    }
    await db.elections.insert_one(el)
    return el

@api_router.get("/elections/current")
async def current_election():
    el = await ensure_active_election()
    # remove _id if leaked
    el.pop("_id", None)
    votes = await db.votes.find({"election_id": el["id"]}, {"_id": 0}).to_list(5000)
    tally = {}
    for v in votes:
        tally[v["candidat_nume"]] = tally.get(v["candidat_nume"], 0) + 1
    rezultate = sorted(
        [{"candidat_nume": k, "voturi": v} for k, v in tally.items()],
        key=lambda x: -x["voturi"]
    )
    return {"election": el, "rezultate": rezultate, "total_voturi": len(votes)}

@api_router.post("/elections/vote")
async def cast_vote(req: VoteRequest):
    el = await ensure_active_election()
    votant = await get_player_by_id(req.votant_id)
    if not votant:
        raise HTTPException(404, "Votant inexistent.")
    candidat = await get_player_by_name(req.candidat_nume)
    if not candidat:
        raise HTTPException(404, f"Candidatul '{req.candidat_nume}' nu exista.")
    existing = await db.votes.find_one({"election_id": el["id"], "votant_id": req.votant_id})
    if existing:
        raise HTTPException(400, "Ai votat deja la aceasta alegere.")
    await db.votes.insert_one({
        "id": new_id(),
        "election_id": el["id"],
        "votant_id": req.votant_id,
        "votant_nume": votant["nume"],
        "candidat_id": candidat["id"],
        "candidat_nume": candidat["nume"],
        "creat_la": datetime.now(timezone.utc).isoformat()
    })
    return {"ok": True, "msg": f"Vot inregistrat pentru {candidat['nume']}."}

@api_router.post("/elections/finalize")
async def finalize_election():
    el = await ensure_active_election()
    votes = await db.votes.find({"election_id": el["id"]}, {"_id": 0}).to_list(5000)
    if not votes:
        await db.elections.update_one({"id": el["id"]}, {"$set": {"finalizata": True}})
        return {"ok": True, "msg": "Alegerea finalizata fara voturi."}
    tally = {}
    for v in votes:
        tally[v["candidat_id"]] = tally.get(v["candidat_id"], 0) + 1
    winner_id = max(tally, key=tally.get)
    winner = await get_player_by_id(winner_id)
    await db.elections.update_one(
        {"id": el["id"]},
        {"$set": {"finalizata": True, "castigator_id": winner_id}}
    )
    await db.president.update_one(
        {"_singleton": True},
        {"$set": {
            "player_id": winner_id,
            "nume": winner["nume"],
            "inceput_mandat": datetime.now(timezone.utc).isoformat()
        }}
    )
    return {"ok": True, "presedinte": winner["nume"], "voturi": tally[winner_id]}

@api_router.get("/president")
async def get_president():
    p = await db.president.find_one({"_singleton": True}, {"_id": 0})
    return p

@api_router.put("/president/taxes")
async def set_president_taxes(t: PresidentTaxes):
    if not (SUMA1_MIN <= t.suma1 <= SUMA1_MAX):
        raise HTTPException(400, f"suma1 trebuie intre {SUMA1_MIN}-{SUMA1_MAX}")
    if not (SUMA2_MIN <= t.suma2 <= SUMA2_MAX):
        raise HTTPException(400, f"suma2 trebuie intre {SUMA2_MIN}-{SUMA2_MAX}")
    await db.president.update_one(
        {"_singleton": True},
        {"$set": {"suma1": t.suma1, "suma2": t.suma2}}
    )
    return await db.president.find_one({"_singleton": True}, {"_id": 0})

# ============================================================
# DASHBOARD STATS
# ============================================================
@api_router.get("/stats")
async def stats():
    return {
        "jucatori_total": await db.players.count_documents({}),
        "jucatori_online": await db.players.count_documents({"online": True}),
        "masini_total": await db.vehicles.count_documents({}),
        "case_total": await db.houses.count_documents({}),
        "case_de_vanzare": await db.houses.count_documents({"de_vanzare": True}),
        "afaceri_total": await db.businesses.count_documents({}),
        "factiuni_total": await db.factions.count_documents({}),
    }

@api_router.get("/")
async def root():
    return {"server": "Romania RP Admin", "status": "online"}

# ----------------------------------------------------------------
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
