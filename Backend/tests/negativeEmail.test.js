import request from "supertest";
import server from "../app.js";

describe("User registration", () => {
  test.each([
    ['@gmail.com'],//missing emails first part
    ['testgmail.com'], //missing @ symbol
    ['test@.com'],//missing domain name
    ['test@com'],//missing dot in domain
    ['test@gmail.'],//missing domain
  ])('Invalid email: %s', async (email) => {
    const uniqueValue = Date.now();

    const newUser = {
        username: `testuser${uniqueValue}`,
        email: email,
        password: 'Paassword1',
    };

    const response = await request(server)
      .post('/api/users/register')
      .send(newUser);

      console.log(response.status, response.body);

    expect(response.status).toBe(400);
  });
});