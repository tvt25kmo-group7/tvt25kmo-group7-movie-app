import request from "supertest";
import server from "../app.js";

describe("User registration", () => {
  test.each([
    ['Pass1'],//too short password
    ['pass12345'],//no capital
    ['Passwordone'],//no number
  ])('Invalid password: %s', async (password) => {
    const uniqueValue = Date.now();

    const newUser = {
        username: `testuser${uniqueValue}`,
        email: `testuser${uniqueValue}@example.com`,
        password: password,
    };

    const response = await request(server)
      .post('/api/users/register')
      .send(newUser);

      console.log(response.status, response.body);

    expect(response.status).toBe(400);

  });
});
