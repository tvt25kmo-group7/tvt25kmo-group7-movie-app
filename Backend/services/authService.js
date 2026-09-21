import bcrypt from 'bcryptjs';

import {
  createUser,
  findUserByEmail,
  findUserByUsername,
  saveRefreshToken,
  findUserByRefreshToken,
} from '../models/userModel.js';

import {
  createToken,
  createRefreshToken,
  verifyRefreshToken,
} from '../auth/jwt.js';

async function createLoginSession(user) {
  const token = createToken(user);
  const refreshToken = createRefreshToken(user);

  await saveRefreshToken(user.id, refreshToken);

  return {
    user: {
      id: user.id,
      email: user.email,
      username: user.username,
      token,
    },
    refreshToken,
  };
}

async function loginUser(email, password) {
  if (typeof email !== 'string' || typeof password !== 'string') {
    return null;
  }

  const cleanEmail = email.trim().toLowerCase();
  const user = await findUserByEmail(cleanEmail);

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  return createLoginSession(user);
}

async function registerUser(email, username, password) {
  if (
    typeof email !== 'string' ||
    typeof username !== 'string' ||
    typeof password !== 'string'
  ) {
    throw new Error('Email, username, and password are required');
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Invalid email address');
  }

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
    throw new Error(
      'Username must be 3-30 characters and use only letters, numbers, or underscores',
    );
  }

  if (
    password.length < 8 ||
    !/[A-Z]/.test(password) ||
    !/[0-9]/.test(password)
  ) {
    throw new Error(
      'Password must be at least 8 characters and contain an uppercase letter and a number',
    );
  }

  try {
    const existingEmail = await findUserByEmail(cleanEmail);

    if (existingEmail) {
      throw new Error('Email is already registered');
    }

    const existingUsername = await findUserByUsername(cleanUsername);

    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(cleanEmail, cleanUsername, passwordHash);

    return newUser;
  } catch (error) {
    if (error.code === '23505') {
      if (error.constraint?.includes('username')) {
        throw new Error('Username is already taken');
      }

      throw new Error('Email is already registered');
    }

    throw error;
  }
}

async function refreshAccessToken(refreshToken) {
  let decoded;

  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    return null;
  }

  const user = await findUserByRefreshToken(refreshToken);

  if (!user || user.id !== decoded.id) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    token: createToken(user),
  };
}

export {
  loginUser,
  registerUser,
  refreshAccessToken,
};