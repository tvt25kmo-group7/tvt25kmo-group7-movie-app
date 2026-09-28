import request from "supertest";
import server from "../app.js";

describe("Health check", () => {
  test("GET health path returns status 200", async () => {
    const response = await request(server).get("/health");
    expect(response.status).toBe(200);
  });
});
