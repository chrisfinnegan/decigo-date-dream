-- Create plans table
create table plans (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  daypart text not null,
  date_start timestamptz not null,
  date_end timestamptz not null,
  neighborhood text not null,
  headcount int not null,
  budget_band text not null,
  two_stop boolean default false,
  notes_raw text,
  notes_chips text[] default '{}',
  mode text not null check (mode in ('top3','full20')),
  decision_deadline timestamptz not null,
  threshold int not null,
  locked boolean default false,
  locked_at timestamptz,
  canceled boolean default false,
  magic_token text unique not null
);

-- Create options table
create table options (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  rank int not null,
  name text not null,
  address text not null,
  lat double precision not null,
  lng double precision not null,
  price_band text,
  why_it_fits text,
  tip text,
  source_id text
);

-- Create votes table
create table votes (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  option_id uuid references options(id) on delete cascade,
  voter_hash text not null,
  created_at timestamptz default now()
);

-- Create invites table
create table invites (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  channel text check (channel in ('sms','email')) not null,
  value text not null,
  name text,
  consent_at timestamptz not null,
  sent_count int default 0,
  stopped boolean default false
);

-- Create reminders table
create table reminders (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid references plans(id) on delete cascade,
  invite_id uuid references invites(id),
  when_at timestamptz not null,
  kind text check (kind in ('30m','2h','24h')) not null,
  status text check (status in ('queued','sent','failed','stopped')) default 'queued'
);

-- Create feature flags table
create table flags (
  key text primary key,
  value jsonb not null
);

-- Create indexes
create index idx_options_plan_id on options(plan_id);
create index idx_votes_plan_id on votes(plan_id);
create index idx_votes_option_id on votes(option_id);
create index idx_invites_plan_id on invites(plan_id);
create index idx_reminders_plan_id on reminders(plan_id);
create index idx_reminders_status on reminders(status);

-- Enable RLS
alter table plans enable row level security;
alter table options enable row level security;
alter table votes enable row level security;
alter table invites enable row level security;
alter table reminders enable row level security;
alter table flags enable row level security;

-- RLS Policies for public read access (plan view)
create policy "Public can view non-canceled plans"
  on plans for select
  using (canceled = false);

create policy "Public can view options for non-canceled plans"
  on options for select
  using (
    exists (
      select 1 from plans
      where plans.id = options.plan_id
      and plans.canceled = false
    )
  );

create policy "Public can view votes"
  on votes for select
  using (true);

-- Note: Mutations will be handled via edge functions using service role key
-- These policies allow the edge functions to work properly
create policy "Service role can manage plans"
  on plans for all
  using (true)
  with check (true);

create policy "Service role can manage options"
  on options for all
  using (true)
  with check (true);

create policy "Service role can manage votes"
  on votes for all
  using (true)
  with check (true);

create policy "Service role can manage invites"
  on invites for all
  using (true)
  with check (true);

create policy "Service role can manage reminders"
  on reminders for all
  using (true)
  with check (true);

create policy "Public can read flags"
  on flags for select
  using (true);

create policy "Service role can manage flags"
  on flags for all
  using (true)
  with check (true);