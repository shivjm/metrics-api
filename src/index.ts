import * as express from "express";

export function create() {
    const app = express();

    app.get("/", (_req, res) => {
        res.send("Hello, World!");
    });

    return app;
}
