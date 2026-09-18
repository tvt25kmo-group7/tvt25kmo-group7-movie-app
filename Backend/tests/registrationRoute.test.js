import request from "supertest";
import server from "../app.js";
import { findUserByEmail } from "../models/userModel.js";

describe("User registration", () => {
  test("registration works with user information", async () => {
    const uniqueValue = Date.now();

    const newUser = {
      username: `testuser${uniqueValue}`,
      email: `testuser${uniqueValue}@example.com`,
      password: "Password1",
      ConfirmPassword: "Password1",
    };

    const response = await request(server)
      .post("/api/users/register")
      .send(newUser);

    const savedUser = await findUserByEmail(newUser.email);
    expect(savedUser).toBeDefined();
    expect(savedUser.username).toBe(newUser.username);
    expect(savedUser.password).not.toBe(newUser.password);
    expect(savedUser.ConfirmPassword).toBeUndefined();

    console.log({
      status: response.status, 
      response: response.body, 
      saved: savedUser
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("username", newUser.username);
    expect(response.body).not.toHaveProperty("password");
  });
});
