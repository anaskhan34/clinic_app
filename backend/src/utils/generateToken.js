import jwt from "jsonwebtoken";

export const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user._id,
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
