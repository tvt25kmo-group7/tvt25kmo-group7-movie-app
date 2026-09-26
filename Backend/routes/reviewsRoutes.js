import { getMediaReviews, createReview } from "../services/reviewService.js";
import { authenticateRequest } from "../auth/auth.js";


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


export async function handleReviewsRoutes(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  if (url.pathname !== "/api/reviews") {
    return false;
  }

  if (req.method === "GET") {
    const mediaType = url.searchParams.get("mediaType");
    const tmdbId = Number(url.searchParams.get("tmdbId"));

    if (!Number.isInteger(tmdbId) || tmdbId <= 0) {
      sendJson(res, 400, { error: "A valid tmdbId is required" });
      return true;
    }

    try {
      const reviews = await getMediaReviews(mediaType, tmdbId);
      sendJson(res, 200, reviews);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }




  //post method validation (only registered member is allowed to create reviews )
  if (req.method === "POST") {
    if (!authenticateRequest(req, res)) {
      return true;
    }
   
    try {
      const body = await readJsonBody(req);
      const { mediaType, rating, reviewText } = body;
      const tmdbId = Number(body.tmdbId);

      // createReview does the real validation of rating/text/mediaType/tmdbId in reviewsService.js
      const review = await createReview(
        req.user.id,
        mediaType,
        tmdbId,
        rating,
        reviewText,
      );
      sendJson(res, 201, review);
    } catch (error) {
      // a duplicate review hits Postgres error code 23505
      if (error.code === "23505") {
        sendJson(res, 409, { error: "You already reviewed this title" });
      } else {
        sendJson(res, 400, { error: error.message });
      }
    }
    return true;
  }

  // Any other method on this path is unsupported
  sendJson(
    res,
    405,
    { error: "This action only allows GET and POST methods" },
    { Allow: "GET, POST" },
  );
  return true;
}


