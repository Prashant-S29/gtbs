-- Better Auth 1.7.3 no longer writes the short-lived account.issuer field that
-- appeared in 1.7.2. Keep the persisted schema exactly aligned with the pinned
-- runtime adapter so credential-account inserts cannot fail.

ALTER TABLE public.auth_account
  DROP CONSTRAINT auth_account_issuer_account_id_uq;

ALTER TABLE public.auth_account
  DROP COLUMN issuer;
