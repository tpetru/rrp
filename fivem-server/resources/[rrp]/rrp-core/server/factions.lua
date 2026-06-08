-- ============================================================
--  /factiuni - listeaza toate factiunile
--  /alaturafactiune <id> - admin lvl >=5 alatura un player la factiune
-- ============================================================

QBCore.Commands.Add('factiuni', 'Lista factiuni', {}, false, function(source)
    TriggerClientEvent('chat:addMessage', source, { color = {255, 214, 0}, args = {'[Factiuni]', '===== Lista Factiuni ====='} })
    for _, f in ipairs(Config.Factions) do
        TriggerClientEvent('chat:addMessage', source, {
            color = {200, 200, 200},
            args = { '['..f.id..'] '..f.nume, f.tip..' | bonus +$'..f.bonus_salariu..' / CASS +$'..f.bonus_cass }
        })
    end
end)

QBCore.Commands.Add('alaturafactiune', 'Atribuie factiune unui jucator (admin 5+)',
    { { name = 'id_target', help = 'ID server target' }, { name = 'factiune_id', help = '1-10' } },
    true, function(source, args)
        if RRP_GetAdminLevel(source) < 5 then
            return TriggerClientEvent('QBCore:Notify', source, '[Admin] Nu ai permisiuni (Lvl 5+).', 'error')
        end
        local targetSrc = tonumber(args[1])
        local fid = tonumber(args[2])
        local fac = nil
        for _, f in ipairs(Config.Factions) do if f.id == fid then fac = f; break end end
        if not fac then return TriggerClientEvent('QBCore:Notify', source, 'Factiune invalida.', 'error') end
        local target = QBCore.Functions.GetPlayer(targetSrc)
        if not target then return TriggerClientEvent('QBCore:Notify', source, 'Target offline.', 'error') end
        target.Functions.SetJob(fac.job, 0)
        TriggerClientEvent('QBCore:Notify', targetSrc, 'Ai fost alaturat la '..fac.nume, 'success')
        TriggerClientEvent('QBCore:Notify', source, 'OK: '..target.PlayerData.name..' -> '..fac.nume, 'success')
    end)

-- Verifica daca jucatorul are vreuna din factiunile din lista de joburi configurate
function RRP_PlayerHasFaction(playerData)
    if not playerData or not playerData.job then return nil end
    for _, f in ipairs(Config.Factions) do
        if f.job == playerData.job.name then return f end
    end
    return nil
end
