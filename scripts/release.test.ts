import { afterEach, describe, expect, it } from "bun:test";
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { prependChangelog, resolveTarget } from "./release";

describe("resolveTarget", () => {
  it("takes an explicit version as-is", () => {
    expect(resolveTarget("1.4.2", "1.0.0")).toBe("1.4.2");
  });

  it("bumps relative to the latest tag", () => {
    expect(resolveTarget("patch", "1.4.2")).toBe("1.4.3");
    expect(resolveTarget("minor", "1.4.2")).toBe("1.5.0");
    expect(resolveTarget("major", "1.4.2")).toBe("2.0.0");
  });
});

describe("prependChangelog", () => {
  const dir = mkdtempSync(join(tmpdir(), "release-test-"));
  const path = join(dir, "CHANGELOG.md");

  afterEach(() => {
    rmSync(path, { force: true });
  });

  it("puts the newest version directly under the preamble", () => {
    writeFileSync(
      path,
      "# Changelog\n\nGenerated at release time.\n\n## 1.0.0 - 2026-01-01\n\nold body\n",
    );

    prependChangelog("1.1.0", "### What's Changed\n\n- a thing", path);

    const text = readFileSync(path, "utf8");
    const headings = [...text.matchAll(/^## (.+)$/gm)].map((match) => match[1]);

    expect(headings).toHaveLength(2);
    expect(headings[0]).toMatch(/^1\.1\.0 - \d{4}-\d{2}-\d{2}$/);
    expect(headings[1]).toBe("1.0.0 - 2026-01-01");
    expect(text.startsWith("# Changelog")).toBe(true);
    expect(text.indexOf("### What's Changed")).toBeLessThan(
      text.indexOf("old body"),
    );
    expect(text.split("# Changelog")).toHaveLength(2);
  });
});
