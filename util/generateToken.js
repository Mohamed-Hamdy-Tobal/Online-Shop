import jwt from "jsonwebtoken";

const generateToken = async (payload, expire = "10m") => {
  const token = await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: expire,
  });
  return token;
};

export default generateToken;
