import jwt from "jsonwebtoken";
import crypto from "crypto";

const createAccessToken = (id, username) => {
  return jwt.sign(
    {
      userInfo: {
        id,
        username,
      },
    },
    process.env.JWT_ACCESS_TOKEN_SECRET,
    { expiresIn: `${process.env.ACCESS_TOKEN_EXPIRES}` },
  );
};

const createRefreshToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_REFRESH_TOKEN_SECRET, {
    expiresIn: `${process.env.REFRESH_TOKEN_EXPIRES}`,
  });
};

const checkAccessToken = (accessToken) => {
  return jwt.verify(accessToken, process.env.JWT_ACCESS_TOKEN_SECRET);
};

const checkRefreshToken = (refreshToken) => {
  return jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN_SECRET);
};

const hashRefreshToken = (refreshToken) => {
  return crypto.createHash("sha256").update(refreshToken).digest("hex");
};

export default {
  createAccessToken,
  createRefreshToken,
  checkAccessToken,
  checkRefreshToken,
  hashRefreshToken,
};
