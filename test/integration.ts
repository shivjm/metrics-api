import "mocha";
import chai = require("chai");
import chaiHttp = require("chai-http");
chai.use(chaiHttp);

const { assert } = chai;

import { create } from "../src/server";

describe("Server", () => {
  const app = create();

  it("should respond to /", async () => {
    const agent = chai.request(app).keepOpen();

    try {
      const response = await agent.get("/");

      assert.equal(response.status, 200);
    } finally {
      agent.close();
    }
  });
});
