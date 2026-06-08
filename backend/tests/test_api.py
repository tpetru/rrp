"""Backend tests pentru Romania RP Admin API."""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://9b69a8f7-aacb-41cd-bc75-ce09af0d25d4.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

EXPECTED_FACTIONS = [
    "Politia Romana", "Politia Locala", "Politia Animalelor", "SMURD",
    "Clan Europeni", "Clan Americani", "Clan Rusi", "Clan Asiatici",
    "Clan Africani", "Vanzatori",
]

s = requests.Session()


def test_root():
    r = s.get(f"{API}/")
    assert r.status_code == 200
    d = r.json()
    assert d["server"] == "Romania RP Admin"
    assert d["status"] == "online"


def test_stats():
    r = s.get(f"{API}/stats")
    assert r.status_code == 200
    d = r.json()
    for k in ["jucatori_total", "masini_total", "case_total", "afaceri_total", "factiuni_total"]:
        assert k in d


def test_factions_list():
    r = s.get(f"{API}/factions")
    assert r.status_code == 200
    data = r.json()
    assert len(data) == 10
    names = [f["nume"] for f in data]
    for n in EXPECTED_FACTIONS:
        assert n in names
    for f in data:
        for k in ["bonus_salariu", "bonus_cass", "culoare", "tip"]:
            assert k in f


@pytest.fixture(scope="module")
def player_id():
    name = f"TEST_Player_{os.getpid()}"
    # cleanup if exists
    existing = s.get(f"{API}/players").json()
    for p in existing:
        if p["nume"] == name:
            s.delete(f"{API}/players/{p['id']}")
    r = s.post(f"{API}/players", json={"nume": name, "lvl": 5, "factiune_id": 1})
    assert r.status_code == 200, r.text
    pid = r.json()["id"]
    yield pid
    s.delete(f"{API}/players/{pid}")


def test_create_player_duplicate(player_id):
    name = f"TEST_Player_{os.getpid()}"
    r = s.post(f"{API}/players", json={"nume": name, "lvl": 1})
    assert r.status_code == 400


def test_update_player(player_id):
    r = s.put(f"{API}/players/{player_id}", json={"lvl": 10, "online": True})
    assert r.status_code == 200
    assert r.json()["lvl"] == 10
    assert r.json()["online"] is True


def test_faction_members(player_id):
    r = s.get(f"{API}/factions/1/members")
    assert r.status_code == 200
    assert any(m["id"] == player_id for m in r.json())


def test_vehicle_crud(player_id):
    r = s.post(f"{API}/vehicles", json={"proprietar_id": player_id, "model": "sultan", "pret": 30000})
    assert r.status_code == 200
    v = r.json()
    assert v["numar"].startswith("RO")
    assert v["proprietar_nume"]
    vid = v["id"]
    r2 = s.get(f"{API}/vehicles")
    assert any(x["id"] == vid for x in r2.json())
    s.delete(f"{API}/vehicles/{vid}")


def test_houses():
    r = s.get(f"{API}/houses")
    assert r.status_code == 200
    assert len(r.json()) >= 4
    r2 = s.post(f"{API}/houses", json={"adresa": "TEST_House", "pret": 100000, "interior_id": 1})
    assert r2.status_code == 200
    hid = r2.json()["id"]
    s.delete(f"{API}/houses/{hid}")


def test_businesses():
    r = s.get(f"{API}/businesses")
    assert r.status_code == 200
    assert len(r.json()) >= 3
    r2 = s.post(f"{API}/businesses", json={"nume": "TEST_Biz", "tip": "magazin", "adresa": "Str X", "pret": 50000, "venit_zilnic": 1000})
    assert r2.status_code == 200


def test_payday_config():
    r = s.get(f"{API}/payday/config")
    assert r.status_code == 200
    d = r.json()
    for k in ["tax_venit", "tax_cas", "bonus_factiune", "bonus_cass"]:
        assert k in d
    # update
    r2 = s.put(f"{API}/payday/config", json={"tax_venit": 12, "tax_cas": 6})
    assert r2.status_code == 200
    assert r2.json()["tax_venit"] == 12
    # validation
    r3 = s.put(f"{API}/payday/config", json={"tax_venit": 60, "tax_cas": 5})
    assert r3.status_code == 400


def test_payday_run(player_id):
    before = s.get(f"{API}/players").json()
    p_before = next(p for p in before if p["id"] == player_id)
    cb_before = p_before["cont_bancar"]
    r = s.post(f"{API}/payday/run")
    assert r.status_code == 200
    assert r.json()["ok"] is True
    assert r.json()["procesati"] >= 1
    after = s.get(f"{API}/players").json()
    p_after = next(p for p in after if p["id"] == player_id)
    assert p_after["cont_bancar"] > cb_before
    h = s.get(f"{API}/payday/history")
    assert h.status_code == 200
    assert len(h.json()) >= 1


def test_election_flow(player_id):
    r = s.get(f"{API}/elections/current")
    assert r.status_code == 200
    assert "election" in r.json()
    # create candidate
    cand_name = f"TEST_Cand_{os.getpid()}"
    existing = s.get(f"{API}/players").json()
    cand = next((p for p in existing if p["nume"] == cand_name), None)
    if not cand:
        rc = s.post(f"{API}/players", json={"nume": cand_name, "lvl": 1})
        assert rc.status_code == 200
        cand_id = rc.json()["id"]
    else:
        cand_id = cand["id"]
    # vote
    rv = s.post(f"{API}/elections/vote", json={"votant_id": player_id, "candidat_nume": cand_name})
    assert rv.status_code == 200
    # double vote
    rv2 = s.post(f"{API}/elections/vote", json={"votant_id": player_id, "candidat_nume": cand_name})
    assert rv2.status_code == 400
    # non-existent candidate
    rv3 = s.post(f"{API}/elections/vote", json={"votant_id": player_id, "candidat_nume": "_NotExist_"})
    assert rv3.status_code == 404


def test_president_taxes_limits():
    # valid
    r = s.put(f"{API}/president/taxes", json={"suma1": 3000, "suma2": 800})
    assert r.status_code == 200
    cfg = s.get(f"{API}/payday/config").json()
    assert cfg["bonus_factiune"] == 3000
    assert cfg["bonus_cass"] == 800
    # over limits
    assert s.put(f"{API}/president/taxes", json={"suma1": 6000, "suma2": 500}).status_code == 400
    assert s.put(f"{API}/president/taxes", json={"suma1": 100, "suma2": 1500}).status_code == 400
    assert s.put(f"{API}/president/taxes", json={"suma1": -1, "suma2": 0}).status_code == 400


def test_president_get():
    r = s.get(f"{API}/president")
    assert r.status_code == 200
    assert "suma1" in r.json() and "suma2" in r.json()
