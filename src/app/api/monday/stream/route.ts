import { mondayService } from "@/services/monday";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * Server-Sent Events — live operational channel.
 *
 * Events emitted:
 *   snapshot   — { generatedAt, mode, networkScore, alerts, critical }
 *   alerts     — top 5 alerts (every POLL_INTERVAL_MS)
 *   narratives — current AI narrative pack
 *   diff       — last-vs-current SnapshotDiff (or null if no history yet)
 *   heartbeat  — comment line every HEARTBEAT_MS
 *
 * When Monday webhooks are wired, swap the poll loop for webhook pushes
 * without touching consumers.
 */

const POLL_INTERVAL_MS = 10_000;
const HEARTBEAT_MS = 15_000;

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: unknown) => {
        controller.enqueue(
          encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`),
        );
      };

      const pushAll = async () => {
        try {
          const snap = await mondayService.getSnapshot();
          send("snapshot", {
            generatedAt: snap.generatedAt,
            mode: snap.mode,
            networkScore: snap.networkScore,
            alerts: snap.alerts.length,
            critical: snap.alerts.filter((a) => a.severity === "critical")
              .length,
          });
          send("alerts", snap.alerts.slice(0, 5));
          send("narratives", await mondayService.getNarratives());
          send("diff", await mondayService.getDiff());
        } catch (e) {
          send("error", {
            message: e instanceof Error ? e.message : "stream error",
          });
        }
      };

      await pushAll();

      let stopped = false;
      const heartbeat = setInterval(() => {
        if (!stopped) controller.enqueue(encoder.encode(`: heartbeat\n\n`));
      }, HEARTBEAT_MS);
      const poll = setInterval(() => {
        if (!stopped) void pushAll();
      }, POLL_INTERVAL_MS);

      // @ts-expect-error — ReadableStream controller signal is experimental
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
      "x-bfresh-stream": "v2",
    },
  });
}
