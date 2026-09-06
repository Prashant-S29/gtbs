-- GTBS content schema for PostgreSQL-compatible databases.
-- The JSONB data column preserves the application's validated domain record while
-- key relationship and ordering fields remain queryable and constrained.

CREATE TABLE public.categories (
  id text PRIMARY KEY,
  slug varchar(220) NOT NULL UNIQUE,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT categories_data_id_matches CHECK (data ->> 'id' = id),
  CONSTRAINT categories_data_slug_matches CHECK (data ->> 'slug' = slug)
);

CREATE TABLE public.products (
  id varchar(220) PRIMARY KEY,
  category_slug varchar(220) NOT NULL REFERENCES public.categories(slug)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT products_data_id_matches CHECK (data ->> 'id' = id),
  CONSTRAINT products_data_category_matches CHECK (
    data ->> 'category' = category_slug
  )
);

CREATE TABLE public.blogs (
  id text PRIMARY KEY,
  slug varchar(220) NOT NULL UNIQUE,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT blogs_data_id_matches CHECK (data ->> 'id' = id),
  CONSTRAINT blogs_data_slug_matches CHECK (data ->> 'slug' = slug)
);

CREATE TABLE public.galleries (
  id text PRIMARY KEY,
  slug varchar(220) NOT NULL UNIQUE,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT galleries_data_id_matches CHECK (data ->> 'id' = id),
  CONSTRAINT galleries_data_slug_matches CHECK (data ->> 'slug' = slug)
);

CREATE TABLE public.testimonials (
  id text PRIMARY KEY,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT testimonials_data_id_matches CHECK (data ->> 'id' = id)
);

CREATE TABLE public.team_members (
  id text PRIMARY KEY,
  position integer NOT NULL DEFAULT 0 CHECK (position >= 0),
  data jsonb NOT NULL CHECK (jsonb_typeof(data) = 'object'),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT team_members_data_id_matches CHECK (data ->> 'id' = id)
);

CREATE TABLE public.gtbs_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX products_category_position_idx
  ON public.products (category_slug, position);
CREATE INDEX blogs_position_idx ON public.blogs (position);
CREATE INDEX galleries_position_idx ON public.galleries (position);
CREATE INDEX testimonials_position_idx ON public.testimonials (position);
CREATE INDEX team_members_position_idx ON public.team_members (position);

-- These tables are server-owned. With no policies, enabling RLS denies access
-- through anonymous/authenticated data API roles while direct owner connections
-- (such as DATABASE_URL used by the server) retain access.
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.galleries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gtbs_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gtbs_schema_migrations ENABLE ROW LEVEL SECURITY;
