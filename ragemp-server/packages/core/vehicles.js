// Sistem masini personale
const db = require('./database');

const spawnedVehicles = new Map(); // vehDbId -> mp.Vehicle

async function loadAll() {
    const rows = await db.query('SELECT * FROM vehicles');
    for (const v of rows) {
        spawn(v);
    }
    console.log(`[VEHICULE] Incarcate ${rows.length} masini personale.`);
}

function spawn(v) {
    if (typeof mp === 'undefined') return; // safe-guard la teste
    const veh = mp.vehicles.new(mp.joaat(v.model), new mp.Vector3(v.locatie_x, v.locatie_y, v.locatie_z), {
        numberPlate: v.numar,
        locked: !!v.blocata,
        engine: false
    });
    veh.setVariable('dbId', v.id);
    veh.setVariable('proprietarId', v.proprietar_id);
    spawnedVehicles.set(v.id, veh);
}

async function buy(playerDbId, model, pret) {
    const numar = 'RO' + Math.floor(Math.random() * 9000 + 1000);
    const x = -56.0, y = -1095.0, z = 26.0; // simeon dealership area
    const result = await db.query(
        'INSERT INTO vehicles (proprietar_id, model, numar, pret, locatie_x, locatie_y, locatie_z) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [playerDbId, model, numar, pret, x, y, z]
    );
    const id = result.insertId;
    spawn({ id, proprietar_id: playerDbId, model, numar, pret, locatie_x: x, locatie_y: y, locatie_z: z, blocata: 0 });
    return { id, numar };
}

async function listByOwner(playerDbId) {
    return await db.query('SELECT * FROM vehicles WHERE proprietar_id = ?', [playerDbId]);
}

module.exports = { loadAll, spawn, buy, listByOwner, spawnedVehicles };
