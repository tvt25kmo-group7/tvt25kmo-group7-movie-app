import request from 'supertest';
import server from '../app.js';

describe('User logout', () => {
  test('authenticated user can log out and the old token is rejected', async () => {
    const uniqueValue = `${Date.now()}${Math.floor(Math.random() * 100000)}`;

    const testUser = {
      username: `logoutuser${uniqueValue}`,
      email: `logout${uniqueValue}@example.com`,
      password: 'Password1',
    };

    const registration = await request(server)
      .post('/api/users/register')
      .send(testUser);

    expect(registration.status).toBe(201);

    const login = await request(server)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(login.status).toBe(200);
    expect(typeof login.body.token).toBe('string');

    const token = login.body.token;

    const logout = await request(server)
      .post('/api/users/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(logout.status).toBe(200);

    // Vanhaa tokenia ei saa hyväksyä uudessa logout-pyynnössä.
    const secondLogout = await request(server)
      .post('/api/users/logout')
      .set('Authorization', `Bearer ${token}`);

    expect(secondLogout.status).toBe(401);

    // Vanhaa tokenia ei saa hyväksyä suojatulla reitillä.
    const protectedResponse = await request(server)
      .delete('/api/users/me')
      .set('Authorization', `Bearer ${token}`);

    expect(protectedResponse.status).toBe(401);

    // Uuden kirjautumisen pitää onnistua ja tuottaa uusi token.
    const newLogin = await request(server)
      .post('/api/users/login')
      .send({
        email: testUser.email,
        password: testUser.password,
      });

    expect(newLogin.status).toBe(200);
    expect(newLogin.body.token).not.toBe(token);
  });

  test('logout without authentication returns 401', async () => {
    const response = await request(server)
      .post('/api/users/logout');

    expect(response.status).toBe(401);
    expect(response.body.error).toBeDefined();
  });
});