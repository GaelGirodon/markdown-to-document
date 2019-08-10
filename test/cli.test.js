const assert = require("chai").assert;
const sinon = require("sinon");
const { requireForce } = require("./util");

describe("CLI", () => {
  before(() => {
    sinon.stub(process, "exit");
  });

  after(() => {
    process.exit.restore();
  });

  describe("mdtodoc", () => {
    it("should display help", () => {
      process.argv = ["node", "src/cli.js"];
      requireForce("../src/cli");
      assert.isTrue(process.exit.called);
    });
  });
});
