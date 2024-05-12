import express from "express";
import fs from "fs";

export default function routes(db) {
    const app = express();

    //! Scrivi qui dentro tutti gli route possibili per express (Esempio: app.get('/home', (req, res) => {console.log('Sono bello!')});)

    app.get("/api/get-playlist-data", async (req, res) => {
        if (req.query.playlistId === undefined) {
            res.status(400).send();
            return;
        }

        const playlists = db.collection("Playlists");

        const playlist = await playlists.findOne({ _id: req.query.playlistId });

        if(playlist === null){
            res.status(404).send();
            return;
        }

        res.json(playlist).status(200).send();
    });

    app.get("/*", (req, res) => {
        let fPath = `${process.cwd()}/pages/${req.path}`;
        if (!req.path.includes(".")) fPath += ".html";
        if (fs.existsSync(fPath)) res.sendFile(fPath);
        else res.status(404).send();
    });

    return app;
}
