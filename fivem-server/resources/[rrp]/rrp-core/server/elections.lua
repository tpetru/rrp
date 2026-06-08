-- ============================================================
--  ALEGERI PRESEDINTE - voturile doar duminica
--  /euvotez <nume>          - 1 vot/saptamana/jucator
--  /presedinte              - vezi presedintele si taxele curente
--  /setezetaxe <s1> <s2>    - doar Presedinte. s1[0-5000] s2[0-1000]
--  /finalizeazaalegerile    - doar admin lvl 10
-- ============================================================

local function getCurrentSundayBoundary()
    -- Returneaza inceputul (00:00) si sfarsitul (23:59:59) duminicii curente (sau urmatoare)
    local now = os.time()
    local t = os.date('*t', now)
    -- wday: 1=Sunday, 7=Saturday in Lua os.date
    local daysToSunday = (1 - t.wday) % 7
    if daysToSunday == 0 and (t.hour > 23 or (t.hour == 23 and t.min >= 55)) then
        daysToSunday = 7
    end
    local startTs = now + daysToSunday * 86400
    local st = os.date('*t', startTs)
    st.hour, st.min, st.sec = 0, 0, 0
    local startEpoch = os.time(st)
    local endEpoch = startEpoch + 86399
    return startEpoch, endEpoch
end

local function ensureActiveElection()
    local startE, endE = getCurrentSundayBoundary()
    local startStr = os.date('%Y-%m-%d %H:%M:%S', startE)
    local endStr = os.date('%Y-%m-%d %H:%M:%S', endE)
    local existing = MySQL.single.await('SELECT id FROM rrp_elections WHERE start_date = ?', { startStr })
    if existing then return existing.id, startE, endE end
    local id = MySQL.insert.await('INSERT INTO rrp_elections (start_date, end_date) VALUES (?, ?)', { startStr, endStr })
    return id, startE, endE
end

local function isVotingDay()
    -- Permite doar duminica intre 00:00 si 23:59
    return os.date('*t').wday == 1
end

QBCore.Commands.Add(Config.Elections.voteCommand, 'Voteaza Presedinte',
    { { name = 'nume', help = 'Numele candidatului (prenume/familie)' } }, true, function(source, args)
        if not isVotingDay() then
            return TriggerClientEvent('QBCore:Notify', source, 'Voturile se accepta doar duminica.', 'error')
        end
        local voterCid = RRP_GetCitizenId(source)
        if not voterCid then return end
        local nume = table.concat(args, ' ')

        -- candidat: cauta online sau in db players (qb-core characters)
        local candCid, candNume
        local _, candPlayer = RRP_FindPlayerByName(nume)
        if candPlayer then
            candCid = candPlayer.PlayerData.citizenid
            candNume = (candPlayer.PlayerData.charinfo.firstname or '') .. ' ' .. (candPlayer.PlayerData.charinfo.lastname or '')
        else
            -- cauta offline in db
            local row = MySQL.single.await([[
                SELECT citizenid, JSON_VALUE(charinfo, '$.firstname') AS firstname, JSON_VALUE(charinfo, '$.lastname') AS lastname
                FROM players
                WHERE LOWER(CONCAT(JSON_VALUE(charinfo, '$.firstname'), ' ', JSON_VALUE(charinfo, '$.lastname'))) LIKE LOWER(?)
                LIMIT 1
            ]], { '%'..nume..'%' })
            if row then candCid = row.citizenid; candNume = row.firstname..' '..row.lastname end
        end
        if not candCid then return TriggerClientEvent('QBCore:Notify', source, 'Candidat inexistent: '..nume, 'error') end

        local electionId = ensureActiveElection()
        local already = MySQL.scalar.await('SELECT id FROM rrp_votes WHERE election_id = ? AND votant_cid = ?', { electionId, voterCid })
        if already then return TriggerClientEvent('QBCore:Notify', source, 'Ai votat deja la aceasta alegere.', 'error') end

        MySQL.insert('INSERT INTO rrp_votes (election_id, votant_cid, candidat_cid, candidat_nume) VALUES (?, ?, ?, ?)',
            { electionId, voterCid, candCid, candNume })
        TriggerClientEvent('QBCore:Notify', source, 'Vot inregistrat pentru '..candNume, 'success')
    end)

QBCore.Commands.Add('presedinte', 'Vezi Presedintele curent', {}, false, function(source)
    local row = MySQL.single.await('SELECT * FROM rrp_president WHERE id = 1')
    if not row or not row.citizenid then
        return TriggerClientEvent('QBCore:Notify', source, 'Nu exista Presedinte ales.', 'primary')
    end
    TriggerClientEvent('QBCore:Notify', source, string.format('Presedinte: %s | suma1=%d suma2=%d', row.nume or '?', row.suma1, row.suma2), 'primary')
end)

QBCore.Commands.Add('setezetaxe', 'Presedinte: seteaza suma1 si suma2',
    { { name = 'suma1', help = '0-5000' }, { name = 'suma2', help = '0-1000' } }, true, function(source, args)
        local cid = RRP_GetCitizenId(source)
        local pres = MySQL.single.await('SELECT citizenid FROM rrp_president WHERE id = 1')
        if not pres or pres.citizenid ~= cid then
            return TriggerClientEvent('QBCore:Notify', source, 'Doar Presedintele poate.', 'error')
        end
        local s1, s2 = tonumber(args[1]), tonumber(args[2])
        if not s1 or s1 < Config.Elections.suma1Min or s1 > Config.Elections.suma1Max then
            return TriggerClientEvent('QBCore:Notify', source, 'suma1 trebuie ['..Config.Elections.suma1Min..'-'..Config.Elections.suma1Max..']', 'error')
        end
        if not s2 or s2 < Config.Elections.suma2Min or s2 > Config.Elections.suma2Max then
            return TriggerClientEvent('QBCore:Notify', source, 'suma2 trebuie ['..Config.Elections.suma2Min..'-'..Config.Elections.suma2Max..']', 'error')
        end
        MySQL.update('UPDATE rrp_president SET suma1 = ?, suma2 = ? WHERE id = 1', { s1, s2 })
        TriggerClientEvent('QBCore:Notify', source, 'Taxe actualizate: s1='..s1..' s2='..s2, 'success')
    end)

QBCore.Commands.Add('finalizeazaalegerile', 'Admin 10: finalizeaza alegerea', {}, false, function(source)
    if RRP_GetAdminLevel(source) < 10 then
        return TriggerClientEvent('QBCore:Notify', source, '[Admin] Lvl 10 necesar.', 'error')
    end
    local electionId = ensureActiveElection()
    local rows = MySQL.query.await('SELECT candidat_cid, candidat_nume, COUNT(*) AS voturi FROM rrp_votes WHERE election_id = ? GROUP BY candidat_cid, candidat_nume ORDER BY voturi DESC LIMIT 1', { electionId })
    if not rows or #rows == 0 then
        MySQL.update('UPDATE rrp_elections SET finalizata = 1 WHERE id = ?', { electionId })
        return TriggerClientEvent('QBCore:Notify', source, 'Alegere finalizata fara voturi.', 'primary')
    end
    local w = rows[1]
    MySQL.update('UPDATE rrp_elections SET finalizata = 1, castigator_cid = ? WHERE id = ?', { w.candidat_cid, electionId })
    MySQL.update('UPDATE rrp_president SET citizenid = ?, nume = ?, inceput_mandat = NOW() WHERE id = 1', { w.candidat_cid, w.candidat_nume })
    TriggerClientEvent('QBCore:Notify', source, 'Castigator: '..w.candidat_nume..' ('..w.voturi..' voturi)', 'success')
end)
