// Sistem afaceri personale
const db = require('./database');

async function loadAll() {
    const rows = await db.query('SELECT * FROM businesses');
    console.log(`[AFACERI] Incarcate ${rows.length} afaceri.`);
    return rows;
}

async function buy(playerDbId, businessId) {
    const b = await db.one('SELECT * FROM businesses WHERE id = ?', [businessId]);
    if (!b) return { ok: false, msg: 'Afacere inexistenta.' };
    if (!b.de_vanzare) return { ok: false, msg: 'Afacerea nu este de vanzare.' };

    const p = await db.one('SELECT bani FROM players WHERE id = ?', [playerDbId]);
    if (!p || p.bani < b.pret) return { ok: false, msg: 'Bani insuficienti.' };

    await db.query('UPDATE players SET bani = bani - ? WHERE id = ?', [b.pret, playerDbId]);
    await db.query('UPDATE businesses SET proprietar_id = ?, de_vanzare = 0 WHERE id = ?', [playerDbId, businessId]);
    return { ok: true, msg: `Ai cumparat ${b.nume} cu $${b.pret}.` };
}

async function listByOwner(playerDbId) {
    return await db.query('SELECT * FROM businesses WHERE proprietar_id = ?', [playerDbId]);
}

async function listForSale() {
    return await db.query('SELECT * FROM businesses WHERE de_vanzare = 1');
}

// Distribuie venit zilnic
async function distribuieVenituri() {
    const rows = await db.query('SELECT id, proprietar_id, venit_zilnic FROM businesses WHERE proprietar_id IS NOT NULL AND deschisa = 1');
    for (const b of rows) {
        if (b.venit_zilnic > 0) {
            await db.query('UPDATE players SET cont_bancar = cont_bancar + ? WHERE id = ?', [b.venit_zilnic, b.proprietar_id]);
        }
    }
}

module.exports = { loadAll, buy, listByOwner, listForSale, distribuieVenituri };
