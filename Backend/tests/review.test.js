import request from "supertest";
import server from "../app.js";
import { createToken } from "../auth/jwt.js";

//  Create a signed token so POST requests pass authentication and reach validation.
const reviewTestToken = createToken({ id: 1, email: "review-test@example.com" });

describe("Review retrieval validation", () => {
	
	test.each([
		{ tmdbId: "", reason: "ID is empty" },
		{ tmdbId: "not-a-number", reason: "ID is not number" },
		{ tmdbId: "0", reason: "ID is zero" },
		{ tmdbId: "-5", reason: "ID is negative" },
	])("rejects invalid TMDB ID: $reason", async ({ tmdbId }) => {
		
		const response = await request(server)
			.get("/api/reviews")
			.query({ mediaType: "movie", tmdbId });

		
		expect(response.status).toBe(400);
		expect(response.body.error).toBe("A valid tmdbId is required");
	});

	test("rejects an unsupported media type", async () => {
		//  A valid ID isolates the invalid media type as the reason for failure.
		const response = await request(server)
			.get("/api/reviews")
			.query({ mediaType: "book", tmdbId: 12345 });

		// Step 4: Confirm the service validation error is returned to the client.
		expect(response.status).toBe(400);
		expect(response.body.error).toBe("Media type must be 'movie' or 'tv'");
	});
});

describe("Review creation validation", () => {
	test("requires authentication", async () => {
		// Send a valid-looking review without a bearer token.
		const response = await request(server)
			.post("/api/reviews")
			.send({ mediaType: "movie", tmdbId: 12345, rating: 4, reviewText: "Good" });

		// Step 2: Confirm unauthenticated users cannot create reviews.
		expect(response.status).toBe(401);
		expect(response.body.error).toBe("Authentication required");
	});

	//  Define invalid values, matching the table-driven style of the registration tests.
	test.each([
		{ field: "mediaType", value: "book", reason: "media type is unsupported" },
		{ field: "tmdbId", value: 0, reason: "TMDB ID is zero" },
		{ field: "rating", value: 0, reason: "rating is below the allowed range" },
		{ field: "rating", value: 6, reason: "rating is above the allowed range" },
		{ field: "rating", value: "5", reason: "rating is not a number" },
		{ field: "reviewText", value: "", reason: "review text is empty" },
		{ field: "reviewText", value: {}, reason: "review text is not a string" },
		{ field: "reviewText", value: "x".repeat(1001), reason: "review text is too long" },
	])("rejects invalid review when $reason", async ({ field, value }) => {
		//  Start with valid data, then replace only the field under test.
		const newReview = {
			mediaType: "movie",
			tmdbId: 12345,
			rating: 4,
			reviewText: "A useful test review",
			[field]: value,
		};

		// Send the request with a valid token so payload validation is reached.
		const response = await request(server)
			.post("/api/reviews")
			.set("Authorization", `Bearer ${reviewTestToken}`)
			.send(newReview);

		// Step 4: Confirm invalid review data is rejected with a client error.
		expect(response.status).toBe(400);
		expect(response.body.error).toBeDefined();
	});
});
