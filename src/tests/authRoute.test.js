import { vi, describe, it, expect, beforeEach } from "vitest";

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn(),
  },
}));

vi.mock("../shared/config/prisma.js", () => ({
  default: {
    user: {
      create: vi.fn(),
    },
  },
}));

vi.mock("../shared/utils/queueWorker.js", () => ({
  default: {
    add: vi.fn(),
  },
}));

import authController from "../modules/auth/authController.js";
import prisma from "../shared/config/prisma.js";
import emailQueue from "../shared/utils/queueWorker.js";
import bcrypt from "bcrypt";

describe("testing", () => {
  let req, res, next;
  beforeEach(() => {
    req = {
      body: {
        username: "test",
        email: "test@gmail.com",
        password: "Test1234",
      },
      protocol: "http",
      get: vi.fn().mockReturnValue("localhost:3000"),
    };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
    next = vi.fn();

    vi.clearAllMocks();
  });

  it("should", async () => {
    const hashPass = "hashed-pass";
    const fakeUser = {
      id: 1,
      username: "test",
      email: "test@gmail.com",
      password: hashPass,
    };

    bcrypt.hash.mockResolvedValue(hashPass);
    prisma.user.create.mockResolvedValue(fakeUser);
    emailQueue.add.mockResolvedValue();

    await authController.signUp(req, res, next);

    console.log("bycrypt", bcrypt.hash.mock.calls);
    console.log("prisma", prisma.user.create.mock.calls);
    console.log("queue", emailQueue.add.mock.calls);
    console.log("status", res.status.mock.calls);
    console.log("json", res.json.mock.calls);

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
