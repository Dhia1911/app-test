const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000;

// Middleware pour parser le JSON
app.use(express.json());

// Initialisation de la base de données SQLite (en mémoire pour des tests simples)
// Vous pouvez remplacer ':memory:' par './mabase.sqlite' pour sauvegarder dans un fichier
const db = new sqlite3.Database(':memory:');

db.serialize(() => {
    // Création d'une table "users"
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL
        )
    `);

    // Insertion de données de test
    const stmt = db.prepare("INSERT INTO users (name, email) VALUES (?, ?)");
    stmt.run("Alice", "alice@example.com");
    stmt.run("Bob", "bob@example.com");
    stmt.finalize();
});

// Route GET : Récupérer tous les utilisateurs
app.get('/users', (req, res) => {
    db.all("SELECT * FROM users", [], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json({ data: rows });
    });
});

// Route POST : Ajouter un utilisateur
app.post('/users', (req, res) => {
    const { name, email } = req.body;
    db.run("INSERT INTO users (name, email) VALUES (?, ?)", [name, email], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ message: "Utilisateur ajouté", id: this.lastID, name, email });
    });
});

// Lancement du serveur
app.listen(port, () => {
    console.log(`Serveur démarré sur http://localhost:${port}`);
    console.log(`Testez l'API avec GET http://localhost:${port}/users`);
});
