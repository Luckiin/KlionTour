-- ============================================================
-- KlionTour - Schema Supabase (PostgreSQL)
-- Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- Habilitar extensão para UUID
create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────
-- 1. USUÁRIOS (clientes e admins)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.users (
  id              uuid primary key default gen_random_uuid(),
  auth_id         uuid unique,                        -- referência ao auth.users do Supabase
  name            text not null,
  email           text not null unique,
  phone           text,
  role            text not null default 'client'      -- 'client' | 'admin'
                  check (role in ('client', 'admin')),

  -- Pessoa física / jurídica
  is_empresa      boolean not null default false,
  documento       text,                               -- CPF ou CNPJ (sem máscara)

  -- Endereço
  endereco        text,
  cidade          text,
  cep             text,
  estado          text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Índices
create index if not exists idx_users_email on public.users (email);
create index if not exists idx_users_role  on public.users (role);

-- ─────────────────────────────────────────────────────────────
-- 2. MOTORISTAS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.motoristas (
  id                  uuid primary key default gen_random_uuid(),

  -- Dados pessoais
  nome_completo       text not null,
  data_nascimento     date,
  cpf                 text unique,                    -- apenas dígitos
  rg                  text,
  orgao_expedidor     text,
  data_emissao_rg     date,

  -- Endereço
  endereco            text,
  cep                 text,
  cidade              text,
  uf                  char(2),
  telefone            text,

  -- Remuneração
  salario_anual       numeric(12,2),

  -- CNH
  numero_cnh          text unique,
  tipo_cnh            text,                           -- A, B, C, D, E, AB…
  data_emissao_cnh    date,
  cidade_cnh          text,
  uf_cnh              char(2),

  ativo               boolean not null default true,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create index if not exists idx_motoristas_cpf  on public.motoristas (cpf);
create index if not exists idx_motoristas_ativo on public.motoristas (ativo);

-- ─────────────────────────────────────────────────────────────
-- 3. VEÍCULOS
-- ─────────────────────────────────────────────────────────────
create table if not exists public.veiculos (
  id                          uuid primary key default gen_random_uuid(),

  -- Dados básicos
  placa                       text not null unique,
  modelo                      text not null,
  marca                       text,
  ano                         smallint,
  chassi                      text unique,
  renavam                     text unique,
  cor                         text,
  quantidade_maxima_passageiros smallint,

  -- Valores principais
  valor_seguro                numeric(12,2),
  valor_veiculo               numeric(12,2),

  -- Terceirizado
  terceirizado                boolean not null default false,
  cpf_cnpj_proprietario       text,
  proprietario                text,
  telefone_proprietario       text,

  -- Vistorias / licenciamento
  valor_vistoria              numeric(12,2),
  valor_licenciamento         numeric(12,2),
  gtx_vistoria                numeric(12,2),
  renovacao_simplificada      numeric(12,2),

  -- Ficha técnica (custos mensais)
  media_km_rodado_mes         numeric(12,2),
  revisao_veiculo             numeric(12,2),
  pneus_veiculo               numeric(12,2),
  combustivel_por_litro       numeric(8,3),
  lavagem                     numeric(12,2),
  manutencao_veiculo          numeric(12,2),
  alinhamento_pneu            numeric(12,2),
  balanceamento               numeric(12,2),

  ativo                       boolean not null default true,
  created_at                  timestamptz not null default now(),
  updated_at                  timestamptz not null default now()
);

create index if not exists idx_veiculos_placa on public.veiculos (placa);
create index if not exists idx_veiculos_ativo on public.veiculos (ativo);

-- ─────────────────────────────────────────────────────────────
-- 4. COTAÇÕES
-- ─────────────────────────────────────────────────────────────
create table if not exists public.quotes (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid references public.users (id) on delete set null,

  -- Usuário (desnormalizado p/ histórico)
  user_name       text,
  user_email      text,
  user_phone      text,

  -- Rota
  from_city       text not null,
  to_city         text not null,
  from_lat        double precision,
  from_lon        double precision,
  to_lat          double precision,
  to_lon          double precision,
  distance_km     numeric(10,2),

  -- Viagem
  trip_type       text not null default 'ida'         -- 'ida' | 'ida_volta'
                  check (trip_type in ('ida', 'ida_volta')),
  date            date not null,
  return_date     date,
  passengers      smallint not null,

  -- Van
  van_id          text,
  van_name        text,

  -- Motorista / veículo alocado
  motorista_id    uuid references public.motoristas (id) on delete set null,
  veiculo_id      uuid references public.veiculos (id) on delete set null,

  -- Valores
  price           numeric(12,2),
  total_price     numeric(12,2),

  -- Status
  status          text not null default 'pending'
                  check (status in ('pending','approved','rejected','paid','done','cancelled')),

  -- Notas
  notes           text,
  admin_notes     text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index if not exists idx_quotes_user_id  on public.quotes (user_id);
create index if not exists idx_quotes_status   on public.quotes (status);
create index if not exists idx_quotes_date     on public.quotes (date);

-- ─────────────────────────────────────────────────────────────
-- 5. RECEITAS (entradas financeiras)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.revenues (
  id              uuid primary key default gen_random_uuid(),
  description     text not null,
  amount          numeric(12,2) not null,
  date            date not null,
  category        text not null default 'viagem',     -- viagem | fretamento_mensal | outros
  quote_id        uuid references public.quotes (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_revenues_date     on public.revenues (date);
create index if not exists idx_revenues_category on public.revenues (category);

-- ─────────────────────────────────────────────────────────────
-- 6. DESPESAS (saídas financeiras)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.expenses (
  id              uuid primary key default gen_random_uuid(),
  description     text not null,
  amount          numeric(12,2) not null,
  date            date not null,
  category        text not null default 'outros',
  -- combustivel | manutencao | seguro | salario | marketing | outros
  veiculo_id      uuid references public.veiculos (id) on delete set null,
  motorista_id    uuid references public.motoristas (id) on delete set null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_expenses_date     on public.expenses (date);
create index if not exists idx_expenses_category on public.expenses (category);

-- ─────────────────────────────────────────────────────────────
-- 7. ROW LEVEL SECURITY (RLS)
-- ─────────────────────────────────────────────────────────────

-- Ativar RLS em todas as tabelas
alter table public.users       enable row level security;
alter table public.motoristas  enable row level security;
alter table public.veiculos    enable row level security;
alter table public.quotes      enable row level security;
alter table public.revenues    enable row level security;
alter table public.expenses    enable row level security;

-- Helper: retorna o role do usuário autenticado
create or replace function public.get_user_role()
returns text language sql security definer as $$
  select role from public.users where auth_id = auth.uid() limit 1;
$$;

-- ── users ────────────────────────────────────────────────────
-- Admin vê todos; cliente vê apenas o próprio perfil
create policy "users: admin full access"
  on public.users for all
  using (public.get_user_role() = 'admin');

create policy "users: client reads own"
  on public.users for select
  using (auth_id = auth.uid());

create policy "users: client updates own"
  on public.users for update
  using (auth_id = auth.uid());

create policy "users: client inserts own"
  on public.users for insert
  with check (auth_id = auth.uid());

-- ── quotes ───────────────────────────────────────────────────
create policy "quotes: admin full access"
  on public.quotes for all
  using (public.get_user_role() = 'admin');

create policy "quotes: client reads own"
  on public.quotes for select
  using (user_id = (select id from public.users where auth_id = auth.uid()));

create policy "quotes: client inserts own"
  on public.quotes for insert
  with check (user_id = (select id from public.users where auth_id = auth.uid()));

-- ── motoristas, veiculos, revenues, expenses ─────────────────
create policy "motoristas: admin only"
  on public.motoristas for all
  using (public.get_user_role() = 'admin');

create policy "veiculos: admin only"
  on public.veiculos for all
  using (public.get_user_role() = 'admin');

create policy "revenues: admin only"
  on public.revenues for all
  using (public.get_user_role() = 'admin');

create policy "expenses: admin only"
  on public.expenses for all
  using (public.get_user_role() = 'admin');

-- ─────────────────────────────────────────────────────────────
-- 8. TRIGGERS: updated_at automático
-- ─────────────────────────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

create trigger trg_motoristas_updated_at
  before update on public.motoristas
  for each row execute function public.set_updated_at();

create trigger trg_veiculos_updated_at
  before update on public.veiculos
  for each row execute function public.set_updated_at();

create trigger trg_quotes_updated_at
  before update on public.quotes
  for each row execute function public.set_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 9. STORAGE BUCKET (opcional — documentos e fotos)
-- ─────────────────────────────────────────────────────────────
-- Execute no Dashboard > Storage > New bucket:
--   Nome: kliontour-docs   (private)
--   Nome: kliontour-public (public) — para imagens de vans
--
-- Ou via SQL:
-- insert into storage.buckets (id, name, public) values ('kliontour-docs', 'kliontour-docs', false);
-- insert into storage.buckets (id, name, public) values ('kliontour-public', 'kliontour-public', true);

-- ─────────────────────────────────────────────────────────────
-- FIM DO SCHEMA
-- ─────────────────────────────────────────────────────────────
