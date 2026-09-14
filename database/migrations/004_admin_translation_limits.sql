-- Shared abuse/cost limits for the protected Azure Translator integration.
CREATE TABLE public.translation_rate_limits (
  key text PRIMARY KEY,
  request_count integer NOT NULL CHECK (request_count >= 0),
  character_count integer NOT NULL CHECK (character_count >= 0),
  window_started_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.translation_rate_limits ENABLE ROW LEVEL SECURITY;
