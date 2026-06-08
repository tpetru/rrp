fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'rrp-core'
author 'Romania RP'
description 'Custom RP features: factiuni, PayDay extins, alegeri Presedinte, admin lvl 1-10'
version '1.0.0'

shared_scripts {
    'config.lua',
    '@ox_lib/init.lua'
}

server_scripts {
    '@oxmysql/lib/MySQL.lua',
    'server/main.lua',
    'server/factions.lua',
    'server/payday.lua',
    'server/elections.lua',
    'server/admin.lua'
}

client_scripts {
    'client/main.lua'
}

dependencies {
    'qb-core',
    'oxmysql',
    'ox_lib'
}
