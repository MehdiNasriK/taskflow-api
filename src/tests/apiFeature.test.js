import {describe, it, expect } from "vitest";
import ApiFeature from "../shared/utils/apiFeature";


describe("api-feature", () => {
  it("must return query object into a prisma valid object", () => {
    const queryObject = { "createdAt[gt]": "0", title: "learn" };
    const prismaObjesct = new ApiFeature(queryObject)
      .filter()
      .search()
      .sort()
      .pagination()
      .build();

    expect(prismaObjesct).toEqual({
      where: {
        createdAt: {
          gt: "0",
        },
        title: "learn",
      },
      orderBy: {},
      take: 10,
      skip: 0
    });
  });
});
