-- ============================================================
--  Romania RP - rrp-core - server/main.lua
--  Punct central. Expune QBCore object, init DB, helpers globale.
-- ============================================================

QBCore = exports['qb-core']:GetCoreObject()

-- Cache admin level per citizen-id (incarcat la conectare)
AdminCache = {}

-- ============================================================
--  Helpers globale
-- ============================================================

function RRP_GetPlayer(source)
    return QBCore.Functions.GetPlayer(source)
end

function RRP_GetCitizenId(source)
    local p = RRP_GetPlayer(source)
    return p and p.PlayerData.citizenid or nil
end

function RRP_GetAdminLevel(source)
    local cid = RRP_GetCitizenId(source)
    if not cid then return 0 end
    return AdminCache[cid] or 0
end

function RRP_FindPlayerByName(name)
    if not name or name == '' then return nil end
    local lower = string.lower(name)
    for _, src in ipairs(GetPlayers()) do
        local p = QBCore.Functions.GetPlayer(tonumber(src))
        if p then
            local full = (p.PlayerData.charinfo.firstname or '') .. ' ' .. (p.PlayerData.charinfo.lastname or '')
            if string.find(string.lower(full), lower, 1, true) or string.lower(p.PlayerData.name or '') == lower then
                return tonumber(src), p
            end
        end
    end
    return nil
end

function RRP_NotifyAdmin(source, msg, type)
    TriggerClientEvent('QBCore:Notify', source, '[Admin] ' .. msg, type or 'primary')
end

-- ============================================================
--  Incarca admin_level la conectare
-- ============================================================
RegisterNetEvent('QBCore:Server:OnPlayerLoaded', function()
    local src = source
    local cid = RRP_GetCitizenId(src)
    if not cid then return end
    local result = MySQL.scalar.await('SELECT admin_level FROM rrp_admins WHERE citizenid = ?', { cid })
    AdminCache[cid] = result or 0
    if AdminCache[cid] > 0 then
        TriggerClientEvent('QBCore:Notify', src, '[Admin] Esti logat ca Admin Level ' .. AdminCache[cid], 'success')
    end
end)

AddEventHandler('playerDropped', function()
    local src = source
    local cid = RRP_GetCitizenId(src)
    if cid then AdminCache[cid] = nil end
end)

-- ============================================================
--  Seed tabele la pornire
-- ============================================================
CreateThread(function()
    -- Asteapta qb-core ready
    while QBCore == nil do Wait(100) end

    -- Seed factiuni in QBCore Jobs (daca nu exista deja)
    for _, f in ipairs(Config.Factions) do
        if not QBCore.Shared.Jobs[f.job] then
            QBCore.Functions.AddJob(f.job, {
                label = f.nume,
                defaultDuty = true,
                grades = {
                    ['0'] = { name = 'Recrut', payment = 50 },
                    ['1'] = { name = 'Membru', payment = 75 },
                    ['2'] = { name = 'Senior', payment = 100 },
                    ['3'] = { name = 'Lider',  payment = 150, isboss = true },
                }
            })
        end
    end
    print('[RRP] ' .. #Config.Factions .. ' factiuni inregistrate in QBCore Jobs.')

    -- Seed config presedinte daca lipseste
    MySQL.query.await([[
        INSERT IGNORE INTO rrp_president (id, suma1, suma2)
        VALUES (1, ?, ?)
    ]], { Config.Payday.defaultSuma1, Config.Payday.defaultSuma2 })

    MySQL.query.await([[
        INSERT IGNORE INTO rrp_payday_config (id, tax_venit, tax_cas)
        VALUES (1, ?, ?)
    ]], { Config.Payday.defaultTaxVenit, Config.Payday.defaultTaxCAS })

    print('[RRP] Server pornit. PayDay ruleaza la fiecare ' .. Config.Payday.intervalMinutes .. ' min.')
end)
