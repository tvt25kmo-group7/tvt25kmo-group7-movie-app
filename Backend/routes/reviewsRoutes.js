//USERS CANT REMODEL THEIR REVIEWS OR DELETE THEM. HA HA HA SCREW YOU
import { getMediaReviews, getUserReviews, createReview } from "../services/reviewService.js";
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

//get mtehod 
export async function handleReviewsRoutes(req, res) {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  // Own reviews are looked up from the authenticated token, never from a client-supplied ID
  if (url.pathname === "/api/reviews/me" && req.method === "GET") {
    if (!authenticateRequest(req, res)) {
      return true;
    }

    try {
      const reviews = await getUserReviews(req.user.id);
      sendJson(res, 200, reviews);
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return true;
  }

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



  //post method. registered members are allowed to use
  if (req.method === "POST") {
    if (!authenticateRequest(req, res)) {
      return true;
    }
   
    try {
      const body = await readJsonBody(req);
      const { mediaType, rating, reviewText } = body;
      const tmdbId = Number(body.tmdbId);

      const review = await createReview(
        req.user.id,
        mediaType,
        tmdbId,
        rating,
        reviewText,
      );
      sendJson(res, 201, review);
    } catch (error) {
      if (error.code === "23505") {
        sendJson(res, 409, { error: "You already reviewed this title" });
      } else {
        sendJson(res, 400, { error: error.message });
      }
    }
    return true;
  }

  sendJson(
    res,
    405,
    { error: "This action only allows GET and POST methods" },
    { Allow: "GET, POST" },
  );
  return true;
}


