import { expect, it } from "vite-plus/test";
import { pathnameFromUrl } from "./request-path";

it("reads the pathname from an absolute URL", () => {
  expect(pathnameFromUrl("https://tempus.funnydomainname.com/")).toBe("/");
  expect(pathnameFromUrl("https://tempus.funnydomainname.com/developers")).toBe("/developers");
  expect(pathnameFromUrl("https://tempus.funnydomainname.com/privacy?ref=footer")).toBe("/privacy");
});

it("treats rwsdk trailing slashes as the same route", () => {
  expect(pathnameFromUrl("https://tempus.funnydomainname.com/developers/")).toBe("/developers");
  expect(pathnameFromUrl("https://tempus.funnydomainname.com/privacy/")).toBe("/privacy");
});

it("falls back for a path-only string", () => {
  expect(pathnameFromUrl("/developers/")).toBe("/developers");
  expect(pathnameFromUrl("not a url")).toBe("/");
});
