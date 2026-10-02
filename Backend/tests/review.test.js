import request from "supertest";
import server from "../app.js";
import { createToken } from "../auth/jwt.js";
import { database } from "../services/database.js";

//  Create a  token so POST requests are able to pass authentication and reach validation.
const reviewTestToken = createToken({ id: 1, email: "review-test@example.com" });

async function withReviewFixture(testBody, { omitReviewText = false } = {}) {
	const uniqueValue = `${Date.now()}${Math.floor(Math.random() * 100000)}`;
	const user = {
		username: `reviewuser${uniqueValue}`,
		email: `reviewuser${uniqueValue}@example.com`,
		password: "Password1",
		ConfirmPassword: "Password1",
	};
	const tmdbId = 1_000_000_000 + Math.floor(Math.random() * 1_000_000_000);
	const reviewText = "An integration-test review";
	const reviewPayload = { mediaType: "movie", tmdbId, rating: 4 };
	if (!omitReviewText) {
		reviewPayload.reviewText = reviewText;
	}

	try {
		const registration = await request(server)
			.post("/api/users/register")
			.send(user);
		expect(registration.status).toBe(201);

		const login = await request(server)
			.post("/api/users/login")
			.send({ email: user.email, password: user.password });
		expect(login.status).toBe(200);

		const creation = await request(server)
			.post("/api/reviews")
			.set("Authorization", `Bearer ${login.body.token}`)
			.send(reviewPayload);
		expect(creation.status).toBe(201);

		await testBody({ username: user.username, tmdbId, reviewText });
	} finally {
		await database.query("DELETE FROM users WHERE email = $1", [user.email]);
	}
}

describe("Review retrieval", () => {
	test("allows an authenticated review without optional text", async () => {
		await withReviewFixture(async ({ username, tmdbId }) => {
			const response = await request(server)
				.get("/api/reviews")
				.query({ mediaType: "movie", tmdbId });

			expect(response.status).toBe(200);
			expect(response.body).toHaveLength(1);
			expect(response.body[0]).toMatchObject({
				rating: 4,
				review_text: "",
				username,
			});
		}, { omitReviewText: true });
	});

	test("returns existing reviews without authentication and includes review details", async () => {
		await withReviewFixture(async ({ username, tmdbId, reviewText }) => {
			const response = await request(server)
				.get("/api/reviews")
				.query({ mediaType: "movie", tmdbId });

			console.log("Anonymous review retrieval:", {
				status: response.status,
				tmdbId,
				reviewsReturned: response.body.length,
			});

			expect(response.status).toBe(200);
			expect(response.body).toHaveLength(1);
			expect(response.body[0]).toMatchObject({
				review_text: reviewText,
				rating: 4,
				username,
			});
			expect(response.body[0].created_at).toBeDefined();
			expect(Number.isNaN(Date.parse(response.body[0].created_at))).toBe(false);
		});
	});

	test("does not return reviews for an unrelated movie ID", async () => {
		await withReviewFixture(async ({ tmdbId }) => {
			const unrelatedTmdbId = tmdbId + 1000;
			const response = await request(server)
				.get("/api/reviews")
				.query({ mediaType: "movie", tmdbId: unrelatedTmdbId });

			console.log("Unrelated movie review retrieval:", {
				status: response.status,
				requestedTmdbId: unrelatedTmdbId,
				reviewsReturned: response.body.length,
			});

			expect(response.status).toBe(200);
			expect(response.body).toEqual([]);
		});
	});
});

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
		const response = await request(server)
			.get("/api/reviews")
			.query({ mediaType: "book", tmdbId: 12345 });

		
		expect(response.status).toBe(400);
		expect(response.body.error).toBe("Media type must be 'movie' or 'tv'");
	});
});

describe("Review creation validation", () => {
	test("requires authentication", async () => {
		const response = await request(server)
			.post("/api/reviews")
			.send({ mediaType: "movie", tmdbId: 12345, rating: 4, reviewText: "Good" });

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

		
		expect(response.status).toBe(400);
		expect(response.body.error).toBeDefined();
	});
});
