-- ============================================================
--  rrp-core - tabele MySQL custom (peste schema QBCore)
--  Ruleaza dupa qb-core install
-- ============================================================

CREATE TABLE IF NOT EXISTS rrp_admins (
    citizenid VARCHAR(50) NOT NULL PRIMARY KEY,
    admin_level INT NOT NULL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rrp_payday_config (
    id INT PRIMARY KEY DEFAULT 1,
    tax_venit INT NOT NULL DEFAULT 10,
    tax_cas INT NOT NULL DEFAULT 5,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS rrp_president (
    id INT PRIMARY KEY DEFAULT 1,
    citizenid VARCHAR(50) NULL,
    nume VARCHAR(128) NULL,
    suma1 INT NOT NULL DEFAULT 2000,
    suma2 INT NOT NULL DEFAULT 500,
    inceput_mandat DATETIME NULL
);

CREATE TABLE IF NOT EXISTS rrp_elections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    castigator_cid VARCHAR(50) NULL,
    finalizata TINYINT(1) NOT NULL DEFAULT 0,
    UNIQUE KEY uniq_start (start_date)
);

CREATE TABLE IF NOT EXISTS rrp_votes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    election_id INT NOT NULL,
    votant_cid VARCHAR(50) NOT NULL,
    candidat_cid VARCHAR(50) NOT NULL,
    candidat_nume VARCHAR(128) NOT NULL,
    creat_la DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uniq_vot (election_id, votant_cid),
    FOREIGN KEY (election_id) REFERENCES rrp_elections(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rrp_payday_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    citizenid VARCHAR(50) NOT NULL,
    nume VARCHAR(128),
    salariu_brut INT NOT NULL,
    tax_venit INT NOT NULL,
    tax_cas INT NOT NULL,
    bonus_factiune INT NOT NULL DEFAULT 0,
    bonus_cass INT NOT NULL DEFAULT 0,
    salariu_net INT NOT NULL,
    creat_la DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_cid (citizenid)
);

-- Date initiale
INSERT IGNORE INTO rrp_payday_config (id, tax_venit, tax_cas) VALUES (1, 10, 5);
INSERT IGNORE INTO rrp_president (id, suma1, suma2) VALUES (1, 2000, 500);
