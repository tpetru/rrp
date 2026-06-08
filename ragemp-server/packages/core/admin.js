// Sistem admin si comenzi admin level 10
// Comenzi: /teleportla, /teleportpe, /masina, /addbani
// Bonus: /setadmin pentru a promova un jucator (necesita admin 10)

const players = require('./players');
const db = require('./database');

function register() {
    if (typeof mp === 'undefined') return;

    // ------------------------------------------------------------------
    // /teleportla [nume] - admin se teleporteaza la jucator
    // ------------------------------------------------------------------
    mp.events.addCommand('teleportla', (player, ...args) => {
        if (!players.hasAdminLevel(player, 10)) {
            return player.outputChatBox('!{#FF3B30}[Admin] Nu ai permisiuni (Admin Level 10).');
        }
        const target = args.join(' ').trim();
        if (!target) return player.outputChatBox('!{#FF3B30}Foloseste: /teleportla [nume_jucator]');
        const targetPlayer = players.findOnlineByName(target);
        if (!targetPlayer) return player.outputChatBox(`!{#FF3B30}Jucatorul "${target}" nu este online.`);
        if (targetPlayer === player) return player.outputChatBox('!{#FF3B30}Nu te poti teleporta la tine.');
        const pos = targetPlayer.position;
        player.position = new mp.Vector3(pos.x, pos.y, pos.z + 0.5);
        player.dimension = targetPlayer.dimension;
        player.outputChatBox(`!{#00E676}[Admin] Te-ai teleportat la ${targetPlayer.name}.`);
    });

    // ------------------------------------------------------------------
    // /teleportpe [nume] - admin teleporteaza jucatorul la el
    // ------------------------------------------------------------------
    mp.events.addCommand('teleportpe', (player, ...args) => {
        if (!players.hasAdminLevel(player, 10)) {
            return player.outputChatBox('!{#FF3B30}[Admin] Nu ai permisiuni (Admin Level 10).');
        }
        const target = args.join(' ').trim();
        if (!target) return player.outputChatBox('!{#FF3B30}Foloseste: /teleportpe [nume_jucator]');
        const targetPlayer = players.findOnlineByName(target);
        if (!targetPlayer) return player.outputChatBox(`!{#FF3B30}Jucatorul "${target}" nu este online.`);
        if (targetPlayer === player) return player.outputChatBox('!{#FF3B30}Nu te poti teleporta pe tine.');
        const pos = player.position;
        targetPlayer.position = new mp.Vector3(pos.x + 1.0, pos.y, pos.z + 0.5);
        targetPlayer.dimension = player.dimension;
        targetPlayer.outputChatBox(`!{#FFD600}[Admin] Ai fost teleportat de ${player.name}.`);
        player.outputChatBox(`!{#00E676}[Admin] L-ai teleportat pe ${targetPlayer.name} la tine.`);
    });

    // ------------------------------------------------------------------
    // /masina [model] - spawneaza o masina la admin (temporara, nesalvata)
    // ------------------------------------------------------------------
    mp.events.addCommand('masina', (player, ...args) => {
        if (!players.hasAdminLevel(player, 10)) {
            return player.outputChatBox('!{#FF3B30}[Admin] Nu ai permisiuni (Admin Level 10).');
        }
        const model = (args[0] || '').trim().toLowerCase();
        if (!model) return player.outputChatBox('!{#FF3B30}Foloseste: /masina [model]   ex: adder, t20, sultan');
        try {
            const pos = player.position;
            const heading = player.heading || 0;
            const veh = mp.vehicles.new(mp.joaat(model), new mp.Vector3(pos.x + 2, pos.y, pos.z), {
                numberPlate: 'ADMIN',
                heading: heading,
                locked: false,
                engine: false,
                dimension: player.dimension
            });
            veh.setVariable('adminSpawn', true);
            player.outputChatBox(`!{#00E676}[Admin] Masina "${model}" spawnata. ID veh: ${veh.id}`);
        } catch (e) {
            player.outputChatBox(`!{#FF3B30}[Admin] Eroare la spawn (model invalid?): ${e.message}`);
        }
    });

    // ------------------------------------------------------------------
    // /addbani [nume] [suma] - adauga bani jucatorului
    // ------------------------------------------------------------------
    mp.events.addCommand('addbani', async (player, ...args) => {
        if (!players.hasAdminLevel(player, 10)) {
            return player.outputChatBox('!{#FF3B30}[Admin] Nu ai permisiuni (Admin Level 10).');
        }
        if (args.length < 2) {
            return player.outputChatBox('!{#FF3B30}Foloseste: /addbani [nume_jucator] [suma]');
        }
        const suma = parseInt(args[args.length - 1]);
        const numeTarget = args.slice(0, -1).join(' ').trim();
        if (isNaN(suma) || suma === 0) return player.outputChatBox('!{#FF3B30}Suma invalida.');
        if (!numeTarget) return player.outputChatBox('!{#FF3B30}Nume jucator invalid.');

        const r = await players.addMoney(numeTarget, suma);
        if (!r.ok) return player.outputChatBox(`!{#FF3B30}${r.msg}`);

        player.outputChatBox(`!{#00E676}[Admin] Ai adaugat $${suma} jucatorului ${numeTarget}.`);
        // notifica si jucatorul daca e online
        const onlineTarget = players.findOnlineByName(numeTarget);
        if (onlineTarget) {
            onlineTarget.outputChatBox(`!{#FFD600}[Admin] Ai primit $${suma} de la ${player.name}.`);
        }
    });

    // ------------------------------------------------------------------
    // /setadmin [nume] [level 0-10] - promoveaza/retrogradeaza jucator
    // (Doar admin level 10 poate)
    // ------------------------------------------------------------------
    mp.events.addCommand('setadmin', async (player, ...args) => {
        if (!players.hasAdminLevel(player, 10)) {
            return player.outputChatBox('!{#FF3B30}[Admin] Nu ai permisiuni (Admin Level 10).');
        }
        if (args.length < 2) {
            return player.outputChatBox('!{#FF3B30}Foloseste: /setadmin [nume] [level 0-10]');
        }
        const level = parseInt(args[args.length - 1]);
        const numeTarget = args.slice(0, -1).join(' ').trim();
        if (isNaN(level) || level < 0 || level > 10) {
            return player.outputChatBox('!{#FF3B30}Level invalid (0-10).');
        }
        const row = await db.one('SELECT id FROM players WHERE nume = ?', [numeTarget]);
        if (!row) return player.outputChatBox(`!{#FF3B30}Jucatorul "${numeTarget}" nu exista.`);
        await db.query('UPDATE players SET admin_level = ? WHERE id = ?', [level, row.id]);
        // updateaza cache daca e online
        const onlineTarget = players.findOnlineByName(numeTarget);
        if (onlineTarget) {
            const d = players.getData(onlineTarget);
            if (d) d.admin_level = level;
            onlineTarget.outputChatBox(`!{#FFD600}[Admin] Ai fost setat la Admin Level ${level} de ${player.name}.`);
        }
        player.outputChatBox(`!{#00E676}[Admin] ${numeTarget} este acum Admin Level ${level}.`);
    });

    // ------------------------------------------------------------------
    // /admins - listeaza adminii online
    // ------------------------------------------------------------------
    mp.events.addCommand('admins', (player) => {
        const lista = [];
        for (const mpp of mp.players.toArray()) {
            const d = players.getData(mpp);
            if (d && d.admin_level > 0) {
                lista.push(`${mpp.name} (Lvl ${d.admin_level})`);
            }
        }
        player.outputChatBox('!{#FFD600}===== ADMINI ONLINE =====');
        if (lista.length === 0) player.outputChatBox('!{#A1A1AA}Niciun admin online.');
        else for (const a of lista) player.outputChatBox(a);
    });

    console.log('[ADMIN] Comenzi admin inregistrate (level 10): /teleportla /teleportpe /masina /addbani /setadmin /admins.');
}

module.exports = { register };
