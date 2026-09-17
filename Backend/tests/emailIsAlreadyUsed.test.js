import request from "supertest";
import server from "../app.js";
import { findUserByEmail } from "../models/userModel.js";

describe("User registration with an already used email", () => {
  test("registration fails when email is already used", async () => {
    const uniqueValue = Date.now();
    const email = `first${uniqueValue}@example.com`;

    const firstUser = {
      username: `mikkomallikas${uniqueValue}`,
      email,
      password: "Passwordonetwo123",
    };

    const firstResponse = await request(server)
      .post("/api/users/register")
      .send(firstUser);

    expect(firstResponse.status).toBe(201);

    const savedUser = await findUserByEmail(email);

    expect(savedUser).toBeDefined();
    expect(savedUser.email).toBe(email);

    const secondUser = {
      username: `mikkomallikas2${uniqueValue}`,
      email, // Same email as firstUser
      password: "Passwordonetwo123",
    };

    const duplicateResponse = await request(server)
      .post("/api/users/register")
      .send(secondUser);

    console.log({
      status: duplicateResponse.status,
      response: duplicateResponse.body,
      firstUsername: firstUser.username,
      secondUsername: secondUser.username,
      sharedEmail: email,
    });

    expect(duplicateResponse.status).toBe(409);
  });
});