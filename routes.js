import express from "express";
import fs from "fs";
import { ObjectId } from "mongodb";

export default function routes(db) {
    const app = express();

    //! Scrivi qui dentro tutti gli route possibili per express (Esempio: app.get('/home', (req, res) => {console.log('Sono bello!')});)

    app.get("/api/get-playlist-data", async (req, res) => {
        if (req.query.playlistId === undefined) {
            res.status(400).send();
            return;
        }

        const playlists = db.collection("Playlists");

        const playlist = await playlists.findOne({ _id: new ObjectId(req.query.playlistId) });

        if(playlist === null){
            res.status(404).send();
            return;
        }

        const songsPlaylists = db.collection("SongsPlaylists");

        playlist.songs = await songsPlaylists.find({ PlaylistID: req.query.playlistId }).toArray();

        res.json(playlist).status(200).send();
    });

    app.get("/api/get-song-data", async (req, res) => {
        if (req.query.songId === undefined) {
            res.status(400).send();
            return;
        }

        const songs = db.collection("Songs");

        const song = await songs.findOne({ _id: new ObjectId(req.query.songId) });

        if(song === null){
            res.status(404).send();
            return;
        }

        res.json(song).status(200).send();
    });

    app.get("/*", (req, res) => {
        let fPath = `${process.cwd()}/pages/${req.path}`;
        if (!req.path.includes(".")) fPath += ".html";
        if (fs.existsSync(fPath)) res.sendFile(fPath);
        else res.status(404).send();
    });

    return app;
}
