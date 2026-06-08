// Sistem factiuni
const db = require('./database');

const FACTIUNI = {
    POLITIA_ROMANA: 1,
    POLITIA_LOCALA: 2,
    POLITIA_ANIMALELOR: 3,
    SMURD: 4,
    CLAN_EUROPENI: 5,
    CLAN_AMERICANI: 6,
    CLAN_RUSI: 7,
    CLAN_ASIATICI: 8,
    CLAN_AFRICANI: 9,
    VANZATORI: 10
};

async function getAll() {
    return await db.query('SELECT * FROM factions ORDER BY id');
}

async function getById(id) {
    return await db.one('SELECT * FROM factions WHERE id = ?', [id]);
}

async function setMember(playerDbId, factionId, grad = 1) {
    await db.query('UPDATE players SET factiune_id = ?, grad = ? WHERE id = ?', [factionId, grad, playerDbId]);
}

async function removeMember(playerDbId) {
    await db.query('UPDATE players SET factiune_id = NULL, grad = 0 WHERE id = ?', [playerDbId]);
}

async function listMembers(factionId) {
    return await db.query('SELECT id, nume, lvl, grad FROM players WHERE factiune_id = ? ORDER BY grad DESC', [factionId]);
}

module.exports = { FACTIUNI, getAll, getById, setMember, removeMember, listMembers };
