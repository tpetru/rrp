// Client-side script - RageMP Romania RP
// Se incarca pentru fiecare jucator la conectare

mp.events.add('playerReady', () => {
    mp.gui.chat.push('!{#FFD600}=== ROMANIA RP - RageMP ===');
    mp.gui.chat.push('!{#00E5FF}Foloseste !{#FFFFFF}/login <parola> !{#00E5FF}pentru a te loga.');
    mp.gui.chat.push('!{#00E5FF}Nou? Foloseste !{#FFFFFF}/inregistrare <parola>.');
});

mp.events.add('render', () => {
    // HUD basic - se poate extinde
});
