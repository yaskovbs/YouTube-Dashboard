import type { AnalyticsResponse, HealthResponse } from "./types";

const API_BASE = import.meta.env.VITE_API_URL ?? "";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`);
  if (!response.ok) {
    let message = `Request failed (${response.status})`;
    try {
      const body = await response.json();
      if (body?.detail) message = String(body.detail);
    } catch {
      // Response was not JSON; keep the default message.
    }
    throw new Error(message);
  }
  return response.json() as Promise<T>;
}

export function fetchHealth(): Promise<HealthResponse> {
  return request<HealthResponse>("/api/health");
}

export function fetchAnalytics(
  channel: string,
  options: { demo?: boolean; limit?: number } = {},
): Promise<AnalyticsResponse> {
  const params = new URLSearchParams();
  if (channel) params.set("channel", channel);
  if (options.demo) params.set("demo", "true");
  if (options.limit) params.set("limit", String(options.limit));
  return request<AnalyticsResponse>(`/api/analytics?${params.toString()}`);
}
