import bcrypt from 'bcryptjs';
import { findUserByEmail } from '../models/userModel.js';
import { createToken } from '../auth/jwt.js';

async function loginUser(email, password) {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, user.password_hash);

  if (!passwordMatches) {
    return null;
  }

  const token = createToken(user);

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    token,
  };
}

// Validates registration data, creates the account, and returns a login token.
async function registerUser(email, username, password) {
  if (typeof email !== 'string' || typeof username !== 'string' || typeof password !== 'string') {
    throw new Error('Email, username, and password are required');
  }

  // Normalize values before validation and database queries.
  const cleanEmail = email.trim().toLowerCase();
  const cleanUsername = username.trim();

  // Check the basic format and length rules for each field.
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    throw new Error('Invalid email address');
  }

  if (!/^[a-zA-Z0-9_]{3,30}$/.test(cleanUsername)) {
    throw new Error('Username must be 3-30 characters and use only letters, numbers, or underscores');
  }

  if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    throw new Error('Password must be at least 8 characters and contain an uppercase letter and a number');
  }

  try {
    // Check early for friendly duplicate errors. The database constraints
    // still protect against two simultaneous registration requests.
    const existingEmail = await findUserByEmail(cleanEmail);
    if (existingEmail) {
      throw new Error('Email is already registered');
    }

    const existingUsername = await findUserByUsername(cleanUsername);
    if (existingUsername) {
      throw new Error('Username is already taken');
    }

    // Store only the bcrypt hash, never the original password.
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await createUser(cleanEmail, cleanUsername, passwordHash);

    return {
      id: newUser.id,
      email: newUser.email,
      username: newUser.username,
      token: createToken(newUser),
    };
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

export { loginUser, registerUser };
