import request from 'supertest';
import server from '../app.js';

describe('User logout', () => {
  test('logout invalidates the refresh token and clears its cookie', async () => {
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

    const refreshCookie = login.headers['set-cookie']
      ?.find(cookie => cookie.startsWith('refreshToken='));

    expect(refreshCookie).toBeDefined();
    expect(refreshCookie).toContain('HttpOnly');

    // Ennen uloskirjautumista refresh cookiella saa uuden access tokenin.
    const refreshBeforeLogout = await request(server)
      .post('/api/users/refresh')
      .set('Cookie', refreshCookie);

    expect(refreshBeforeLogout.status).toBe(200);
    expect(typeof refreshBeforeLogout.body.token).toBe('string');

    const logout = await request(server)
      .post('/api/users/logout')
      .set('Cookie', refreshCookie);

    expect(logout.status).toBe(200);
    expect(logout.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Max-Age=0'),
      ]),
    );

    // Uloskirjautumisen jälkeen sama refresh token ei enää kelpaa.
    const refreshAfterLogout = await request(server)
      .post('/api/users/refresh')
      .set('Cookie', refreshCookie);

    expect(refreshAfterLogout.status).toBe(401);

    // Access tokenia ei mitätöidä heti: se on voimassa vanhenemiseensa asti.
    const me = await request(server)
      .get('/api/users/me')
      .set('Authorization', `Bearer ${login.body.token}`);

    expect(me.status).toBe(200);
    expect(me.body.email).toBe(testUser.email);
  });

  test('logout without a refresh cookie is idempotent', async () => {
    const response = await request(server)
      .post('/api/users/logout');

    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toEqual(
      expect.arrayContaining([
        expect.stringContaining('Max-Age=0'),
      ]),
    );
  });
});