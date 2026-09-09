import express from "express";
import { searchMoviesAndTv } from "../services/tmdbService.js";

const router = express.Router();

router.get("/", async (req, res) => {
    const query = req.query.q?.trim();
    const page = Number(req.query.page ?? 1);

    if (!query) {}

})