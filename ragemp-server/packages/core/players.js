// Sistem jucatori: login, register, salvare
const bcrypt = require('bcryptjs');
const db = require('./database');

const onlinePlayers = new Map(); // mpId -> { dbId, nume, lvl, bani, factiune_id, grad }

async function register(player, parola) {
    const existing = await db.one('SELECT id FROM players WHERE nume = ?', [player.name]);
    if (existing) return { ok: false, msg: 'Numele este deja folosit.' };
    const hash = await bcrypt.hash(parola, 10);
    const result = await db.query(
        'INSERT INTO players (nume, parola_hash) VALUES (?, ?)',
        [player.name, hash]
    );
    return { ok: true, id: result.insertId };
}

async function login(player, parola) {
    const row = await db.one('SELECT * FROM players WHERE nume = ?', [player.name]);
    if (!row) return { ok: false, msg: 'Cont inexistent. Foloseste /inregistrare <parola>.' };
    const valid = await bcrypt.compare(parola, row.parola_hash);
    if (!valid) return { ok: false, msg: 'Parola incorecta.' };

    onlinePlayers.set(player.id, {
        dbId: row.id,
        nume: row.nume,
        lvl: row.lvl,
        bani: row.bani,
        cont_bancar: row.cont_bancar,
        factiune_id: row.factiune_id,
        grad: row.grad
    });

    if (typeof player.spawn === 'function') {
        player.spawn(new mp.Vector3(row.pozitie_x, row.pozitie_y, row.pozitie_z));
    }
    player.outputChatBox(`!{#00E5FF}[Server] !{#FFFFFF}Bine ai revenit, ${row.nume}! Nivel ${row.lvl}.`);
    return { ok: true, data: row };
}

async function save(player) {
    const data = onlinePlayers.get(player.id);
    if (!data) return;
    const pos = player.position || { x: 0, y: 0, z: 0 };
    await db.query(
        'UPDATE players SET lvl = ?, bani = ?, cont_bancar = ?, factiune_id = ?, grad = ?, pozitie_x = ?, pozitie_y = ?, pozitie_z = ? WHERE id = ?',
        [data.lvl, data.bani, data.cont_bancar, data.factiune_id, data.grad, pos.x, pos.y, pos.z, data.dbId]
    );
}

function getData(player) {
    return onlinePlayers.get(player.id);
}

function setData(player, key, value) {
    const d = onlinePlayers.get(player.id);
    if (d) d[key] = value;
}

function getAllOnline() {
    return Array.from(onlinePlayers.values());
}

function removeOnline(player) {
    onlinePlayers.delete(player.id);
}

module.exports = { register, login, save, getData, setData, getAllOnline, removeOnline, onlinePlayers };
