import { describe, expect, it, vi } from "vite-plus/test";
import legacy from "../../worker/legacy-redirect";

describe("legacy hostname compatibility", () => {
  it("redirects paths and encoded query values to a fixed HTTPS origin", async () => {
    const fetch = vi.fn();
    const response = await legacy.fetch(
      new Request(
        "https://tempus-total.mylesmcook.workers.dev/privacy?next=https%3A%2F%2Fexample.com%2Fx",
      ),
      { TEMPUS: { fetch } },
    );
    expect(response.status).toBe(308);
    expect(response.headers.get("Location")).toBe(
      "https://tempus.funnydomainname.com/privacy?next=https%3A%2F%2Fexample.com%2Fx",
    );
    expect(fetch).not.toHaveBeenCalled();
  });
  it.each(["GET", "OPTIONS"])(
    "forwards %s API requests without redirecting preflights or dropping their context",
    async (method) => {
      const request = new Request(
        "https://tempus-total.funnydomainname.com/api/parse?expression=tomorrow",
        { method },
      );
      const response = new Response("result", { headers: { "Access-Control-Allow-Origin": "*" } });
      const fetch = vi.fn().mockResolvedValue(response);
      expect(await legacy.fetch(request, { TEMPUS: { fetch } })).toBe(response);
      expect(fetch).toHaveBeenCalledWith(request);
    },
  );
});
