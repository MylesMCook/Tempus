import { parse } from "@tempus-date/core";

export default {
  fetch() {
    const result = parse("every Monday from 8 pm to 10 pm", {
      timezone: "America/Chicago",
      reference: "2026-09-12T16:00:00Z",
    });
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  },
};
