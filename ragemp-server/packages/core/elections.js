// Sistem alegeri Presedinte
// Comanda: /euvotez [nume_jucator]
// Alegerile au loc in fiecare duminica (la sfarsit se desemneaza castigatorul cu cele mai multe voturi)
// Presedintele controleaza suma1 (bonus salariu factiune, 0-5000) si suma2 (bonus CASS, 0-1000)

const cron = require('node-cron');
const db = require('./database');

const SUMA1_MIN = 0, SUMA1_MAX = 5000;
const SUMA2_MIN = 0, SUMA2_MAX = 1000;

async function getActiveElection() {
    const now = new Date();
    return await db.one(
        'SELECT * FROM elections WHERE start_date <= ? AND end_date >= ? AND finalizata = 0 ORDER BY id DESC LIMIT 1',
        [now, now]
    );
}

async function createElectionForCurrentSunday() {
    // Creeaza alegere pentru duminica curenta (00:00 - 23:59 ora serverului)
    const now = new Date();
    const day = now.getDay(); // 0 = duminica
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    if (day !== 0) {
        // sari la urmatoarea duminica
        start.setDate(start.getDate() + (7 - day));
    }
    const end = new Date(start);
    end.setHours(23, 59, 59, 999);

    const existing = await db.one(
        'SELECT id FROM elections WHERE start_date = ?',
        [start]
    );
    if (existing) return existing.id;

    const res = await db.query('INSERT INTO elections (start_date, end_date) VALUES (?, ?)', [start, end]);
    console.log(`[ALEGERI] Alegere creata pentru duminica ${start.toISOString()}`);
    return res.insertId;
}

async function vote(votantDbId, candidatNume) {
    const election = await getActiveElection();
    if (!election) return { ok: false, msg: 'Nu exista alegeri active. Voturile se accepta doar duminica.' };

    const candidat = await db.one('SELECT id, nume FROM players WHERE nume = ?', [candidatNume]);
    if (!candidat) return { ok: false, msg: `Jucatorul "${candidatNume}" nu exista.` };

    try {
        await db.query(
            'INSERT INTO votes (election_id, votant_id, candidat_id) VALUES (?, ?, ?)',
            [election.id, votantDbId, candidat.id]
        );
        return { ok: true, msg: `Ai votat pentru ${candidat.nume}.` };
    } catch (e) {
        if (e.code === 'ER_DUP_ENTRY') return { ok: false, msg: 'Ai votat deja la aceasta alegere.' };
        throw e;
    }
}

async function tally(electionId) {
    return await db.query(`
        SELECT p.id, p.nume, COUNT(v.id) AS voturi
        FROM votes v
        JOIN players p ON p.id = v.candidat_id
        WHERE v.election_id = ?
        GROUP BY p.id, p.nume
        ORDER BY voturi DESC, p.nume ASC
    `, [electionId]);
}

async function finalizeElection(electionId) {
    const results = await tally(electionId);
    if (results.length === 0) {
        await db.query('UPDATE elections SET finalizata = 1 WHERE id = ?', [electionId]);
        console.log(`[ALEGERI] Alegerea #${electionId} finalizata fara voturi.`);
        return null;
    }
    const winner = results[0];
    await db.query('UPDATE elections SET finalizata = 1, castigator_id = ? WHERE id = ?', [winner.id, electionId]);
    await db.query('UPDATE president SET player_id = ?, inceput_mandat = NOW() WHERE id = 1', [winner.id]);
    console.log(`[ALEGERI] Castigator: ${winner.nume} (${winner.voturi} voturi)`);
    return winner;
}

async function setPresidentTaxes(playerDbId, suma1, suma2) {
    const pres = await db.one('SELECT player_id FROM president WHERE id = 1');
    if (!pres || pres.player_id !== playerDbId) {
        return { ok: false, msg: 'Doar Presedintele poate seta taxele.' };
    }
    if (suma1 < SUMA1_MIN || suma1 > SUMA1_MAX) return { ok: false, msg: `Suma1 trebuie intre ${SUMA1_MIN}-${SUMA1_MAX}.` };
    if (suma2 < SUMA2_MIN || suma2 > SUMA2_MAX) return { ok: false, msg: `Suma2 trebuie intre ${SUMA2_MIN}-${SUMA2_MAX}.` };

    await db.query('UPDATE president SET suma1 = ?, suma2 = ? WHERE id = 1', [suma1, suma2]);
    return { ok: true, msg: `Taxele actualizate: suma1=${suma1}, suma2=${suma2}` };
}

async function getCurrentPresident() {
    return await db.one(`
        SELECT pr.suma1, pr.suma2, pr.inceput_mandat, p.id AS player_id, p.nume
        FROM president pr LEFT JOIN players p ON p.id = pr.player_id
        WHERE pr.id = 1
    `);
}

function start() {
    // Asigura alegere creata pentru duminica curenta la pornire si in fiecare zi la 00:01
    cron.schedule('1 0 * * *', async () => {
        try { await createElectionForCurrentSunday(); } catch (e) { console.error('[ALEGERI] eroare cron creare', e); }
    });
    // Finalizeaza alegerile duminica la 23:55
    cron.schedule('55 23 * * 0', async () => {
        try {
            const el = await getActiveElection();
            if (el) await finalizeElection(el.id);
        } catch (e) { console.error('[ALEGERI] eroare finalizare', e); }
    });
    createElectionForCurrentSunday().catch(e => console.error(e));
    console.log('[ALEGERI] Scheduler pornit.');
}

module.exports = {
    start, vote, tally, finalizeElection,
    setPresidentTaxes, getCurrentPresident,
    createElectionForCurrentSunday, getActiveElection,
    SUMA1_MIN, SUMA1_MAX, SUMA2_MIN, SUMA2_MAX
};
