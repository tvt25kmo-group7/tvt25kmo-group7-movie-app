import bcrypt from 'bcryptjs';
import { findUserByEmail } from '../models/userModel.js';
import { createToken } from '../auth/jwt.js';

async function loginUser(email, password) {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(
    password,
    user.password_hash
  );

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

export { loginUser };