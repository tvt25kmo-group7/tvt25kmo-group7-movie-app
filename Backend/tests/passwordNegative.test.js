import request from "supertest";
import server from "../app.js";

describe("User registration with invalid passwords", () => {
  test.each([
    {password: 'Pass1', reason: 'too short password'},
    {password: 'passwordone1', reason: 'no capital'},
    {password: 'Passwordone', reason: 'no number'},
  ])('Invalid password: $password ($reason)', async ({password, reason}) => {
    const uniqueValue = Date.now();

    const newUser = {
        username: `testuser${uniqueValue}`,
        email: `testuser${uniqueValue}@example.com`,
        password: password,
    };

    const response = await request(server)
      .post('/api/users/register')
      .send(newUser);

      console.log({password, reason, status: response.status, body: response.body});

    expect(response.status).toBe(400);

  });
});
