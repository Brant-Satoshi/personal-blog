import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it, vi } from "vitest";

const temporaryDirectories: string[] = [];

afterEach(() => {
  vi.resetModules();
  delete process.env.LIKES_DIR;
  for (const directory of temporaryDirectories.splice(0)) {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});

describe("like persistence", () => {
  it("persists increments to the configured data directory", async () => {
    const directory = fs.mkdtempSync(path.join(os.tmpdir(), "blog-likes-"));
    temporaryDirectories.push(directory);
    process.env.LIKES_DIR = directory;
    const likes = await import("@/lib/likes");
    expect(likes.getLikes("post")).toBe(0);
    expect(likes.addLike("post")).toBe(1);
    expect(likes.addLike("post")).toBe(2);
    expect(likes.getLikes("post")).toBe(2);
  });
});
