// Sistem PayDay - se executa la fiecare ora fixa
// Formula: salariu_brut = lvl * 1000 + random(999)
// Aplica impozit pe venit, impozit pe CAS
// Daca este in factiune adauga bonus salariu (suma1) si bonus CASS (suma2)

const cron = require('node-cron');
const db = require('./database');
const players = require('./players');

async function getConfig() {
    const cfg = await db.one('SELECT * FROM payday_config WHERE id = 1');
    const pres = await db.one('SELECT suma1, suma2 FROM president WHERE id = 1');
    return {
        tax_venit: cfg ? cfg.tax_venit : 10,
        tax_cas: cfg ? cfg.tax_cas : 5,
        bonus_factiune: pres ? pres.suma1 : 2000,
        bonus_cass: pres ? pres.suma2 : 500
    };
}

async function calcularePentruJucator(p, cfg) {
    const lvl = p.lvl || 1;
    const salariu_brut = lvl * 1000 + Math.floor(Math.random() * 1000); // random(999) inclusiv 0..999
    const tax_venit_aplicat = Math.floor(salariu_brut * cfg.tax_venit / 100);
    const tax_cas_aplicat   = Math.floor(salariu_brut * cfg.tax_cas / 100);
    let bonus_factiune = 0;
    let bonus_cass = 0;
    if (p.factiune_id) {
        bonus_factiune = cfg.bonus_factiune;
        bonus_cass = cfg.bonus_cass;
    }
    const salariu_net = salariu_brut - tax_venit_aplicat - tax_cas_aplicat + bonus_factiune + bonus_cass;
    return { salariu_brut, tax_venit_aplicat, tax_cas_aplicat, bonus_factiune, bonus_cass, salariu_net };
}

async function ruleazaPayday() {
    const cfg = await getConfig();
    const allPlayers = await db.query('SELECT id, lvl, factiune_id FROM players');
    console.log(`[PAYDAY] Procesez ${allPlayers.length} jucatori. Tax venit=${cfg.tax_venit}% Tax CAS=${cfg.tax_cas}% Bonus fac=${cfg.bonus_factiune} CASS=${cfg.bonus_cass}`);

    for (const p of allPlayers) {
        const r = await calcularePentruJucator(p, cfg);
        await db.query('UPDATE players SET cont_bancar = cont_bancar + ?, ore_jucate = ore_jucate + 1 WHERE id = ?', [r.salariu_net, p.id]);
        await db.query(
            'INSERT INTO payday_history (player_id, salariu_brut, tax_venit_aplicat, tax_cas_aplicat, bonus_factiune, bonus_cass, salariu_net) VALUES (?,?,?,?,?,?,?)',
            [p.id, r.salariu_brut, r.tax_venit_aplicat, r.tax_cas_aplicat, r.bonus_factiune, r.bonus_cass, r.salariu_net]
        );
    }

    // Notifica jucatorii online (daca mp este disponibil)
    if (typeof mp !== 'undefined' && mp.players) {
        for (const online of players.getAllOnline()) {
            const playerRow = await db.one('SELECT lvl, factiune_id FROM players WHERE id = ?', [online.dbId]);
            if (!playerRow) continue;
            const r = await calcularePentruJucator(playerRow, cfg);
            // mesaj in chat - se itereaza jucatorii online via mp.players.toArray()
            for (const mpp of mp.players.toArray()) {
                if (players.getData(mpp)?.dbId === online.dbId) {
                    mpp.outputChatBox(`!{#FFD600}[PAYDAY] !{#FFFFFF}Salariu brut: $${r.salariu_brut} | Tax venit: -$${r.tax_venit_aplicat} | Tax CAS: -$${r.tax_cas_aplicat} | Bonus factiune: +$${r.bonus_factiune} | Bonus CASS: +$${r.bonus_cass}`);
                    mpp.outputChatBox(`!{#00E676}[PAYDAY] !{#FFFFFF}Net depus in cont: $${r.salariu_net}`);
                }
            }
        }
    }
}

function start() {
    // La fiecare ora fixa (minutul 0)
    cron.schedule('0 * * * *', async () => {
        try {
            await ruleazaPayday();
        } catch (e) {
            console.error('[PAYDAY] Eroare:', e);
        }
    });
    console.log('[PAYDAY] Scheduler pornit (ora fixa, 0 * * * *).');
}

module.exports = { start, ruleazaPayday, getConfig, calcularePentruJucator };
