
import request from 'supertest';
import server from '../app.js';

describe('User login', () => {
  test('valid credentials return 200 and a JWT', async () => {
    const uniqueValue = `${Date.now()}${Math.floor(Math.random() * 100000)}`;

    const testUser = {
      username: `loginuser${uniqueValue}`,
      email: `login${uniqueValue}@example.com`,
      password: 'Password1',
    };

    const registration = await request(server)
      .post('/api/users/register')
      .send(testUser);

    expect(registration.status).toBe(201);

    const response = await request(server)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(response.status).toBe(200);
    expect(response.body.email).toBe(testUser.email);
    expect(response.body.username).toBe(testUser.username);
    expect(typeof response.body.token).toBe('string');
    expect(response.body.token.length).toBeGreaterThan(0);
    expect(response.body.password_hash).toBeUndefined();
  });

  test('wrong password returns 401 and no JWT', async () => {
    const uniqueValue = `${Date.now()}${Math.floor(Math.random() * 100000)}`;

    const testUser = {
      username: `loginuser${uniqueValue}`,
      email: `login${uniqueValue}@example.com`,
      password: 'Password1',
    };

    const registration = await request(server)
      .post('/api/users/register')
      .send(testUser);

    expect(registration.status).toBe(201);

    const response = await request(server)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: 'WrongPassword1',
      });

    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
  });

  
  test('unknown email returns 401 and no JWT', async () => {
    const uniqueValue = `${Date.now()}${Math.floor(Math.random() * 100000)}`;

    const response = await request(server)
      .post('/api/users/login')
      .send({
        email: `unknown${uniqueValue}@example.com`,
        password: 'Password1',
      });

    expect(response.status).toBe(401);
    expect(response.body.token).toBeUndefined();
  });

  
  test('missing password returns 400 and no JWT', async () => {
    const response = await request(server)
      .post('/api/users/login')
      .send({
        email: 'test@example.com',
      });

    expect(response.status).toBe(400);
    expect(response.body.token).toBeUndefined();
  });

  
  test('missing email returns 400 and an error message', async () => {
    const response = await request(server)
      .post('/api/users/login')
      .send({
        password: 'Password1',
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Email and password are required');
    expect(response.body.token).toBeUndefined();
  });
});