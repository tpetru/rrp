// Comenzi in joc (in limba romana)
const players = require('./players');
const factions = require('./factions');
const vehicles = require('./vehicles');
const houses = require('./houses');
const businesses = require('./businesses');
const elections = require('./elections');
const payday = require('./payday');

function register() {
    if (typeof mp === 'undefined') return;

    mp.events.addCommand('inregistrare', async (player, parola) => {
        if (!parola) return player.outputChatBox('!{#FF3B30}Foloseste: /inregistrare <parola>');
        const r = await players.register(player, parola);
        player.outputChatBox(r.ok ? '!{#00E676}Cont creat. Acum foloseste /login.' : `!{#FF3B30}${r.msg}`);
    });

    mp.events.addCommand('login', async (player, parola) => {
        if (!parola) return player.outputChatBox('!{#FF3B30}Foloseste: /login <parola>');
        const r = await players.login(player, parola);
        if (!r.ok) player.outputChatBox(`!{#FF3B30}${r.msg}`);
    });

    mp.events.addCommand('factiuni', async (player) => {
        const list = await factions.getAll();
        player.outputChatBox('!{#FFD600}===== FACTIUNI =====');
        for (const f of list) player.outputChatBox(`!{${f.culoare}}[${f.id}] ${f.nume} (${f.tip})`);
    });

    mp.events.addCommand('cumparamasina', async (player, ...args) => {
        const data = players.getData(player);
        if (!data) return player.outputChatBox('!{#FF3B30}Loghează-te mai întâi.');
        const model = args[0];
        const pret = parseInt(args[1] || '20000');
        if (!model) return player.outputChatBox('!{#FF3B30}Foloseste: /cumparamasina <model> [pret]');
        const r = await vehicles.buy(data.dbId, model, pret);
        player.outputChatBox(`!{#00E676}Ai cumparat ${model} (${r.numar}) cu $${pret}.`);
    });

    mp.events.addCommand('masinilemele', async (player) => {
        const data = players.getData(player);
        if (!data) return;
        const list = await vehicles.listByOwner(data.dbId);
        player.outputChatBox('!{#FFD600}===== MASINILE TALE =====');
        for (const v of list) player.outputChatBox(`#${v.id} ${v.model} (${v.numar})`);
    });

    mp.events.addCommand('cumparacasa', async (player, houseId) => {
        const data = players.getData(player);
        if (!data) return;
        const r = await houses.buy(data.dbId, parseInt(houseId));
        player.outputChatBox(r.ok ? `!{#00E676}${r.msg}` : `!{#FF3B30}${r.msg}`);
    });

    mp.events.addCommand('caseledemovanzare', async (player) => {
        const list = await houses.listForSale();
        player.outputChatBox('!{#FFD600}===== CASE DE VANZARE =====');
        for (const h of list) player.outputChatBox(`#${h.id} ${h.adresa} - $${h.pret}`);
    });

    mp.events.addCommand('cumparaafacere', async (player, businessId) => {
        const data = players.getData(player);
        if (!data) return;
        const r = await businesses.buy(data.dbId, parseInt(businessId));
        player.outputChatBox(r.ok ? `!{#00E676}${r.msg}` : `!{#FF3B30}${r.msg}`);
    });

    mp.events.addCommand('afacerilemele', async (player) => {
        const data = players.getData(player);
        if (!data) return;
        const list = await businesses.listByOwner(data.dbId);
        player.outputChatBox('!{#FFD600}===== AFACERILE TALE =====');
        for (const b of list) player.outputChatBox(`#${b.id} ${b.nume} (${b.tip}) - venit/zi: $${b.venit_zilnic}`);
    });

    mp.events.addCommand('euvotez', async (player, ...args) => {
        const data = players.getData(player);
        if (!data) return player.outputChatBox('!{#FF3B30}Logheaza-te mai intai.');
        const nume = args.join(' ');
        if (!nume) return player.outputChatBox('!{#FF3B30}Foloseste: /euvotez <nume_jucator>');
        const r = await elections.vote(data.dbId, nume);
        player.outputChatBox(r.ok ? `!{#00E676}${r.msg}` : `!{#FF3B30}${r.msg}`);
    });

    mp.events.addCommand('presedinte', async (player) => {
        const pres = await elections.getCurrentPresident();
        if (!pres || !pres.nume) return player.outputChatBox('!{#A1A1AA}Nu exista presedinte ales.');
        player.outputChatBox(`!{#FFD600}Presedinte: ${pres.nume} | suma1=${pres.suma1} suma2=${pres.suma2}`);
    });

    mp.events.addCommand('setezetaxe', async (player, s1, s2) => {
        const data = players.getData(player);
        if (!data) return;
        const r = await elections.setPresidentTaxes(data.dbId, parseInt(s1), parseInt(s2));
        player.outputChatBox(r.ok ? `!{#00E676}${r.msg}` : `!{#FF3B30}${r.msg}`);
    });

    mp.events.addCommand('payday', async (player) => {
        // doar pentru testare/admin - declanseaza manual
        await payday.ruleazaPayday();
        player.outputChatBox('!{#00E676}PayDay rulat manual.');
    });

    console.log('[COMENZI] Inregistrate toate comenzile RP.');
}

module.exports = { register };
