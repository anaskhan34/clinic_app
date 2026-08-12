import "dotenv/config";
import mongoose from "mongoose";

import { User } from "../models/user.model.js";
import { hashedPassword } from "../validations/password-validations.js";

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected");

    const existingAdmin = await User.findOne({
      email: process.env.ADMIN_EMAIL,
    });

    if (existingAdmin) {
      console.log("Super admin already exists");
      process.exit(0);
    }

    const hashed = await hashedPassword(process.env.ADMIN_PASSWORD);

    const admin = await User.create({
      name: "Super Admin",
      email: process.env.ADMIN_EMAIL,
      password: hashed,
      role: "SUPER_ADMIN",
    });

    console.log("Super admin created successfully");
    console.log("Email:", admin.email);

    process.exit(0);
  } catch (error) {
    console.error("Failed to seed admin:", error.message);
    process.exit(1);
  }
};

seedAdmin();
