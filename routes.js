import express from "express";
import fs from "fs";
import { ObjectId } from "mongodb";

export default function routes(db) {
    const app = express();

    //! Scrivi qui dentro tutti gli route possibili per express (Esempio: app.get('/home', (req, res) => {console.log('Sono bello!')});)
    app.use(function (req, res, next) {
        res.setHeader("Permissions-Policy", "autoplay=(self)");
        next();
    });

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
