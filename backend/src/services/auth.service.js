import {
  hashedPassword,
  verifyPassword,
} from "../validations/password-validations.js";
import { User } from "../models/user.model.js";

// user registration
export const registerUser = async ({ name, email, password }) => {
  // Check if user already exists
  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const hashed = await hashedPassword(password);
  //   hashed successfully

  // Create user
  const user = await User.create({
    name,
    email,
    password: hashed,
    role: "PATIENT",
  });

  // Remove password from returned object
  const userResponse = user.toObject();
  delete userResponse.password;

  return userResponse;
};

// User Login Logic
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isPasswordValid = await verifyPassword(user.password, password);

  if (!isPasswordValid) {
    throw new Error("Invalid email or password");
  }

  const userResponse = user.toObject();
  delete userResponse.password;

  return {
    user: userResponse,
  };
};
