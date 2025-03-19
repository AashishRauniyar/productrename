import bcrypt from "bcryptjs";

/**
 * Verifies that a plain text password matches the hashed password.
 * @param plainPassword - The plain text password.
 * @param hashedPassword - The hashed password stored in the database.
 * @returns A promise that resolves to true if the password is valid.
 */
export async function verifyPassword(
  plainPassword: string,
  hashedPassword: string
) {
  return bcrypt.compare(plainPassword, hashedPassword);
}
