import express from "express";
import { ObjectId } from "mongodb";
import session from 'express-session';
import crypto from 'crypto';
import fs from 'fs';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcrypt';

dotenv.config(); //for .env file

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
    app.use(cookieParser());
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    app.use('/uploads', express.static('uploads'));

    app.use(function (req, res, next) {
        res.setHeader("Permissions-Policy", "autoplay=(self)");
        next();
    });

    function hashPassword(password) {
        return crypto.createHash('sha256').update(password).digest('hex').toUpperCase();
    }

    //registration
    app.post('/api/register', async (req, res) => {
        if (!req.body.Email || !req.body.Password || !req.body.Name || !req.body.DateOfBirth) {
            res.status(400).send("Email, password, name, and date are required.");
            return;
        }

        const { Email, Password, Name, DateOfBirth } = req.body;
        const users = db.collection("Users");

        try {
            const existingUser = await users.findOne({ Email: Email });
            if (existingUser) {
                return res.status(400).send("Email is already in use.");
            }

            const hashedPassword = hashPassword(Password);
            const insertResult = await users.insertOne({ Email, Password: hashedPassword, Name, DateOfBirth });

            if (insertResult.acknowledged) {
                const mailOptions = {
                    from: '"Test" <test@example.com>',
                    to: 'recipient@example.com',
                    subject: 'Welcome to Spotify!',
                    text: `Hi ${Name},\n\nThank you for registering on Spotify! We're excited to have you on board.\n\nBest regards,\nSpotify Team`
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

    //updating profile
    app.post('/api/profile', async (req, res) => {
        if (!req.session.user) {
            return res.status(401).send('Unauthorized');
        }

        const { Email, Name, Password, DateOfBirth, IsPublisher } = req.body;

        try {
            const users = db.collection('Users');
            const updateData = {
                Email,
                Name,
                DateOfBirth,
                IsPublisher
            };

            if (Password) {
                const hashedPassword = await bcrypt.hash(Password, 10);
                updateData.Password = hashedPassword;
            }

            const updateResult = await users.updateOne(
                { Email: req.session.user.Email },
                { $set: updateData }
            );

            if (updateResult.matchedCount > 0) {
                res.sendStatus(200);
            } else {
                res.status(500).send('Failed to update profile.');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            res.status(500).send('Error updating profile.');
        }
    });

    //logging in
    app.post('/api/login', async (req, res) => {
        if (!req.body.Email || !req.body.Password) {
            res.status(400).send("Email and password are required.");
            return;
        }

        const { Email, Password, rememberMe } = req.body;
        const users = db.collection("Users");

        try {
            const user = await users.findOne({ Email, Password: hashPassword(Password) });

            if (!user) {
                res.status(401).send("Invalid email or password.");
                return;
            }
            //token generation
            const Token = uuidv4();
            const CreationDate = new Date();
            //insert token i tokens table
            const tokens = db.collection("Tokens");
            await tokens.insertOne({ UserID: user._id, Token, CreationDate });
            const cookieOptions = { httpOnly: true, secure: false };
            if (rememberMe) {
                cookieOptions.expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
            }
            res.cookie('authToken', Token, cookieOptions);
            req.session.user = { Email: user.Email, Name: user.Name, DateOfBirth: user.DateOfBirth };
            res.status(200).send("Login successful.");
        } catch (error) {
            console.error("Error logging in user:", error);
            res.status(500).send("Error logging in user.");
        }
    });

    //get users info
    app.get('/api/profile', async (req, res) => {
        if (req.session.user) {
            const users = db.collection("Users");
            const user = await users.findOne({ Email: req.session.user.Email });

            if (user) {
                res.status(200).json({
                    Email: user.Email,
                    Name: user.Name,
                    DateOfBirth: user.DateOfBirth,
                    IsPublisher: user.IsPublisher,
                    profilePicture: req.session.user.profilePicture || 'default.jpg'
                });
            } else {
                res.status(404).send("User not found");
            }
        } else {
            res.status(401).send("Unauthorized");
        }
    });

    //load propic
    app.post('/api/profile/picture', upload.single('profilePicture'), (req, res) => {
        if (!req.session.user) {
            return res.status(401).json({ error: 'Unauthorized' });
        }
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }
        req.session.user.profilePicture = req.file.filename;

        res.status(200).json({ fileName: req.file.filename });
    });

    //delete account
    app.delete('/api/profile', async (req, res) => {
        if (!req.session.user) {
            res.status(401).send("Unauthorized");
            return;
        }
        const users = db.collection("Users");

        try {
            const deleteResult = await users.deleteOne({ Email: req.session.user.email });

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



    //! Scrivi qui dentro tutti gli route possibili per express (Esempio: app.get('/home', (req, res) => {console.log('Sono bello!')});)


    app.get("/api/get-playlist-data", async (req, res) => {
        if (req.query.playlistId === undefined) {
            res.status(400).send();
            return;
        }

        const playlists = db.collection("Playlists");

        const playlist = await playlists.findOne({
            _id: new ObjectId(req.query.playlistId),
        });

        if (playlist === null) {
            res.status(404).send();
            return;
        }

        const songsPlaylists = db.collection("SongsPlaylists");

        playlist.songs = await songsPlaylists
            .find({ PlaylistID: req.query.playlistId })
            .toArray();

        res.status(200).json(playlist);
    });

    app.get("/api/get-playlists-with-user", async (req, res) => {
        if (req.query.userId === undefined) {
            res.status(400).send();
            return;
        }

        const songPublishers = db.collection("SongPublishers");

        const songsPublished = await songPublishers
            .find({ PublisherID: req.query.userId })
            .toArray();

        if (songsPublished === null) {
            res.status(404).send();
            return;
        }

        const songsPlaylists = db.collection("SongsPlaylists");
        const playlists = db.collection("Playlists");

        let response = [];

        for (let song of songsPublished) {
            let playlistsFound = await songsPlaylists
                .find({ SongID: song.SongID })
                .toArray();
            for (let playlist of playlistsFound) {
                let playlistFound = await playlists.findOne({
                    _id: new ObjectId(playlist.PlaylistID),
                    UserID: { $ne: req.query.userId },
                });
                if (playlistFound !== null) {
                    response.push(playlistFound);
                }
            }
        }

        res.status(200).json(response);
    });

    app.get("/api/get-song-data", async (req, res) => {
        if (req.query.songId === undefined) {
            res.status(400).send();
            return;
        }

        const songs = db.collection("Songs");

        const song = await songs.findOne({
            _id: new ObjectId(req.query.songId),
        });

        if (song === null) {
            res.status(404).send();
            return;
        }

        const songsPlaylists = db.collection("SongsPlaylists");

        song.AlbumID = (
            await songsPlaylists
                .find({ SongID: req.query.songId })
                .sort({ AdditionDate: 1 })
                .limit(1)
                .toArray()
        )[0].PlaylistID;

        const songPublishers = db.collection("SongPublishers");

        song.publishers = await songPublishers
            .find({ SongID: req.query.songId })
            .toArray();

        res.status(200).json(song);
    });

    app.get("/api/get-user-data", async (req, res) => {
        if (req.query.userId === undefined) {
            res.status(400).send();
            return;
        }

        const users = db.collection("Users");

        const user = await users.findOne({
            _id: new ObjectId(req.query.userId),
        });

        const playlists = db.collection("Playlists");

        if (user === null) {
            res.status(404).send();
            return;
        }

        user.playlists = await playlists
            .find({ UserID: req.query.userId })
            .toArray();

        res.status(200).json(user);
    });

    app.get("/api/search-songs", async (req, res) => {
        if (req.query.song === undefined) {
            res.status(400).send();
            return;
        }

        const songs = db.collection("Songs");

        const songsFound = await songs
            .find({
                Name: { $regex: req.query.song, $options: "i" },
            })
            .limit(4)
            .toArray();

        if (songsFound === null) {
            res.status(404).send();
            return;
        }

        res.status(200).json(songsFound);
    });

    app.get("/api/search-playlists", async (req, res) => {
        if (req.query.playlist === undefined) {
            res.status(400).send();
            return;
        }

        const playlists = db.collection("Playlists");

        const playlistsFound = await playlists
            .find({
                Name: { $regex: req.query.playlist, $options: "i" },
                IsPublic: true,
            })
            .toArray();

        if (playlistsFound === null) {
            res.status(404).send();
            return;
        }

        res.status(200).json(playlistsFound);
    });

    app.get("/api/search-users", async (req, res) => {
        if (req.query.user === undefined) {
            res.status(400).send();
            return;
        }

        const users = db.collection("Users");

        const usersFound = await users
            .find({
                Name: { $regex: req.query.user, $options: "i" },
            })
            .toArray();

        if (usersFound === null) {
            res.status(404).send();
            return;
        }

        res.status(200).json(usersFound);
    });

    app.get("/*", (req, res) => {
        let fPath = `${process.cwd()}/pages/${req.path}`;
        if (!req.path.includes(".")) fPath += ".html";
        if (fs.existsSync(fPath)) res.sendFile(fPath);
        else res.status(404).send();
    });

    return app;
}
