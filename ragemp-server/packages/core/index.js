// =============================================================
//  Server RageMP - Mod RP Romania
//  Punct de intrare principal
// =============================================================

require('dotenv').config();
const db = require('./database');
const players = require('./players');
const vehicles = require('./vehicles');
const houses = require('./houses');
const businesses = require('./businesses');
const payday = require('./payday');
const elections = require('./elections');
const commands = require('./commands');

(async () => {
    try {
        // Smoke test conexiune DB
        await db.query('SELECT 1');
        console.log('[DB] Conectat la MySQL.');

        await vehicles.loadAll();
        await houses.loadAll();
        await businesses.loadAll();

        payday.start();
        elections.start();
        commands.register();

        console.log('===========================================');
        console.log('  Server RageMP RP Romania - PORNIT');
        console.log('  Comenzi: /inregistrare /login /factiuni');
        console.log('           /cumparamasina /cumparacasa');
        console.log('           /cumparaafacere /euvotez /presedinte');
        console.log('===========================================');
    } catch (e) {
        console.error('[STARTUP] Eroare la pornire:', e);
    }
})();

if (typeof mp !== 'undefined') {
    mp.events.add('playerJoin', (player) => {
        player.outputChatBox('!{#FFD600}Bun venit pe Romania RP! Foloseste /login <parola> sau /inregistrare <parola>.');
    });

    mp.events.add('playerQuit', async (player) => {
        try { await players.save(player); } catch (e) { console.error(e); }
        players.removeOnline(player);
    });
}
