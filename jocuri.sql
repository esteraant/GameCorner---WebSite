DROP TABLE IF EXISTS jocuri CASCADE;
DROP TYPE IF EXISTS tipuri_jocuri CASCADE;
DROP TYPE IF EXISTS nivel_complexitate CASCADE;

CREATE TYPE tipuri_jocuri AS ENUM('societate', 'party-game', 'familie', 'educativ', 'puzzle');
CREATE TYPE nivel_complexitate AS ENUM('ușor', 'mediu', 'greu', 'expert');

CREATE TABLE jocuri (
    id serial PRIMARY KEY,
    nume VARCHAR(50) UNIQUE NOT NULL,
    descriere TEXT,
    pret NUMERIC(8,2) NOT NULL CHECK (pret > 0),
    durata_minute INT NOT NULL CHECK (durata_minute > 0),
    min_jucatori INT NOT NULL CHECK (min_jucatori > 0),
    max_jucatori INT NOT NULL CHECK (max_jucatori >= min_jucatori),
    varsta_minima INT CHECK (varsta_minima >= 3),
    complexitate nivel_complexitate NOT NULL,
    tip_joc tipuri_jocuri NOT NULL,
    categorie VARCHAR(200) NOT NULL DEFAULT '',
    componente VARCHAR(500),
    imagine VARCHAR(300),
    are_mod_solo BOOLEAN NOT NULL DEFAULT FALSE,
    data_adaugarii TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO jocuri
(nume, descriere, pret, durata_minute, min_jucatori, max_jucatori, varsta_minima, complexitate, tip_joc, categorie, componente, imagine, are_mod_solo)
VALUES
('Catan', 'Joc de strategie.', 189.99, 90, 3, 4, 10, 'mediu', 'familie', 'strategie,multiplayer', 'carti, zaruri', 'catan.jpg', FALSE),
('Dixit', 'Joc de imaginatie.', 149.99, 30, 3, 6, 8, 'ușor', 'familie', 'multiplayer,creativ', 'carti ilustrate', 'dixit.jpg', FALSE),
('Codenames', 'Joc de cuvinte.', 99.99, 20, 4, 8, 10, 'ușor', 'party-game', 'multiplayer,strategie', 'carti', 'codenames.jpg', FALSE),
('Dobble', 'Joc de observatie.', 69.99, 15, 2, 8, 6, 'ușor', 'familie', 'actiune,multiplayer', 'carti', 'dobble.jpg', FALSE),
('Activity', 'Joc de petrecere.', 129.99, 45, 3, 12, 12, 'ușor', 'party-game', 'multiplayer,actiune', 'tabla de joc', 'activity.jpg', FALSE),

('Pandemic', 'Salvati lumea.', 199.99, 60, 2, 4, 10, 'mediu', 'societate', 'strategie,singleplayer', 'cuburi, pioni', 'pandemic.jpg', TRUE),
('Arcs', 'Strategie spatiala.', 299.99, 120, 2, 4, 14, 'expert', 'societate', 'strategie,singleplayer', 'miniaturi', 'arcs.jpg', TRUE),
('Azul', 'Placute strategice.', 179.99, 45, 2, 4, 8, 'mediu', 'puzzle', 'multiplayer,strategie', 'placute', 'azul.jpg', FALSE),
('Monopoly', 'Tranzactionare.', 119.99, 120, 2, 6, 8, 'ușor', 'familie', 'strategie,multiplayer', 'bani, zaruri', 'monopoly.jpg', FALSE),
('Ticket to Ride', 'Trenuri.', 219.99, 60, 2, 5, 8, 'mediu', 'familie', 'strategie,multiplayer', 'vagoane, bilete', 'ticket-to-ride.jpg', FALSE),

('Skull', 'Bluff.', 75.99, 20, 3, 6, 10, 'mediu', 'party-game', 'strategie,multiplayer', 'discuri', 'skull.jpg', FALSE),
('Carcassonne', 'Medieval.', 159.99, 45, 2, 5, 8, 'mediu', 'puzzle', 'strategie,multiplayer', 'placute, meeples', 'carcassonne.jpg', TRUE),
('7 Wonders', 'Civilizatii.', 209.99, 40, 2, 7, 10, 'greu', 'societate', 'strategie,multiplayer', 'carti, monede', '7wonders.jpg', FALSE),
('Terraforming Mars', 'Marte.', 279.99, 150, 1, 5, 12, 'expert', 'societate', 'strategie,singleplayer', 'resurse, carti', 'terraforming-mars.jpg', TRUE),
('Splendor', 'Economie.', 139.99, 30, 2, 4, 10, 'mediu', 'familie', 'strategie,multiplayer', 'jetoane, carti', 'splendor.jpg', FALSE),

('Wingspan', 'Pasari.', 245.00, 70, 1, 5, 10, 'mediu', 'societate', 'strategie,singleplayer', 'ouă, jetoane', 'wingspan.jpg', TRUE),
('Exploding Kittens', 'Exploziv.', 89.00, 15, 2, 5, 7, 'ușor', 'party-game', 'multiplayer,actiune', 'carti', 'exploding-kittens.jpg', FALSE),
('Cascadia', 'Ecosistem.', 175.50, 45, 1, 4, 10, 'ușor', 'puzzle', 'strategie,singleplayer', 'jetoane', 'cascadia.jpg', TRUE),
('Root', 'Padure.', 320.00, 90, 2, 4, 14, 'expert', 'societate', 'strategie,multiplayer', 'miniaturi', 'root.jpg', FALSE),
('7 Wonders Duel', 'Doi jucatori.', 125.00, 30, 2, 2, 10, 'mediu', 'familie', 'strategie,multiplayer', 'carti', '7wonders-duel.jpg', FALSE);

('Cortex Challenge', 'Antrenează-ți creierul prin provocări de logică, memorie și observație.', 65.00, 15, 2, 6, 8, 'ușor', 'educativ', 'educativ,logica,observatie', '80 de cărți de test, 10 cărți tactile, 6 puzzle-uri creier', 'cortex.jpg', FALSE),
('Timeline: Invenții', 'Plasează evenimentele istorice și invențiile în ordinea corectă a timpului.', 55.00, 15, 2, 8, 8, 'ușor', 'educativ', 'educativ,istorie,card-game', '110 cărți ilustrate', 'timeline.jpg', FALSE);

GRANT ALL PRIVILEGES ON TABLE jocuri TO estera;
GRANT USAGE, SELECT ON SEQUENCE jocuri_id_seq TO estera;