import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  const userId = user._id || user.userId;

  if (!userId) {
    throw new Error("User ID is required to generate token");
  }

  return jwt.sign(
    {
      userId: userId.toString(),
      role: user.role,
      doctorId: user.doctorId || null,
      clinicId: user.clinicId || null,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "1d",
    },
  );
};
