-- ============================================================
--  PAYDAY - se ruleaza la fiecare Config.Payday.intervalMinutes
--  Formula: brut = lvl*1000 + random(0..999)
--  Net = brut - tax_venit% - tax_cas% + bonus_factiune (suma1) + bonus_cass (suma2)
--  Bonusurile se aplica DOAR daca jucatorul are job intr-o factiune configurata
-- ============================================================

-- 'lvl' este interpretat ca level-ul curent al gradului in QBCore job, +1
local function getPlayerLevel(playerData)
    local grade = playerData.job and playerData.job.grade and playerData.job.grade.level or 0
    return math.max(1, grade + 1)
end

local function getConfig()
    local cfg = MySQL.single.await('SELECT tax_venit, tax_cas FROM rrp_payday_config WHERE id = 1') or { tax_venit = Config.Payday.defaultTaxVenit, tax_cas = Config.Payday.defaultTaxCAS }
    local pres = MySQL.single.await('SELECT suma1, suma2 FROM rrp_president WHERE id = 1') or { suma1 = Config.Payday.defaultSuma1, suma2 = Config.Payday.defaultSuma2 }
    return cfg.tax_venit, cfg.tax_cas, pres.suma1, pres.suma2
end

function RRP_RunPayday()
    local tax_venit, tax_cas, suma1, suma2 = getConfig()
    print(string.format('[PAYDAY] Tax venit=%d%% Tax CAS=%d%% Suma1=%d Suma2=%d', tax_venit, tax_cas, suma1, suma2))
    local count = 0
    for _, src in ipairs(GetPlayers()) do
        src = tonumber(src)
        local p = QBCore.Functions.GetPlayer(src)
        if p then
            local lvl = getPlayerLevel(p.PlayerData)
            local brut = lvl * 1000 + math.random(0, 999)
            local tv = math.floor(brut * tax_venit / 100)
            local tc = math.floor(brut * tax_cas / 100)
            local fac = RRP_PlayerHasFaction(p.PlayerData)
            local b1 = fac and suma1 or 0
            local b2 = fac and suma2 or 0
            local net = brut - tv - tc + b1 + b2
            p.Functions.AddMoney('bank', net, 'payday')

            MySQL.insert('INSERT INTO rrp_payday_history (citizenid, nume, salariu_brut, tax_venit, tax_cas, bonus_factiune, bonus_cass, salariu_net) VALUES (?,?,?,?,?,?,?,?)',
                { p.PlayerData.citizenid, p.PlayerData.name, brut, tv, tc, b1, b2, net })

            TriggerClientEvent('chat:addMessage', src, { color = {255, 214, 0}, args = {'[PAYDAY]', string.format('Brut $%d | -venit $%d | -CAS $%d | +fac $%d | +CASS $%d = NET $%d', brut, tv, tc, b1, b2, net)} })
            count = count + 1
        end
    end
    print('[PAYDAY] Procesati ' .. count .. ' jucatori online.')
end

-- Cron simplu in Lua
CreateThread(function()
    while true do
        Wait(Config.Payday.intervalMinutes * 60 * 1000)
        RRP_RunPayday()
    end
end)

-- Forteaza manual (doar admin lvl 10)
QBCore.Commands.Add('payday', 'Forteaza PayDay (admin 10)', {}, false, function(source)
    if RRP_GetAdminLevel(source) < 10 then
        return TriggerClientEvent('QBCore:Notify', source, '[Admin] Lvl 10 necesar.', 'error')
    end
    RRP_RunPayday()
    TriggerClientEvent('QBCore:Notify', source, 'PayDay rulat manual.', 'success')
end)
