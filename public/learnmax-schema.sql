-- LearnMax.ai schema: 5 tables, RLS, triggers, auto-profile
create extension if not exists "pgcrypto";

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- 1. profiles ---------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  preferred_level text,
  preferred_learning_style text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', new.email));
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. learning_projects ------------------------------------------------------
create table if not exists public.learning_projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  topic text not null,
  learning_goal text,
  learner_level text,
  learning_style text,
  available_minutes integer,
  requested_outputs text[] default '{}',
  status text default 'generating' check (status in ('generating','completed','failed')),
  lesson jsonb, quiz jsonb, flashcards jsonb, roadmap jsonb, recommendations jsonb, videos jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists learning_projects_user_idx on public.learning_projects (user_id, created_at desc);
drop trigger if exists learning_projects_updated_at on public.learning_projects;
create trigger learning_projects_updated_at before update on public.learning_projects
  for each row execute function public.set_updated_at();

-- 3. agent_runs -------------------------------------------------------------
create table if not exists public.agent_runs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.learning_projects(id) on delete cascade,
  agent_type text not null,
  agent_name text not null,
  selection_reason text,
  status text default 'queued' check (status in ('queued','running','completed','failed','skipped')),
  execution_order integer,
  execution_time_ms integer,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index if not exists agent_runs_project_idx on public.agent_runs (project_id, execution_order);
drop trigger if exists agent_runs_updated_at on public.agent_runs;
create trigger agent_runs_updated_at before update on public.agent_runs
  for each row execute function public.set_updated_at();

-- 4. quiz_attempts ----------------------------------------------------------
create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.learning_projects(id) on delete cascade,
  answers jsonb default '{}',
  score numeric(5,2),
  weak_topics text[] default '{}',
  created_at timestamptz default now()
);

-- 5. user_progress ----------------------------------------------------------
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid not null references public.learning_projects(id) on delete cascade,
  roadmap_step_id text not null,
  status text default 'not_started' check (status in ('not_started','in_progress','completed')),
  progress_percent integer default 0 check (progress_percent between 0 and 100),
  updated_at timestamptz default now(),
  unique (user_id, project_id, roadmap_step_id)
);
drop trigger if exists user_progress_updated_at on public.user_progress;
create trigger user_progress_updated_at before update on public.user_progress
  for each row execute function public.set_updated_at();

-- RLS -----------------------------------------------------------------------
alter table public.profiles enable row level security;
alter table public.learning_projects enable row level security;
alter table public.agent_runs enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.user_progress enable row level security;

drop policy if exists p_sel on public.profiles; drop policy if exists p_ins on public.profiles;
drop policy if exists p_upd on public.profiles; drop policy if exists p_del on public.profiles;
create policy p_sel on public.profiles for select using (auth.uid() = id);
create policy p_ins on public.profiles for insert with check (auth.uid() = id);
create policy p_upd on public.profiles for update using (auth.uid() = id);
create policy p_del on public.profiles for delete using (auth.uid() = id);

drop policy if exists lp_sel on public.learning_projects; drop policy if exists lp_ins on public.learning_projects;
drop policy if exists lp_upd on public.learning_projects; drop policy if exists lp_del on public.learning_projects;
create policy lp_sel on public.learning_projects for select using (auth.uid() = user_id);
create policy lp_ins on public.learning_projects for insert with check (auth.uid() = user_id);
create policy lp_upd on public.learning_projects for update using (auth.uid() = user_id);
create policy lp_del on public.learning_projects for delete using (auth.uid() = user_id);

drop policy if exists ar_sel on public.agent_runs; drop policy if exists ar_ins on public.agent_runs;
drop policy if exists ar_upd on public.agent_runs; drop policy if exists ar_del on public.agent_runs;
create policy ar_sel on public.agent_runs for select using (auth.uid() = user_id);
create policy ar_ins on public.agent_runs for insert with check (auth.uid() = user_id);
create policy ar_upd on public.agent_runs for update using (auth.uid() = user_id);
create policy ar_del on public.agent_runs for delete using (auth.uid() = user_id);

drop policy if exists qa_sel on public.quiz_attempts; drop policy if exists qa_ins on public.quiz_attempts;
drop policy if exists qa_upd on public.quiz_attempts; drop policy if exists qa_del on public.quiz_attempts;
create policy qa_sel on public.quiz_attempts for select using (auth.uid() = user_id);
create policy qa_ins on public.quiz_attempts for insert with check (auth.uid() = user_id);
create policy qa_upd on public.quiz_attempts for update using (auth.uid() = user_id);
create policy qa_del on public.quiz_attempts for delete using (auth.uid() = user_id);

drop policy if exists up_sel on public.user_progress; drop policy if exists up_ins on public.user_progress;
drop policy if exists up_upd on public.user_progress; drop policy if exists up_del on public.user_progress;
create policy up_sel on public.user_progress for select using (auth.uid() = user_id);
create policy up_ins on public.user_progress for insert with check (auth.uid() = user_id);
create policy up_upd on public.user_progress for update using (auth.uid() = user_id);
create policy up_del on public.user_progress for delete using (auth.uid() = user_id);
