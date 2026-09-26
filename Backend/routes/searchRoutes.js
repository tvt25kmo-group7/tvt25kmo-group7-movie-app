import {
  searchMoviesAndTv,
  searchMoviesAndTvCriteria,
} from "../services/tmdbService.js";

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

  const isCriteriaSearch = requestUrl.pathname === "/api/search/criteria";

  // This handler supports the normal name search and the isolated criteria test route.
  if (requestUrl.pathname !== "/api/search" && !isCriteriaSearch) {
    return false;
  }

  // The path exists, but it only supports GET requests
  if (req.method !== "GET") {
    sendJson(res, 405, { error: "Method not allowed" }, { Allow: "GET" });
    return true;
  }

  // Extract the search query and page number from the request URL
  const query = requestUrl.searchParams.get("query")?.trim();
  const page = Number(requestUrl.searchParams.get("page") ?? "1");

  // Validate the search query and page number before proceeding
  if (!isCriteriaSearch && !query) {
    sendJson(res, 400, { error: "Search query is required" });
    return true;
  }

  if (
    isCriteriaSearch &&
    !query &&
    !requestUrl.searchParams.get("genre") &&
    !requestUrl.searchParams.get("mediaType") &&
    !requestUrl.searchParams.get("year") &&
    !requestUrl.searchParams.get("yearFrom") &&
    !requestUrl.searchParams.get("yearTo")
  ) {
    sendJson(res, 400, { error: "At least one search criterion is required" });
    return true;
  }

  if (!Number.isInteger(page) || page < 1) {
    sendJson(res, 400, { error: "Page must be a positive integer" });
    return true;
  }

 
  try {
    const searchResults = isCriteriaSearch
      ? await searchMoviesAndTvCriteria(
          {
            genre: requestUrl.searchParams.get("genre") ?? undefined,
            mediaType: requestUrl.searchParams.get("mediaType") ?? undefined,
            year: requestUrl.searchParams.get("year") ?? undefined,
            yearFrom: requestUrl.searchParams.get("yearFrom") ?? undefined,
            yearTo: requestUrl.searchParams.get("yearTo") ?? undefined,
          },
          page,
        )
      : await searchMoviesAndTv(query, page);
    sendJson(res, 200, searchResults);
  } catch (error) {
    console.error("TMDB search failed:", error.message);
    sendJson(res, 502, {
      error: "Movie and TV search is temporarily unavailable",
    });
  }

  return true;
}
