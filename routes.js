import express from 'express';
import session from 'express-session';
import crypto from 'crypto';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';

dotenv.config();

// multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // where to save pics
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${path.basename(file.originalname)}`);
    }
});

const upload = multer({ storage: storage });

const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
    }
});

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

    app.use('/uploads', express.static('uploads'));

    function hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex').toUpperCase();
    }

    app.post('/api/register', upload.single('profilepicture'), async (req, res) => {
        if (!req.body.email || !req.body.password || !req.body.name || !req.body.date) {
            res.status(400).send("Email, password, name, and date are required.");
            return;
        }

        const { email, password, name, date } = req.body;
        const profilePicture = req.file ? req.file.filename : null;
        const users = db.collection("Users");

        try {
            const hashedPassword = hashPassword(password);
            const insertResult = await users.insertOne({ email, password: hashedPassword, name, date, profilePicture });

            if (insertResult.acknowledged) {
                const mailOptions = {
                    from: '"Test" <test@example.com>',
                    to: 'recipient@example.com',
                    subject: 'Welcome to Spotify!',
                    text: `Hi ${name},\n\nThank you for registering on Spotify! We're excited to have you on board.\n\nBest regards,\nSpotify Team`
                };

                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error("Error sending email:", error);
                    } else {
                        console.log('Email sent: ' + info.response);
                    }
                });

                res.status(200).send("User registered successfully.");
            } else {
                res.status(500).send("Error registering user.");
            }
        } catch (error) {
            console.error("Error registering user:", error);
            res.status(500).send("Error registering user.");
        }
    });

    app.post('/api/profile', upload.single('profilepicture'), async (req, res) => {
        if (!req.session.user) {
            res.status(401).send("Unauthorized");
            return;
        }

        const { email, name, password, date } = req.body;
        const profilePicture = req.file ? req.file.filename : null;
        const users = db.collection("Users");

        const updateData = {
            email,
            name,
            date,
            ...(password && { password: hashPassword(password) }),
            ...(profilePicture && { profilePicture })
        };

        try {
            const updatedUser = await users.updateOne(
                { email: req.session.user.email },
                { $set: updateData }
            );

            if (updatedUser.matchedCount > 0) {
                req.session.user.email = email;
                req.session.user.name = name;
                req.session.user.date = date;
                req.session.user.profilePicture = profilePicture;

                res.status(200).send("Profile updated successfully.");
            } else {
                res.status(500).send("Error updating profile.");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            res.status(500).send("Error updating profile.");
        }
    });

    app.post('/api/login', async (req, res) => {
        if (!req.body.email || !req.body.password) {
            res.status(400).send("Email and password are required.");
            return;
        }

        const { email, password } = req.body;
        const users = db.collection("Users");

        try {
            const user = await users.findOne({ email, password: hashPassword(password) });

            if (!user) {
                res.status(401).send("Invalid email or password.");
                return;
            }
            req.session.user = { email: user.email, name: user.name, date: user.date, profilePicture: user.profilePicture };
            res.status(200).send("Login successful.");
        } catch (error) {
            console.error("Error logging in user:", error);
            res.status(500).send("Error logging in user.");
        }
    });

    app.get('/api/profile', (req, res) => {
        if (req.session.user) {
            res.status(200).json(req.session.user);
        } else {
            res.status(401).send("Unauthorized");
        }
    });

    app.delete('/api/profile', async (req, res) => {
        if (!req.session.user) {
            res.status(401).send("Unauthorized");
            return;
        }
        const users = db.collection("Users");

        try {
            const deleteResult = await users.deleteOne({ email: req.session.user.email });

            if (deleteResult.deletedCount > 0) {
                req.session.destroy(err => {
                    if (err) {
                        console.error("Error destroying session:", err);
                        res.status(500).send("Error deleting profile.");
                    } else {
                        res.status(200).send("Profile deleted successfully.");
                    }
                });
            } else {
                res.status(500).send("Error deleting profile.");
            }
        } catch (error) {
            console.error("Error deleting profile:", error);
            res.status(500).send("Error deleting profile.");
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