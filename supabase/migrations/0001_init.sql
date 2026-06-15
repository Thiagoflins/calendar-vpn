-- PROFILES
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  role text not null default 'membro' check (role in ('admin','lider','membro')),
  criado_em timestamptz default now()
);

-- PEOPLE
create table people (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  email text,
  telefone text,
  funcoes text[] default '{}',
  ativo boolean not null default true,
  observacao text,
  criado_em timestamptz default now()
);

-- TEAMS
create table teams (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  descricao text,
  cor text check (cor in ('azul','verde','rosa','roxo','laranja','amarelo')),
  lider_id uuid references people(id) on delete set null,
  criado_em timestamptz default now()
);

-- TEAM_MEMBERS
create table team_members (
  team_id uuid references teams(id) on delete cascade,
  person_id uuid references people(id) on delete cascade,
  primary key (team_id, person_id)
);

-- EVENTS
create table events (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('culto','atividade')),
  nome text not null,
  descricao text,
  data date not null,
  hora time not null,
  cor text not null default 'azul' check (cor in ('azul','verde','rosa','roxo','laranja','amarelo')),
  observacao text,
  pastor text,
  responsavel text,
  adoracao jsonb,
  organizacao jsonb,
  equipe jsonb,
  repetir text default 'nenhuma' check (repetir in ('nenhuma','semanal','quinzenal','mensal')),
  repetir_qtd int,
  recorrencia_origem uuid references events(id) on delete set null,
  criado_em timestamptz default now(),
  atualizado_em timestamptz default now()
);

-- AVAILABILITY
create table availability (
  id uuid primary key default gen_random_uuid(),
  pessoa_id uuid not null references people(id) on delete cascade,
  data_inicio date not null,
  data_fim date not null,
  motivo text
);

-- Índices
create index idx_events_data on events(data);
create index idx_availability_pessoa on availability(pessoa_id);

-- Trigger atualizado_em
create or replace function set_atualizado_em()
returns trigger as $$
begin new.atualizado_em = now(); return new; end;
$$ language plpgsql;

create trigger trg_events_updated
before update on events
for each row execute function set_atualizado_em();

-- Trigger para criar profile no signup
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into profiles (id, nome, role)
  values (new.id, new.raw_user_meta_data->>'nome', 'membro');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function handle_new_user();

-- RLS
alter table people enable row level security;
alter table teams enable row level security;
alter table team_members enable row level security;
alter table events enable row level security;
alter table availability enable row level security;
alter table profiles enable row level security;

-- Políticas de leitura: usuários autenticados
create policy "auth read people"        on people        for select using (auth.role() = 'authenticated');
create policy "auth read teams"         on teams         for select using (auth.role() = 'authenticated');
create policy "auth read team_members"  on team_members  for select using (auth.role() = 'authenticated');
create policy "auth read events"        on events        for select using (auth.role() = 'authenticated');
create policy "auth read availability"  on availability  for select using (auth.role() = 'authenticated');
create policy "auth read profiles"      on profiles      for select using (auth.uid() = id);

-- Políticas de escrita: admin ou líder
create policy "admin write people" on people for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','lider')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','lider')));

create policy "admin write teams" on teams for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','lider')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','lider')));

create policy "admin write team_members" on team_members for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','lider')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','lider')));

create policy "admin write events" on events for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','lider')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','lider')));

create policy "admin write availability" on availability for all
  using (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','lider')))
  with check (exists (select 1 from profiles p where p.id = auth.uid() and p.role in ('admin','lider')));
