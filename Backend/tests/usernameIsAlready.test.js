import request from "supertest";
import server from "../app.js";
import { findUserByUsername } from "../models/userModel.js";

describe("User registration with an already taken username", () => {
  test("registration fails when username is already taken", async () => {
    const uniqueValue = Date.now();
    const username = `testuser${uniqueValue}`;

    const firstUser = {
      username,
      email: `first${uniqueValue}@example.com`,
      password: "Passwordonetwo123",
    };

    const firstResponse = await request(server)
      .post("/api/users/register")
      .send(firstUser);

    expect(firstResponse.status).toBe(201);


    const savedUser = await findUserByUsername(username);

    expect(savedUser).toBeDefined();
    expect(savedUser.username).toBe(username);

    
    const secondUser = {
      username,
      email: `second${uniqueValue}@example.com`,
      password: "Passwordonetwo123",
    };

    const duplicateResponse = await request(server)
      .post("/api/users/register")
      .send(secondUser);

    console.log({
        status: duplicateResponse.status,
        response: duplicateResponse.body,
        firstUser: firstUser.username,
        secondUser: secondUser.username,
    });

    expect(duplicateResponse.status).toBe(409);
  });
});