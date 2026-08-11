import argon2 from "argon2";

export const hashedPassword = async (password) => {
  return await argon2.hash(password);
};

export const verifyPassword = async (hashedPassword, password) => {
  return await argon2.verify(hashedPassword, password);
};
