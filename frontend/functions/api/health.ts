import type { Env } from "../_lib/types";

export const onRequestGet: PagesFunction<Env> = ({ env }) =>
  Response.json({ status: "ok", has_api_key: Boolean(env.YOUTUBE_API_KEY?.trim()) });
