import request from "supertest";
import server from "../app.js";

describe("User registration", () => {
  test('registration works with user information', async () => {
    const uniqueValue = Date.now();

    const newUser = {
        username: `testuser${uniqueValue}`,
        email: `testuser${uniqueValue}@example.com`,
        password: 'Password1',
        ConfirmPassword: 'Password1',
    };

    const response = await request(server)
      .post('/api/users/register')
      .send(newUser);

      console.log(response.status, response.body);

    expect(response.status).toBe(201);

  });

});