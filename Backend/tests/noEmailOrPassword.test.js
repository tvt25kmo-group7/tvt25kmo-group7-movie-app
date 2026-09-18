import request from "supertest";
import server from "../app.js";

describe("User registration with missing email", () => {
  test.each([  
    {email: null, reason: "email is null"},
    {email: "", reason: "email is empty"},
    {email: undefined, reason: "email is undefined"},
    {email: {}, reason: "email is an object"},
  ])("invalid email: $email $reason", async ({ email, reason }) => {
    const uniquevalue = Date.now();

    const newUser={
        username: `testuser${uniquevalue}`,
        email: email,
        password: "Passwordonetwo123"
    };

    const response = await request(server)
      .post("/api/users/register")
      .send(newUser);
      
    console.log({
        reason,
        status: response.status,
        body: response.body
    });

    expect(response.status).toBe(400);
  });
});
describe("User registration with missing password", () => {
    test.each([
        {password: null, reason: "password is null"},
        {password: "", reason: "password is empty"},
        {password: undefined, reason: "password is undefined"},
        {password: {}, reason: "password is an object"}
    ])("invalid password: $password $reason", async ({ password, reason }) => {
        const uniquevalue = Date.now();

        const newUser={
            username: `testuser${uniquevalue}`,
            email: "test@example.com",
            password: password
        };

        const response = await request(server)
          .post("/api/users/register")
          .send(newUser);

        console.log({
            reason,
            status: response.status,
            body: response.body
        });

        expect(response.status).toBe(400);
    });
});