import express from 'express';
import session from 'express-session';
import crypto from 'crypto';
import fs from 'fs';

export default function routes(db) {
    const app = express();

    app.use(session({
        secret: 'secret-key',
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false }
    }));

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    function hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex').toUpperCase();
    }

    app.post('/register', async (req, res) => {
        if (!req.body.email || !req.body.password || !req.body.name || !req.body.date) {
            res.status(400).send("Email, password, name and date are required.");
            return;
        }

        const { email, password, name, date } = req.body;
        const users = db.collection("Users");

        try {
            const hashedPassword = hashPassword(password);
            const insertResult = await users.insertOne({ email, password: hashedPassword, name, date });

            if (insertResult.acknowledged) {
                res.status(200).send("User registered successfully.");
            } else {
                res.status(500).send("Error registering user.");
            }
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).send("Error registering user.");
        }
    });

    app.post('/login', async (req, res) => {
        if (!req.body.email || !req.body.password) {
            res.status(400).send("Email and password are required.");
            return;
        }

        const { email, password } = req.body;
        const users = db.collection("Users");

        try {
            const user = await users.findOne({ email });

            if (!user) {
                res.status(401).send("Invalid email or password.");
                return;
            }

            const hashedPassword = hashPassword(password);

            if (user.password === hashedPassword) {
                req.session.user = { email: user.email, name: user.name, date: user.date };
                res.status(200).send("Login successful.");
            } else {
                res.status(401).send("Invalid email or password.");
            }
        } catch (error) {
            console.error("Error logging in user:", error);
            res.status(500).send("Error logging in user.");
        }
    });

    app.get('/profile', (req, res) => {
        console.log("Session user:", req.session.user); //controllo se l'utente viene registrato correttamente
        if (req.session.user) {
            res.status(200).json(req.session.user);
        } else {
            res.status(401).send("Unauthorized");
        }
    });

    app.get("/*", (req, res) => {
        let fPath = `${process.cwd()}/pages/${req.path}`;
        if (!req.path.includes(".")) fPath += ".html";
        if (fs.existsSync(fPath)) {
            res.sendFile(fPath);
        } else {
            res.status(404).send();
        }
    });

    return app;
}