import { assert, expect } from "chai";

import { complete as completeFn } from "../../../src/internal/cli/autocomplete";
import { useEnvironment } from "../../helpers/environment";
import { useFixtureProject } from "../../helpers/project";

/**
 * Receive the line that is being completed, for example:
 * - `hh ` is the minimal line that can be completed (notice the space!)
 * - `hh comp` means that the cursor is immediately after the word
 * - `hh --network | compile` you can optionally use `|` to indicate the cursor's position; otherwise it is assumed the cursor is at the end
 */
async function complete(lineWithCursor: string): Promise<string[]> {
  const point = lineWithCursor.indexOf("|");
  const line = lineWithCursor.replace("|", "");

  return completeFn({
    line,
    point: point !== -1 ? point : line.length,
  });
}

const coreTasks = [
  "check",
  "clean",
  "compile",
  "console",
  "flatten",
  "help",
  "node",
  "run",
  "test",
];

const coreParams = [
  "--network",
  "--show-stack-traces",
  "--version",
  "--help",
  "--emoji",
  "--config",
  "--verbose",
  "--max-memory",
  "--tsconfig",
];

describe("autocomplete", () => {
  describe("basic project", () => {
    useFixtureProject("autocomplete/basic-project");

    it("should suggest all task names and global params", async () => {
      const suggestions = await complete("hh ");

      expect(suggestions).same.members([...coreTasks, ...coreParams]);
    });

    it("should suggest all task names and global params when given a partial param", async () => {
      const suggestions = await complete("hh --");

      expect(suggestions).same.members([...coreTasks, ...coreParams]);
    });

    it("shouldn't suggest an already used flag", async () => {
      const suggestions = await complete("hh --verbose ");

      const coreParamsWithoutVerbose = coreParams.filter(
        (x) => x !== "--verbose"
      );

      expect(suggestions).same.members([
        ...coreTasks,
        ...coreParamsWithoutVerbose,
      ]);
    });

    it("should suggest task flags", async () => {
      const suggestions = await complete("hh compile ");

      expect(suggestions).same.members([...coreParams, "--force", "--quiet"]);
    });

    it("should ignore already used flags", async () => {
      const suggestions = await complete("hh --verbose compile --quiet ");

      const coreParamsWithoutVerbose = coreParams.filter(
        (x) => x !== "--verbose"
      );

      expect(suggestions).same.members([
        ...coreParamsWithoutVerbose,
        "--force",
      ]);
    });

    it("should suggest a network", async () => {
      const suggestions = await complete("hh --network ");

      expect(suggestions).same.members(["hardhat", "localhost"]);
    });

    it("should suggest task names after global param", async () => {
      const suggestions = await complete("hh --network localhost ");

      const coreParamsWithoutNetwork = coreParams.filter(
        (x) => x !== "--network"
      );

      expect(suggestions).same.members([
        ...coreTasks,
        ...coreParamsWithoutNetwork,
      ]);
    });

    it("should work when the cursor is not at the end", async () => {
      const suggestions = await complete("hh --network | test");

      expect(suggestions).same.members(["hardhat", "localhost"]);
    });

    it("should not suggest flags used after the cursor", async () => {
      const suggestions = await complete("hh | test --verbose");

      const coreParamsWithoutVerbose = coreParams.filter(
        (x) => x !== "--verbose"
      );

      expect(suggestions).same.members([
        ...coreParamsWithoutVerbose,
        "--no-compile",
      ]);
    });

    it("should work when the cursor is at the middle and in a partial word", async () => {
      const suggestions = await complete("hh com| --verbose");

      const coreParamsWithoutVerbose = coreParams.filter(
        (x) => x !== "--verbose"
      );

      expect(suggestions).same.members([
        ...coreTasks,
        ...coreParamsWithoutVerbose,
      ]);
    });
  });
});
