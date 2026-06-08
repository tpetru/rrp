-- Client-side: spawn vehicul cerut de server (comanda /masina)

RegisterNetEvent('rrp:client:spawnVehicle', function(model)
    local hash = GetHashKey(model)
    if not IsModelInCdimage(hash) or not IsModelAVehicle(hash) then
        TriggerEvent('QBCore:Notify', 'Model invalid: '..model, 'error')
        return
    end
    RequestModel(hash)
    while not HasModelLoaded(hash) do Wait(50) end
    local ped = PlayerPedId()
    local coords = GetEntityCoords(ped)
    local heading = GetEntityHeading(ped)
    local veh = CreateVehicle(hash, coords.x + 2.0, coords.y, coords.z, heading, true, false)
    SetEntityAsMissionEntity(veh, true, true)
    SetVehicleNumberPlateText(veh, 'ADMIN')
    SetModelAsNoLongerNeeded(hash)
    TriggerEvent('QBCore:Notify', 'Masina spawnata: '..model, 'success')
end)

-- Welcome
AddEventHandler('QBCore:Client:OnPlayerLoaded', function()
    TriggerEvent('chat:addMessage', { color = {255, 214, 0}, args = {'Romania RP', 'Bun venit! Comenzi: /factiuni /euvotez /presedinte /admins'} })
end)
