-- ============================================================
-- Schema MySQL pentru serverul RageMP RP Romania
-- ============================================================

CREATE DATABASE IF NOT EXISTS ragemp_rp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ragemp_rp;

-- ---------- JUCATORI ----------
CREATE TABLE IF NOT EXISTS players (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nume VARCHAR(64) NOT NULL UNIQUE,
    parola_hash VARCHAR(255) NOT NULL,
    lvl INT NOT NULL DEFAULT 1,
    bani BIGINT NOT NULL DEFAULT 5000,
    cont_bancar BIGINT NOT NULL DEFAULT 0,
    factiune_id INT NULL,
    grad INT NOT NULL DEFAULT 0,
    pozitie_x FLOAT NOT NULL DEFAULT -1037.0,
    pozitie_y FLOAT NOT NULL DEFAULT -2737.0,
    pozitie_z FLOAT NOT NULL DEFAULT 20.0,
    ore_jucate INT NOT NULL DEFAULT 0,
    admin_level INT NOT NULL DEFAULT 0,
    creat_la DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_factiune (factiune_id)
);

-- ---------- FACTIUNI ----------
CREATE TABLE IF NOT EXISTS factions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nume VARCHAR(64) NOT NULL UNIQUE,
    tip ENUM('politie','medical','clan','vanzator') NOT NULL,
    culoare VARCHAR(16) NOT NULL DEFAULT '#FFD600',
    bonus_salariu INT NOT NULL DEFAULT 2000,
    bonus_cass INT NOT NULL DEFAULT 500,
    lider_id INT NULL,
    FOREIGN KEY (lider_id) REFERENCES players(id) ON DELETE SET NULL
);

-- ---------- MASINI PERSONALE ----------
CREATE TABLE IF NOT EXISTS vehicles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proprietar_id INT NOT NULL,
    model VARCHAR(64) NOT NULL,
    numar VARCHAR(16) NOT NULL UNIQUE,
    pret INT NOT NULL DEFAULT 0,
    locatie_x FLOAT NOT NULL,
    locatie_y FLOAT NOT NULL,
    locatie_z FLOAT NOT NULL,
    benzina FLOAT NOT NULL DEFAULT 100.0,
    blocata TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (proprietar_id) REFERENCES players(id) ON DELETE CASCADE
);

-- ---------- CASE PERSONALE ----------
CREATE TABLE IF NOT EXISTS houses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proprietar_id INT NULL,
    adresa VARCHAR(128) NOT NULL,
    pret INT NOT NULL DEFAULT 50000,
    intrare_x FLOAT NOT NULL,
    intrare_y FLOAT NOT NULL,
    intrare_z FLOAT NOT NULL,
    interior_id INT NOT NULL DEFAULT 1,
    blocata TINYINT(1) NOT NULL DEFAULT 1,
    de_vanzare TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (proprietar_id) REFERENCES players(id) ON DELETE SET NULL
);

-- ---------- AFACERI PERSONALE ----------
CREATE TABLE IF NOT EXISTS businesses (
    id INT AUTO_INCREMENT PRIMARY KEY,
    proprietar_id INT NULL,
    nume VARCHAR(128) NOT NULL,
    tip ENUM('benzinarie','magazin_24','restaurant','club','spalatorie','dealership') NOT NULL,
    adresa VARCHAR(128) NOT NULL,
    pret INT NOT NULL DEFAULT 100000,
    venit_zilnic INT NOT NULL DEFAULT 0,
    deschisa TINYINT(1) NOT NULL DEFAULT 1,
    de_vanzare TINYINT(1) NOT NULL DEFAULT 1,
    FOREIGN KEY (proprietar_id) REFERENCES players(id) ON DELETE SET NULL
);

-- ---------- PAYDAY CONFIG (singleton, id=1) ----------
CREATE TABLE IF NOT EXISTS payday_config (
    id INT PRIMARY KEY DEFAULT 1,
    tax_venit INT NOT NULL DEFAULT 10,
    tax_cas INT NOT NULL DEFAULT 5,
    bonus_factiune INT NOT NULL DEFAULT 2000,
    bonus_cass INT NOT NULL DEFAULT 500,
    actualizat_la DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

INSERT IGNORE INTO payday_config (id, tax_venit, tax_cas, bonus_factiune, bonus_cass) VALUES (1, 10, 5, 2000, 500);

-- ---------- ISTORIC PAYDAY ----------
CREATE TABLE IF NOT EXISTS payday_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    player_id INT NOT NULL,
    salariu_brut INT NOT NULL,
    tax_venit_aplicat INT NOT NULL,
    tax_cas_aplicat INT NOT NULL,
    bonus_factiune INT NOT NULL DEFAULT 0,
    bonus_cass INT NOT NULL DEFAULT 0,
    salariu_net INT NOT NULL,
    creat_la DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE
);

-- ---------- ALEGERI / PRESEDINTE ----------
CREATE TABLE IF NOT EXISTS elections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    castigator_id INT NULL,
    finalizata TINYINT(1) NOT NULL DEFAULT 0,
    FOREIGN KEY (castigator_id) REFERENCES players(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    votant_id INT NOT NULL,
    candidat_id INT NOT NULL,
    creat_la DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_vot (election_id, votant_id),
    FOREIGN KEY (election_id) REFERENCES elections(id) ON DELETE CASCADE,
    FOREIGN KEY (votant_id) REFERENCES players(id) ON DELETE CASCADE,
    FOREIGN KEY (candidat_id) REFERENCES players(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS president (
    id INT PRIMARY KEY DEFAULT 1,
    player_id INT NULL,
    suma1 INT NOT NULL DEFAULT 2000,  -- bonus salariu factiune (0-5000)
    suma2 INT NOT NULL DEFAULT 500,   -- bonus CASS (0-1000)
    inceput_mandat DATETIME NULL,
    FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE SET NULL
);
INSERT IGNORE INTO president (id, suma1, suma2) VALUES (1, 2000, 500);

-- ---------- SEED FACTIUNI ----------
INSERT IGNORE INTO factions (id, nume, tip, culoare, bonus_salariu, bonus_cass) VALUES
(1, 'Politia Romana',       'politie',  '#0A84FF', 3000, 800),
(2, 'Politia Locala',       'politie',  '#3CC3FF', 2500, 700),
(3, 'Politia Animalelor',   'politie',  '#00E676', 2200, 600),
(4, 'SMURD',                'medical',  '#FF453A', 2800, 750),
(5, 'Clan Europeni',        'clan',     '#FFD600', 1500, 400),
(6, 'Clan Americani',       'clan',     '#FF8A00', 1500, 400),
(7, 'Clan Rusi',            'clan',     '#9C27B0', 1500, 400),
(8, 'Clan Asiatici',        'clan',     '#00E5FF', 1500, 400),
(9, 'Clan Africani',        'clan',     '#FF3B30', 1500, 400),
(10,'Vanzatori',            'vanzator', '#A1A1AA', 1200, 300);
