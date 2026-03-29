# KlionTour — Sistema de Fretamento de Vans

Plataforma completa para cotação e gestão de fretamento de vans.

## Stack Tecnológica

| Camada | Tecnologia | Motivo |
|--------|-----------|--------|
| Frontend + API | **Next.js 14** (App Router) | SSR, performance, rotas API integradas |
| Estilos | **Tailwind CSS** | Produtividade, responsividade |
| Gráficos | **Recharts** | Leve e customizável |
| Banco de dados | **Supabase** (PostgreSQL) | Gerenciado, gratuito para MVP, auth inclusa |
| Deploy | **Vercel** | CI/CD automático, CDN global, free tier |
| E-mail | **Resend** | Simples, 3.000 emails/mês grátis |

---

## Estrutura do Projeto

```
src/
├── app/
│   ├── (main)/           # Layout com Header + Footer
│   │   ├── page.jsx      # Landing page
│   │   ├── simular/      # Simulação pública
│   │   ├── cotacao/      # Cotação (login obrigatório)
│   │   └── painel/       # Dashboard do cliente
│   ├── auth/
│   │   ├── entrar/       # Login
│   │   └── cadastro/     # Registro
│   └── admin/            # Dashboard admin (role: admin)
│       ├── page.jsx      # Visão geral
│       ├── cotacoes/     # Gerenciar cotações
│       ├── financeiro/   # Receitas e despesas
│       └── clientes/     # Lista de clientes
├── components/           # Componentes reutilizáveis
├── context/              # AuthContext (substitua por Supabase Auth)
└── lib/
    ├── constants.js      # Configurações globais
    └── mockData.js       # Dados de exemplo (substituir por API)
```

---

## Como Rodar Localmente

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

```bash
cp .env.example .env.local
# Edite .env.local com suas chaves
```

### 3. Iniciar em desenvolvimento

```bash
npm run dev
# Acesse http://localhost:3000
```

### Contas de demonstração

| Usuário | E-mail | Senha | Acesso |
|---------|--------|-------|--------|
| Admin | admin@kliontour.com.br | admin123 | Painel admin completo |
| Cliente | joao@email.com | 123456 | Painel cliente |

---

## Deploy em Produção

### Opção recomendada: Vercel + Supabase

#### 1. Banco de dados (Supabase)

1. Crie conta em [supabase.com](https://supabase.com)
2. Crie novo projeto
3. Execute o SQL abaixo no SQL Editor:

```sql
-- Usuários (gerenciado pelo Supabase Auth)
-- Adicionar coluna role na tabela de profiles
create table profiles (
  id uuid references auth.users on delete cascade,
  name text,
  phone text,
  role text default 'client',
  created_at timestamptz default now(),
  primary key (id)
);

-- Cotações
create table quotes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id),
  from_city text not null,
  to_city text not null,
  date date not null,
  return_date date,
  passengers int not null,
  van_id text not null,
  van_name text,
  notes text,
  status text default 'pending',
  price numeric,
  total_price numeric,
  admin_notes text,
  created_at timestamptz default now()
);

-- Financeiro - Receitas
create table revenues (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  amount numeric not null,
  date date not null,
  category text not null,
  quote_id uuid references quotes(id),
  created_at timestamptz default now()
);

-- Financeiro - Despesas
create table expenses (
  id uuid default gen_random_uuid() primary key,
  description text not null,
  amount numeric not null,
  date date not null,
  category text not null,
  created_at timestamptz default now()
);

-- RLS (segurança por linha)
alter table profiles enable row level security;
alter table quotes enable row level security;

create policy "Usuário vê próprios dados" on profiles for select using (auth.uid() = id);
create policy "Usuário vê próprias cotações" on quotes for select using (auth.uid() = user_id);
create policy "Admin vê tudo" on quotes for all using (
  exists (select 1 from profiles where id = auth.uid() and role = 'admin')
);
```

#### 2. Deploy no Vercel

```bash
# Instale a CLI do Vercel
npm i -g vercel

# Na pasta do projeto
vercel

# Siga as instruções e configure as variáveis de ambiente
```

Ou conecte seu repositório GitHub diretamente em [vercel.com](https://vercel.com).

#### 3. Variáveis de ambiente no Vercel

Configure em Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RESEND_API_KEY`
- `NEXTAUTH_SECRET`

---

## Próximos Passos (Roadmap)

- [ ] Integrar Supabase Auth (substituir mock)
- [ ] Criar API Routes para cotações (POST /api/cotacoes)
- [ ] Notificações por e-mail com Resend (nova cotação → admin, aprovação → cliente)
- [ ] Notificações por WhatsApp (Twilio ou Z-API)
- [ ] Integração de pagamento (Mercado Pago ou Stripe)
- [ ] Upload de foto de comprovante de pagamento
- [ ] App mobile (React Native ou PWA)
- [ ] Relatórios financeiros em PDF

---

## Suporte

Em caso de dúvidas ou problemas, entre em contato.

© 2026 KlionTour. Todos os direitos reservados.
