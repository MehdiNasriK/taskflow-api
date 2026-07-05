import { vi, describe, it, expect, beforeEach } from "vitest";
import request from "supertest";

vi.mock("../shared/utils/queueWorker.js", () => ({
  default: {
    add: vi.fn(),
  },
}));

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

import app from "../app.js";
import prisma from "../shared/config/prisma.js";
import emailQueue from "../shared/utils/queueWorker.js";
import bcrypt from "bcrypt";

describe("signup", () => {
  beforeEach(() => {});

  it("sould validate input, hash password, create user, add email in Queue, response", async () => {
    emailQueue.add.mockResolvedValue();
    prisma.user.create.mockResolvedValue({
      id: 1,
      username: "test",
      password: "hashed-password",
      email: "test@gmail.com",
    });
    bcrypt.hash.mockResolvedValue("hashed-password");

    const res = await request(app).post("/signup").send({
      username: "test",
      password: "Test1234",
      email: "test@gmail.com",
    });

    expect(prisma.user.create).toHaveBeenCalledWith({
      data: {
        username: "test",
        password: "hashed-password",
        email: "test@gmail.com",
      },
    });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      status: "success",
      message: "please check your email and login",
    });
  });
});
