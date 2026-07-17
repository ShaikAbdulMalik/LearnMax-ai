-- Adds story column to learning_projects
alter table public.learning_projects add column if not exists story jsonb;
