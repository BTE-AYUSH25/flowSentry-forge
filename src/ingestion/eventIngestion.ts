// src/ingestion/eventIngestion.ts

/**
 * MODULE 1: Event Ingestion
 *
 * Responsibility:
 * - Validate incoming raw events
 * - Normalize them into internal domain events
 *
 * IMPORTANT:
 * - This module does NOT analyze workflows
 * - This module does NOT store data
 * - This module does NOT call other modules
 */

// -----------------------------
// Types (match contract exactly)
// -----------------------------

export type RawEvent = {
  source: "jira";
  eventType: string;
  payload: unknown; // raw payload is opaque here
  receivedAt: string;
};

export type NormalizedEvent = {
  eventId: string;
  projectId: string;
  issueId: string;
  eventType: "STATUS_CHANGE" | "FIELD_CHANGE";
  fromState: string | null;
  toState: string | null;
  timestamp: string;
};

// -----------------------------
// Custom Error Types
// -----------------------------

export class EventIngestionError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
  }
}

// -----------------------------
// Helper Functions (PRIVATE)
// -----------------------------

/**
 * Beginners often forget to validate timestamps.
 * We enforce ISO-8601 so downstream modules don't break.
 */
function isValidISODate(value: string): boolean {
  return !isNaN(Date.parse(value));
}

/**
 * Generate a deterministic event ID.
 * NOTE:
 * - Do NOT use random UUIDs here (common beginner mistake)
 * - Determinism helps de-duplication
 */
function generateEventId(
  issueId: string,
  timestamp: string,
  eventType: string
): string {
  return `${issueId}:${eventType}:${timestamp}`;
}

// -----------------------------
// MAIN CONTRACT FUNCTION
// -----------------------------

export function ingestEvent(rawEvent: RawEvent): NormalizedEvent {
  // ---- Basic validation ----

  if (!rawEvent || rawEvent.source !== "jira") {
    throw new EventIngestionError(
      "INVALID_PAYLOAD",
      "Event source must be jira"
    );
  }

  if (!isValidISODate(rawEvent.receivedAt)) {
    throw new EventIngestionError(
      "INVALID_PAYLOAD",
      "receivedAt must be a valid ISO-8601 timestamp"
    );
  }

  // ---- Extract fields from payload ----
  // IMPORTANT:
  // Beginners often assume payload shape is stable.
  // We defensively extract only what we need.

  const payload: any = rawEvent.payload;

  const issueId = payload?.issue?.id;
  const projectId = payload?.issue?.fields?.project?.id;

  if (!issueId || !projectId) {
    throw new EventIngestionError(
      "INVALID_PAYLOAD",
      "Missing issueId or projectId"
    );
  }

  // ---- Normalize event type ----

  let normalizedType: NormalizedEvent["eventType"];
  let fromState: string | null = null;
  let toState: string | null = null;

  if (rawEvent.eventType === "issue_transitioned") {
    normalizedType = "STATUS_CHANGE";

    // Beginners often forget null checks here
    fromState = payload?.changelog?.fromString ?? null;
    toState = payload?.changelog?.toString ?? null;
  } else if (rawEvent.eventType === "issue_updated") {
    normalizedType = "FIELD_CHANGE";
  } else {
    throw new EventIngestionError(
      "UNSUPPORTED_EVENT_TYPE",
      `Unsupported event type: ${rawEvent.eventType}`
    );
  }

  // ---- Build normalized event ----

  const eventId = generateEventId(
    issueId,
    rawEvent.receivedAt,
    normalizedType
  );

  return {
    eventId,
    projectId,
    issueId,
    eventType: normalizedType,
    fromState,
    toState,
    timestamp: rawEvent.receivedAt
  };
}
