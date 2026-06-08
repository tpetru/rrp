-- ============================================================
--  ADMIN comenzi - level 10
--  /teleportla <id|nume>   - tp la jucator
--  /teleportpe <id|nume>   - aduce jucatorul la tine
--  /masina <model>         - spawneaza vehicul langa tine
--  /addbani <id|nume> <s>  - adauga bani (cash) jucatorului
--  /setadmin <cid|nume> <0-10> - promoveaza/retrogradeaza
--  /admins                 - listeaza admini online
-- ============================================================

local function resolveTarget(arg)
    -- arg poate fi ID server sau nume
    local asNum = tonumber(arg)
    if asNum then
        local p = QBCore.Functions.GetPlayer(asNum)
        if p then return asNum, p end
    end
    return RRP_FindPlayerByName(arg)
end

QBCore.Commands.Add('teleportla', 'Admin 10: tp la jucator',
    { { name = 'target', help = 'ID sau nume' } }, true, function(source, args)
        if RRP_GetAdminLevel(source) < Config.Admin.requiredLevelForAll then
            return TriggerClientEvent('QBCore:Notify', source, '[Admin] Lvl 10 necesar.', 'error')
        end
        local targetSrc = resolveTarget(args[1])
        if not targetSrc then return TriggerClientEvent('QBCore:Notify', source, 'Target invalid.', 'error') end
        if targetSrc == source then return end
        local coords = GetEntityCoords(GetPlayerPed(targetSrc))
        SetEntityCoords(GetPlayerPed(source), coords.x + 1.0, coords.y, coords.z, false, false, false, true)
        TriggerClientEvent('QBCore:Notify', source, 'Teleportat la jucator.', 'success')
    end)

QBCore.Commands.Add('teleportpe', 'Admin 10: aduce jucatorul la tine',
    { { name = 'target', help = 'ID sau nume' } }, true, function(source, args)
        if RRP_GetAdminLevel(source) < Config.Admin.requiredLevelForAll then
            return TriggerClientEvent('QBCore:Notify', source, '[Admin] Lvl 10 necesar.', 'error')
        end
        local targetSrc = resolveTarget(args[1])
        if not targetSrc then return TriggerClientEvent('QBCore:Notify', source, 'Target invalid.', 'error') end
        if targetSrc == source then return end
        local coords = GetEntityCoords(GetPlayerPed(source))
        SetEntityCoords(GetPlayerPed(targetSrc), coords.x + 1.0, coords.y, coords.z, false, false, false, true)
        TriggerClientEvent('QBCore:Notify', targetSrc, 'Ai fost teleportat de admin.', 'primary')
        TriggerClientEvent('QBCore:Notify', source, 'Jucator adus la tine.', 'success')
    end)

QBCore.Commands.Add('masina', 'Admin 10: spawn vehicul',
    { { name = 'model', help = 'ex: adder, t20, sultan' } }, true, function(source, args)
        if RRP_GetAdminLevel(source) < Config.Admin.requiredLevelForAll then
            return TriggerClientEvent('QBCore:Notify', source, '[Admin] Lvl 10 necesar.', 'error')
        end
        local model = args[1]
        if not model then return TriggerClientEvent('QBCore:Notify', source, 'Foloseste: /masina <model>', 'error') end
        TriggerClientEvent('rrp:client:spawnVehicle', source, model)
    end)

QBCore.Commands.Add('addbani', 'Admin 10: adauga cash unui jucator',
    { { name = 'target', help = 'ID sau nume' }, { name = 'suma', help = 'pozitiv sau negativ' } }, true, function(source, args)
        if RRP_GetAdminLevel(source) < Config.Admin.requiredLevelForAll then
            return TriggerClientEvent('QBCore:Notify', source, '[Admin] Lvl 10 necesar.', 'error')
        end
        local suma = tonumber(args[#args])
        if not suma or suma == 0 then return TriggerClientEvent('QBCore:Notify', source, 'Suma invalida.', 'error') end
        local nameParts = {}
        for i = 1, #args - 1 do nameParts[#nameParts+1] = args[i] end
        local targetArg = table.concat(nameParts, ' ')
        local targetSrc, targetPlayer = resolveTarget(targetArg)
        if not targetSrc then return TriggerClientEvent('QBCore:Notify', source, 'Target invalid.', 'error') end
        if suma > 0 then targetPlayer.Functions.AddMoney('cash', suma, 'admin-grant')
        else targetPlayer.Functions.RemoveMoney('cash', -suma, 'admin-deduct') end
        TriggerClientEvent('QBCore:Notify', source, string.format('OK: $%d -> %s', suma, targetPlayer.PlayerData.name), 'success')
        TriggerClientEvent('QBCore:Notify', targetSrc, string.format('Admin %s: $%d', source, suma), 'primary')
    end)

QBCore.Commands.Add('setadmin', 'Admin 10: seteaza admin level',
    { { name = 'target', help = 'ID sau nume' }, { name = 'level', help = '0-10' } }, true, function(source, args)
        if RRP_GetAdminLevel(source) < Config.Admin.requiredLevelForAll then
            return TriggerClientEvent('QBCore:Notify', source, '[Admin] Lvl 10 necesar.', 'error')
        end
        local level = tonumber(args[#args])
        if not level or level < 0 or level > 10 then return TriggerClientEvent('QBCore:Notify', source, 'Level 0-10.', 'error') end
        local nameParts = {}
        for i = 1, #args - 1 do nameParts[#nameParts+1] = args[i] end
        local targetArg = table.concat(nameParts, ' ')
        local targetSrc, targetPlayer = resolveTarget(targetArg)
        local cid = targetPlayer and targetPlayer.PlayerData.citizenid or nil
        if not cid then
            -- try direct citizenid in db
            local row = MySQL.single.await('SELECT citizenid FROM players WHERE citizenid = ? LIMIT 1', { targetArg })
            cid = row and row.citizenid or nil
        end
        if not cid then return TriggerClientEvent('QBCore:Notify', source, 'Citizenid negasit.', 'error') end
        MySQL.query.await([[
            INSERT INTO rrp_admins (citizenid, admin_level) VALUES (?, ?)
            ON DUPLICATE KEY UPDATE admin_level = VALUES(admin_level)
        ]], { cid, level })
        AdminCache[cid] = level
        if targetSrc then TriggerClientEvent('QBCore:Notify', targetSrc, 'Esti acum Admin Level '..level, 'success') end
        TriggerClientEvent('QBCore:Notify', source, 'OK: '..cid..' -> Lvl '..level, 'success')
    end)

QBCore.Commands.Add('admins', 'Listeaza admini online', {}, false, function(source)
    local found = false
    TriggerClientEvent('chat:addMessage', source, { color = {255, 214, 0}, args = {'[Admin]', '== Admini online =='} })
    for _, src in ipairs(GetPlayers()) do
        src = tonumber(src)
        local lvl = RRP_GetAdminLevel(src)
        if lvl > 0 then
            local p = QBCore.Functions.GetPlayer(src)
            local nume = p and p.PlayerData.name or 'unknown'
            TriggerClientEvent('chat:addMessage', source, { color = {255, 255, 255}, args = {nume, 'Lvl '..lvl..' (ID '..src..')'} })
            found = true
        end
    end
    if not found then TriggerClientEvent('chat:addMessage', source, { color = {161, 161, 170}, args = {'', 'Niciun admin online.'} }) end
end)
