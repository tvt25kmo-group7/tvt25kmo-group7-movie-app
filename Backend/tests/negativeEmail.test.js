import request from "supertest";
import server from "../app.js";

describe("User registration", () => {
  test.each([
    {email: '@gmail.com', reason: 'missing emails first part'}, //missing emails first part
    {email: 'testgmail.com', reason: 'missing @ symbol'}, //missing @ symbol
    {email: 'test@.com', reason: 'missing domain name'},//missing domain name
    {email: 'test@com', reason: 'missing dot in domain'},//missing dot in domain
    {email: 'test@gmail.', reason: 'missing domain'},//missing domain
  ])('Invalid email: $email ($reason)', async ({email, reason}) => {
    const uniqueValue = Date.now();

    const newUser = {
        username: `testuser${uniqueValue}`,
        email: email,
        password: 'Paassword1',
    };

    const response = await request(server)
      .post('/api/users/register')
      .send(newUser);

      console.log({
        email, 
        reason, 
        status: response.status, 
        body: response.body});

    expect(response.status).toBe(400);
  });
});