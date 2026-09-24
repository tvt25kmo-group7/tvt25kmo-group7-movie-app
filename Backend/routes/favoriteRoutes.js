//THis page is for favorite routes, to get the media by id and media type from TMDB API
//This page is not tested yet, but it is used in the favorite routes to get the media 
// by id and media type from TMDB API and also to add the media to the favorites table in the database.
import { authenticateRequest } from "../auth/auth.js";
import favoriteService from "../services/favoriteService.js";

function sendJson(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    ...headers,
  });
  res.end(JSON.stringify(body));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });
    req.on("end", () => {
      try {
        resolve(data ? JSON.parse(data) : {});
      } catch {
        reject(new Error("Invalid JSON"));
      }
    });
    req.on("error", reject);
  });
}


console.log("Before favorites");





export async function handleFavoriteRoutes(req, res) {
  const requestUrl = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`,
  );

  if (requestUrl.pathname !== "/api/favorites") {
    return false;
  }

  if (!authenticateRequest(req, res)) {
    return true;
  }

  if (req.method === "GET") {
    try {
      const favorites = await favoriteService.getUserFavorites(req.user.id);
      sendJson(res, 200, favorites);
    } catch (error) {
      console.error("Get favorites failed:", error.message);
      sendJson(res, 500, { error: "Failed to fetch favorites" });
    }
    return true;
  }

  if (req.method === "POST") {
    try {
      const { tmdbId, mediaType } = await readJsonBody(req);

      if (!Number.isInteger(tmdbId)) {
        sendJson(res, 400, {
          error: "tmdbId must be an integer",
        });
        return true;
      }

      if (!["movie", "tv"].includes(mediaType)) {
        sendJson(res, 400, {
          error: "mediaType must be movie or tv",
        });
        return true;
      }

      const favorite = await favoriteService.addFavorite(
        req.user.id,
        tmdbId,
        mediaType,
      );

      if (favorite.alreadyExists) {
        sendJson(res, 409, {
          message: "Favorite already exists",
        });
        return true;
      }

      sendJson(res, 201, favorite);
    } catch (error) {
      console.error("Add favorite failed:", error.message);
      sendJson(res, 500, { error: "Failed to add favorite" });
    }
    return true;
  }
  sendJson(res, 405, { error: "Method not allowed" }, { Allow: "GET, POST" });
  return true;
}

console.log("After favorites");  