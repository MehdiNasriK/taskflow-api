import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
    compare: vi.fn(),
  },
}));

vi.mock("../shared/utils/jwt.js", () => ({
  default: {
    createAccessToken: vi.fn(),
    createRefreshToken: vi.fn(),
    hashRefreshToken: vi.fn(),
    checkAccessToken: vi.fn(),
    checkRefreshToken: vi.fn(),
  },
}));

vi.mock("../shared/config/prisma.js", () => ({
  default: {
    user: {
      create: vi.fn(),
      update: vi.fn(),
      findUnique: vi.fn(),
    },
  },
}));

vi.mock("../shared/utils/queueWorker.js", () => ({
  default: {
    add: vi.fn(),
  },
}));

import jwt from "../shared/utils/jwt.js";
import authController from "../modules/auth/authController.js";
import prisma from "../shared/config/prisma.js";
import emailQueue from "../shared/utils/queueWorker.js";
import bcrypt from "bcrypt";
import AppError from "../shared/utils/error.js";

let req, res, next, hashPass, fakeUser;

beforeEach(() => {
  vi.resetAllMocks();

  req = {
    body: {
      username: "test",
      email: "test@gmail.com",
      password: "Test1234",
    },
    headers: {},
    protocol: "http",
    get: vi.fn().mockReturnValue("localhost:3000"),
  };
  res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn(),
    cookie: vi.fn(),
    clearCookie: vi.fn(),
  };
  next = vi.fn();

  hashPass = "hashed-pass";
  fakeUser = {
    id: 1,
    username: "test",
    email: "test@gmail.com",
    password: hashPass,
  };
});

describe("signup", () => {
  it("sould send 'please check your email and login' as response", async () => {
    req.body = {
      username: "test",
      email: "test@gmail.com",
      password: "Test1234",
    };

    bcrypt.hash.mockResolvedValue(hashPass);
    prisma.user.create.mockResolvedValue(fakeUser);
    emailQueue.add.mockResolvedValue();

    await authController.signUp(req, res, next);

    expect(bcrypt.hash).toHaveBeenCalledWith("Test1234", 12);
    expect(emailQueue.add).toHaveBeenCalled();
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "please check your email and login",
    });
    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: "test",
        email: "test@gmail.com",
        password: hashPass,
      },
    });
    expect(emailQueue.add).toHaveBeenCalledWith("email", {
      url: "http://localhost:3000/me",
      user: fakeUser,
    });
  });
});

describe("login", () => {
  it("should set cookie, send accessToken and update user", async () => {
    req.body = {
      username: "test",
      password: "Test1234",
    };
    prisma.user.findUnique.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    jwt.createAccessToken.mockReturnValue("accessToken");
    jwt.createRefreshToken.mockReturnValue("refreshToken");
    jwt.hashRefreshToken.mockReturnValue("hashedToken");

    await authController.login(req, res, next);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        username: req.body.username,
      },
      data: {
        refreshToken: "hashedToken",
      },
    });
    expect(res.cookie).toHaveBeenCalledWith("jwt", "refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      accessToken: "accessToken",
    });
  });

  it("sould send Error 'username and password required'", async () => {
    req.body = {};

    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new AppError(401, "username and password required"),
    );
  });

  it("should send Error 'invalid password or username'", async () => {
    bcrypt.compare.mockResolvedValue(false);

    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new AppError(404, "invalid password or username"),
    );
  });

  it("should send Error 'invalid password or username'", async () => {
    fakeUser = {};

    await authController.login(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new AppError(404, "invalid password or username"),
    );
  });
});

describe("logout", () => {
  it("should delete refreshToken, clear cookie and send 'bye for now. see you later'", async () => {
    req.user = fakeUser;
    req.user.refreshToken = "refreshToken";

    await authController.logout(req, res, next);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: req.user.id,
      },
      data: {
        refreshToken: null,
      },
    });
    expect(res.clearCookie).toHaveBeenCalledWith("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "bye for now. see you later",
    });
  });
});

describe("protect", () => {
  it("should send Error 'invalid token'", async () => {
    req.headers.authorization = undefined;

    await authController.protect(req, res, next);

    expect(next).toHaveBeenCalledWith(new AppError(401, "invalid token"));
  });

  it("should send Error 'please login'", async () => {
    req.headers.authorization = "Bearer";

    await authController.protect(req, res, next);

    expect(next).toHaveBeenCalledWith(new AppError(401, "please login"));
  });

  it("should send Error 'jwt invalid'", async () => {
    req.headers.authorization = "Bearer accessToken";

    jwt.checkAccessToken.mockImplementation(() => {
      throw Error("jwt invalid");
    });

    await authController.protect(req, res, next);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("should find user and pass to req", async () => {
    req.headers.authorization = "Bearer accessToken";

    jwt.checkAccessToken.mockReturnValue({
      userInfo: {},
    });

    prisma.user.findUnique.mockResolvedValue(fakeUser);

    await authController.protect(req, res, next);

    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(req.user).toBe(fakeUser);
  });

  it("should send Error 'user no longer exist'", async () => {
    req.headers.authorization = "Bearer accessToken";

    jwt.checkAccessToken.mockReturnValue({
      userInfo: {},
    });

    prisma.user.findUnique.mockResolvedValue();

    await authController.protect(req, res, next);

    expect(prisma.user.findUnique).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      new AppError(404, "user no longer exist"),
    );
    expect(req.user).toBe();
  });
});

describe("resetPassword", () => {
  it("should send Error 'password incorrect'", async () => {
    req.user = fakeUser;
    prisma.user.findUnique.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(false);

    await authController.resetPassword(req, res, next);

    expect(next).toHaveBeenCalledWith(new AppError(401, "password incorrect"));
  });

  it("should hash password, delete refresh token, clear cookie and response'", async () => {
    req.user = fakeUser;
    req.body.newPassword = "Vitest1234";

    prisma.user.findUnique.mockResolvedValue(fakeUser);
    bcrypt.compare.mockResolvedValue(true);
    bcrypt.hash.mockResolvedValue(hashPass);
    prisma.user.update.mockResolvedValue(fakeUser);

    await authController.resetPassword(req, res, next);

    expect(bcrypt.compare).toHaveBeenCalledWith(
      req.body.password,
      fakeUser.password,
    );
    expect(bcrypt.hash).toHaveBeenCalledWith("Vitest1234", 12);
    expect(prisma.user.update).toHaveBeenCalled();
    expect(res.clearCookie).toHaveBeenCalledWith("jwt", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });
    expect(res.json).toHaveBeenCalledWith({
      status: "success",
      message: "your password change successfully",
    });
  });
});

describe("refresh", () => {
  it("should send Error 'please login'", async () => {
    req.cookies = {
      jwt: undefined,
    };

    await authController.refresh(req, res, next);

    expect(next).toHaveBeenCalledWith(new AppError(401, "please login"));
  });

  it("should not find any user", async () => {
    req.cookies = {
      jwt: "refresh-token",
    };

    jwt.checkRefreshToken.mockReturnValue();

    await authController.refresh(req, res, next);

    expect(prisma.user.findUnique).not.toHaveBeenCalled();
  });

  it("should send Error 'user no longer exist'", async () => {
    req.cookies = {
      jwt: "refresh-token",
    };

    jwt.checkRefreshToken.mockReturnValue({ id: fakeUser.id });
    prisma.user.findUnique.mockResolvedValue();

    await authController.refresh(req, res, next);

    expect(next).toHaveBeenCalledWith(
      new AppError(404, "user no longer exist"),
    );
  });

  it("should send Error 'invalid token' ", async () => {
    req.cookies = {
      jwt: "refresh-token",
    };
    fakeUser.refreshToken = "refresh-token";

    jwt.checkRefreshToken.mockReturnValue({ id: fakeUser.id });
    prisma.user.findUnique.mockResolvedValue(fakeUser);
    jwt.hashRefreshToken.mockReturnValue("token");

    await authController.refresh(req, res, next);

    expect(next).toHaveBeenCalledWith(new AppError(401, "invalid token"));
  });

  it("should send Error 'invalid token' ", async () => {
    req.cookies = {
      jwt: "refresh-token",
    };
    fakeUser.refreshToken = "refresh-token";

    jwt.checkRefreshToken.mockReturnValue({ id: fakeUser.id });
    prisma.user.findUnique.mockResolvedValue(fakeUser);
    jwt.createAccessToken.mockReturnValue("access-token");
    jwt.createRefreshToken.mockReturnValue("refresh");
    jwt.hashRefreshToken.mockReturnValue("refresh-token");
    prisma.user.update.mockResolvedValue(fakeUser);

    await authController.refresh(req, res, next);

    expect(prisma.user.update).toHaveBeenCalledWith({
      where: {
        id: fakeUser.id,
      },
      data: {
        refreshToken: "refresh-token",
      },
    });
    expect(res.cookie).toHaveBeenCalledWith("jwt", "refresh", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    res.json({
      accessToken: "access-token",
    });
  });
});
