import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Server-Sent Events channel for the live activity stream.
 * Currently polls the snapshot every 10s and emits the most recent
 * alerts/activity. When Monday webhooks are wired up, swap the poll
 * loop for a webhook → channel push without changing the client.
 */
const POLL_INTERVAL_MS = 10_000;

export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      // Initial snapshot summary
      try {
        const snap = await mondayService.getSnapshot();
        send("snapshot", {
          generatedAt: snap.generatedAt,
          mode: snap.mode,
          networkScore: snap.networkScore,
          alerts: snap.alerts.length,
          critical: snap.alerts.filter((a) => a.severity === "critical").length,
        });
      } catch {
        send("error", { message: "initial snapshot failed" });
      }

      let stopped = false;
      const heartbeat = setInterval(
        () => {
          if (!stopped)
            controller.enqueue(encoder.encode(`: heartbeat\n\n`));
        },
        15_000,
      );

      const poll = setInterval(async () => {
        if (stopped) return;
        try {
          const snap = await mondayService.getSnapshot();
          const lastAlerts = snap.alerts.slice(0, 5);
          send("alerts", lastAlerts);
        } catch {
          /* ignore transient */
        }
      }, POLL_INTERVAL_MS);

      // Cleanup
      // @ts-expect-error — TS lib for ReadableStreamController lacks signal
      controller.signal?.addEventListener?.("abort", () => {
        stopped = true;
        clearInterval(heartbeat);
        clearInterval(poll);
        try {
          controller.close();
        } catch {
          /* ignore */
        }
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "x-bfresh-stream": "v1",
    },
  });
}
