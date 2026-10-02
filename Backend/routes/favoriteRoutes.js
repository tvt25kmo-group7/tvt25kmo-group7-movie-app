import { authenticateRequest } from "../auth/auth.js";
import favoriteService from "../services/favoriteService.js";
import { sendJson } from "../helpers/sendJson.js";

// Handles the /api/favorites routes
export async function handleFavoriteRoutes(req, res) {
  const requestUrl = new URL(
    req.url,
    `http://${req.headers.host || "localhost"}`,
  );

  const favoritesMatch = requestUrl.pathname.match(
    /^\/api\/favorites(?:\/([0-9a-f-]{36}))?$/i,
  );

  if (!favoritesMatch) {
    return false;
  }

  const token = favoritesMatch[1];

  if (req.method === "GET" && token) {
    try {
      const owner =
        await favoriteService.getUserByShareToken(token);

      if (!owner || !owner.favorites_public) {
        sendJson(res, 404, {
          error: "Shared favorites not found",
        });
        return true;
      }

      const favorites =
        await favoriteService.getUserFavorites(owner.id);

      sendJson(res, 200, favorites);
    } catch (error) {
      console.error(
        "Get shared favorites failed:",
        error.message,
      );

      sendJson(res, 500, {
        error: "Failed to fetch shared favorites",
      });
    }

    return true;
  }

  // User must be logged in to use the favorites routes
  if (!authenticateRequest(req, res)) {
    return true;
  }


  // GET /api/favorites/:userId
  if (req.method === "GET") {
    try {
      const favorites =
        await favoriteService.getUserFavorites(req.user.id);

      sendJson(res, 200, favorites);
    } catch (error) {
      console.error("Get favorites failed:", error.message);

      sendJson(res, 500, {
        error: "Failed to fetch favorites",
      });
    }

    return true;
    }
    
  // POST /api/favorites
  if (req.method === "POST" /*&& isFavoritesRoute*/) {
    try {
      const { tmdbId, mediaType } = await readJsonBody(req);

      const parsedTmdbId = Number(tmdbId);

      // Check that tmdbId is an integer
      if (!Number.isInteger(parsedTmdbId)) {
        sendJson(res, 400, {
          error: "tmdbId must be an integer",
        });

        return true;
      }

      // Check that mediaType is movie or tv
      if (!["movie", "tv"].includes(mediaType)) {
        sendJson(res, 400, {
          error: "mediaType must be movie or tv",
        });

        return true;
      }

      // Add favorite for the logged-in user
      const favorite = await favoriteService.addFavorite(
        req.user.id,
        parsedTmdbId,
        mediaType,
      );

      // Favorite already exists
      if (favorite.alreadyExists) {
        sendJson(res, 409, {
          message: "Favorite already exists",
        });

        return true;
      }

      sendJson(res, 201, favorite);
    } catch (error) {
      console.error("Add favorite failed:", error);

      sendJson(res, 500, {
        error: "Failed to add favorite",
      });
    }

    return true;
  }

  // Other HTTP methods are not allowed
  sendJson(
    res,
    405,
    {
      error: "Method not allowed",
    },
    {
      Allow: "GET, POST",
    },
  );

  return true;
}


// Reads JSON data from the request body
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