-- Migratie: adauga coloana admin_level si seteaza primul admin
-- Ruleaza DOAR daca ai deja baza creata fara aceasta coloana

USE ragemp_rp;

-- Adauga coloana admin_level
ALTER TABLE players
    ADD COLUMN admin_level INT NOT NULL DEFAULT 0;

-- IMPORTANT: dupa migratie, seteaza-te tu ca admin level 10 cu:
-- UPDATE players SET admin_level = 10 WHERE nume = 'NumeleTau_InJoc';
