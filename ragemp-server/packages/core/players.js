// Sistem jucatori: login, register, salvare
const bcrypt = require('bcryptjs');
const db = require('./database');

const onlinePlayers = new Map(); // mpId -> { dbId, nume, lvl, bani, factiune_id, grad, admin_level }

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
        grad: row.grad,
        admin_level: row.admin_level || 0
    });

    if (typeof player.spawn === 'function') {
        player.spawn(new mp.Vector3(row.pozitie_x, row.pozitie_y, row.pozitie_z));
    }
    player.outputChatBox(`!{#00E5FF}[Server] !{#FFFFFF}Bine ai revenit, ${row.nume}! Nivel ${row.lvl}.`);
    if (row.admin_level && row.admin_level > 0) {
        player.outputChatBox(`!{#FFD600}[Admin] !{#FFFFFF}Esti logat ca Admin Level ${row.admin_level}.`);
    }
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

// Cauta jucator online dupa nume (case-insensitive, partial match)
function findOnlineByName(name) {
    if (typeof mp === 'undefined' || !name) return null;
    const lower = name.toLowerCase();
    for (const mpp of mp.players.toArray()) {
        if (mpp.name && mpp.name.toLowerCase().includes(lower)) return mpp;
    }
    return null;
}

// Verifica admin level pentru player conectat
function hasAdminLevel(player, requiredLevel) {
    const d = onlinePlayers.get(player.id);
    return d && (d.admin_level || 0) >= requiredLevel;
}

// Adauga bani la player offline (in db) sau online (in cache + db)
async function addMoney(playerNume, suma) {
    const row = await db.one('SELECT id FROM players WHERE nume = ?', [playerNume]);
    if (!row) return { ok: false, msg: `Jucatorul "${playerNume}" nu exista.` };
    await db.query('UPDATE players SET bani = bani + ? WHERE id = ?', [suma, row.id]);
    // daca e online, actualizeaza si cache-ul
    for (const [mpId, data] of onlinePlayers.entries()) {
        if (data.dbId === row.id) {
            data.bani += suma;
            break;
        }
    }
    return { ok: true };
}

module.exports = {
    register, login, save, getData, setData,
    getAllOnline, removeOnline, onlinePlayers,
    findOnlineByName, hasAdminLevel, addMoney
};
