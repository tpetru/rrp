// Sistem case personale
const db = require('./database');

const houseMarkers = new Map();

async function loadAll() {
    const rows = await db.query('SELECT * FROM houses');
    for (const h of rows) {
        createMarker(h);
    }
    console.log(`[CASE] Incarcate ${rows.length} case personale.`);
    return rows;
}

function createMarker(h) {
    if (typeof mp === 'undefined') return;
    const colShape = mp.colshapes.newSphere(h.intrare_x, h.intrare_y, h.intrare_z, 1.5);
    colShape.setVariable('houseId', h.id);
    colShape.setVariable('houseType', 'entrance');
    houseMarkers.set(h.id, colShape);
}

async function buy(playerDbId, houseId) {
    const h = await db.one('SELECT * FROM houses WHERE id = ?', [houseId]);
    if (!h) return { ok: false, msg: 'Casa inexistenta.' };
    if (!h.de_vanzare) return { ok: false, msg: 'Casa nu este de vanzare.' };

    const player = await db.one('SELECT bani FROM players WHERE id = ?', [playerDbId]);
    if (!player || player.bani < h.pret) return { ok: false, msg: 'Bani insuficienti.' };

    await db.query('UPDATE players SET bani = bani - ? WHERE id = ?', [h.pret, playerDbId]);
    await db.query('UPDATE houses SET proprietar_id = ?, de_vanzare = 0 WHERE id = ?', [playerDbId, houseId]);
    return { ok: true, msg: `Ai cumparat casa ${h.adresa} cu $${h.pret}.` };
}

async function listForSale() {
    return await db.query('SELECT * FROM houses WHERE de_vanzare = 1 ORDER BY pret ASC');
}

async function listByOwner(playerDbId) {
    return await db.query('SELECT * FROM houses WHERE proprietar_id = ?', [playerDbId]);
}

module.exports = { loadAll, buy, listForSale, listByOwner };
