import { searchMoviesAndTv } from "../services/tmdbService.js";

//  Utility function to send JSON responses with appropriate headers and status codes
function sendJson(res, statusCode, body, headers = {}) {
    res.writeHead(statusCode, {
        "Content-Type": "application/json; charset=utf-8",
        ...headers,
    });
    res.end(JSON.stringify(body));
}

//  Handles the /api/search route for searching movies and TV shows
export async function handleSearchRoute(req, res) {
    const requestUrl = new URL(
        req.url,
        `http://${req.headers.host || "localhost"}`,
    );

    // This handler only handles the /api/search path
    if (requestUrl.pathname !== "/api/search") {
        return false;
    }

    // The path exists, but it only supports GET requests
    if (req.method !== "GET") {
        sendJson(
            res,
            405,
            { error: "Method not allowed" },
            { Allow: "GET" },
        );
        return true;
    }

    // Extract the search query and page number from the request URL
    const query = requestUrl.searchParams.get("query")?.trim();
    const page = Number(requestUrl.searchParams.get("page") ?? "1");

    // Validate the search query and page number before proceeding
    if (!query) {
        sendJson(res, 400, { error: "Search query is required" });
        return true;
    }

    // Validate the page number before proceeding
    if (!Number.isInteger(page) || page < 1) {
        sendJson(res, 400, { error: "Page must be a positive integer" });
        return true;
    }

    // Perform the search using the TMDB service and handle any errors.
    try {
        const searchResults = await searchMoviesAndTv(query, page);
        sendJson(res, 200, searchResults);
    } catch (error) {
        console.error("TMDB search failed:", error.message);
        sendJson(res, 502, {
            error: "Movie and TV search is temporarily unavailable",
        });
    }

    return true;
}