Config = {}

-- ============================================================
--  FACTIUNI - se vor sincroniza in QBCore Jobs si in tabela proprie
-- ============================================================
Config.Factions = {
    { id = 1,  nume = 'Politia Romana',     job = 'politia_romana',  tip = 'politie',  culoare = '#0A84FF', bonus_salariu = 3000, bonus_cass = 800 },
    { id = 2,  nume = 'Politia Locala',     job = 'politia_locala',  tip = 'politie',  culoare = '#3CC3FF', bonus_salariu = 2500, bonus_cass = 700 },
    { id = 3,  nume = 'Politia Animalelor', job = 'politia_anim',    tip = 'politie',  culoare = '#00E676', bonus_salariu = 2200, bonus_cass = 600 },
    { id = 4,  nume = 'SMURD',              job = 'smurd',           tip = 'medical',  culoare = '#FF453A', bonus_salariu = 2800, bonus_cass = 750 },
    { id = 5,  nume = 'Clan Europeni',      job = 'clan_eu',         tip = 'clan',     culoare = '#FFD600', bonus_salariu = 1500, bonus_cass = 400 },
    { id = 6,  nume = 'Clan Americani',     job = 'clan_us',         tip = 'clan',     culoare = '#FF8A00', bonus_salariu = 1500, bonus_cass = 400 },
    { id = 7,  nume = 'Clan Rusi',          job = 'clan_ru',         tip = 'clan',     culoare = '#9C27B0', bonus_salariu = 1500, bonus_cass = 400 },
    { id = 8,  nume = 'Clan Asiatici',      job = 'clan_as',         tip = 'clan',     culoare = '#00E5FF', bonus_salariu = 1500, bonus_cass = 400 },
    { id = 9,  nume = 'Clan Africani',      job = 'clan_af',         tip = 'clan',     culoare = '#FF3B30', bonus_salariu = 1500, bonus_cass = 400 },
    { id = 10, nume = 'Vanzatori',          job = 'vanzator',        tip = 'vanzator', culoare = '#A1A1AA', bonus_salariu = 1200, bonus_cass = 300 },
}

-- ============================================================
--  PAYDAY - se ruleaza la ora fixa (default ora 0 a sistemului)
--  Salariu = lvl * 1000 + random(0..999)
--  Taxe + bonus factiune (suma1) + bonus CASS (suma2) seteaza Presedinte
-- ============================================================
Config.Payday = {
    intervalMinutes = 60,     -- la fiecare 60 min reale
    defaultTaxVenit = 10,     -- %
    defaultTaxCAS = 5,        -- %
    defaultSuma1 = 2000,      -- bonus factiune (0-5000)
    defaultSuma2 = 500,       -- bonus CASS (0-1000)
}

-- ============================================================
--  ALEGERI PRESEDINTE
--  Voturile se accepta DOAR duminica (osDate '%w' == '0')
--  Presedintele controleaza suma1 (0-5000) si suma2 (0-1000) via /setezetaxe
-- ============================================================
Config.Elections = {
    suma1Min = 0,    suma1Max = 5000,
    suma2Min = 0,    suma2Max = 1000,
    voteCommand = 'euvotez',
}

-- ============================================================
--  ADMIN - level 1..10. Level 10 = full
-- ============================================================
Config.Admin = {
    requiredLevelForAll = 10, -- /teleportla /teleportpe /masina /addbani /setadmin
}
