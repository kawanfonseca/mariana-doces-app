# Guia de Hospedagem - Mariana Doces

## 🔴 Problema Atual: Banco de Dados Resetando

### Diagnóstico
O banco de dados está resetando porque a API usa **SQLite em ambiente serverless (Vercel)**:

```env
DATABASE_URL='file:./dev.db'  # ❌ Arquivo local = perdido a cada deploy
```

**Por que isso acontece:**
1. Vercel/Render são **serverless** - cada deploy cria uma instância nova
2. SQLite salva em **arquivo local** no filesystem
3. O filesystem é **efêmero** - não persiste entre deploys
4. Qualquer alteração no código = novo deploy = banco zerado

### Solução: Usar PostgreSQL Externo

Você precisa de um banco de dados **persistente** hospedado externamente.

---

## 🚀 Opções de Hospedagem para API + PostgreSQL

### Opção 1: Railway (Recomendado) ⭐

**Custo:** $5/mês (com $5 de créditos grátis)
**Vantagens:** Tudo em um lugar, fácil de configurar

#### Passo a Passo:

1. **Criar conta:** https://railway.app

2. **Criar novo projeto:**
   ```bash
   # Conecte seu GitHub e selecione mariana-doces-api
   ```

3. **Adicionar PostgreSQL:**
   - Clique em "New" → "Database" → "PostgreSQL"
   - Railway cria automaticamente a `DATABASE_URL`

4. **Configurar variáveis de ambiente:**
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   JWT_SECRET=sua_chave_secreta_aqui
   NODE_ENV=production
   ```

5. **Deploy automático:**
   - Railway faz deploy automaticamente a cada push no GitHub

6. **Rodar migrations:**
   ```bash
   # No terminal do Railway ou via SSH
   npx prisma migrate deploy
   npx prisma db seed  # Se tiver seed
   ```

---

### Opção 2: Fly.io + Supabase

**Custo:** Grátis (com limites generosos)

#### Fly.io (API):

1. **Instalar CLI:**
   ```bash
   curl -L https://fly.io/install.sh | sh
   ```

2. **Login e criar app:**
   ```bash
   fly auth login
   cd mariana-doces-api
   fly launch
   ```

3. **Configurar `fly.toml`:**
   ```toml
   app = "mariana-doces-api"
   primary_region = "gru"  # São Paulo

   [build]
     builder = "heroku/buildpacks:20"

   [env]
     NODE_ENV = "production"
     PORT = "8080"

   [http_service]
     internal_port = 8080
     force_https = true
     auto_stop_machines = false  # ← Mantém sempre online
     auto_start_machines = true
     min_machines_running = 1    # ← Mínimo 1 instância

   [[services]]
     protocol = "tcp"
     internal_port = 8080
     [[services.ports]]
       port = 80
       handlers = ["http"]
     [[services.ports]]
       port = 443
       handlers = ["tls", "http"]
   ```

4. **Adicionar secrets:**
   ```bash
   fly secrets set DATABASE_URL="postgresql://..." JWT_SECRET="..."
   ```

5. **Deploy:**
   ```bash
   fly deploy
   ```

#### Supabase (PostgreSQL):

1. **Criar conta:** https://supabase.com

2. **Criar novo projeto**

3. **Copiar connection string:**
   - Vá em Settings → Database
   - Copie a "Connection string" (URI)

4. **Usar no Fly.io:**
   ```bash
   fly secrets set DATABASE_URL="postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres"
   ```

---

### Opção 3: Render Paid ($7/mês)

Se quiser manter no Render mas sem o problema de "sleep":

1. Upgrade para o plano **Starter** ($7/mês)
2. Adicionar PostgreSQL ($7/mês adicional)
3. Total: ~$14/mês para API + DB sempre online

---

### Opção 4: Manter Grátis com Keep-Alive (Workaround)

Se preferir manter no plano gratuito:

#### A. UptimeRobot (Recomendado)

1. Criar conta em https://uptimerobot.com (grátis)
2. Adicionar novo monitor:
   - **Monitor Type:** HTTP(s)
   - **URL:** `https://mariana-doces-api.vercel.app/api/health`
   - **Monitoring Interval:** 5 minutes
3. Isso mantém a API "acordada"

⚠️ **Limitação:** Isso NÃO resolve o problema do banco SQLite resetar. Você ainda precisa de PostgreSQL externo.

#### B. Cron-Job.org

1. Criar conta em https://cron-job.org (grátis)
2. Criar novo cron job:
   ```
   URL: https://mariana-doces-api.vercel.app/api/health
   Schedule: */5 * * * *  (a cada 5 minutos)
   ```

---

## 🗄️ Configurando PostgreSQL Externo

### Neon (Grátis - Recomendado para começar)

1. **Criar conta:** https://neon.tech

2. **Criar database**

3. **Copiar connection string:**
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```

4. **Atualizar no Vercel:**
   - Vá em Settings → Environment Variables
   - Adicione/atualize `DATABASE_URL`

5. **Rodar migrations:**
   ```bash
   # Localmente, com a nova DATABASE_URL
   DATABASE_URL="postgresql://..." npx prisma migrate deploy
   ```

### Supabase (Grátis - 500MB)

Mesmo processo acima, usando Supabase em vez de Neon.

---

## 📋 Checklist de Migração

- [ ] Criar conta no provedor de PostgreSQL (Neon/Supabase/Railway)
- [ ] Criar database
- [ ] Copiar connection string
- [ ] Atualizar `DATABASE_URL` no ambiente de produção
- [ ] Atualizar `prisma/schema.prisma` se necessário:
  ```prisma
  datasource db {
    provider = "postgresql"  // Mudar de "sqlite" para "postgresql"
    url      = env("DATABASE_URL")
  }
  ```
- [ ] Gerar nova migration:
  ```bash
  npx prisma migrate dev --name switch_to_postgres
  ```
- [ ] Deploy da API
- [ ] Rodar migrations em produção:
  ```bash
  npx prisma migrate deploy
  ```
- [ ] Rodar seed (se necessário):
  ```bash
  npx prisma db seed
  ```
- [ ] Testar aplicação

---

## 🔧 Configuração do Prisma para PostgreSQL

Atualize `prisma/schema.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ... seus models
```

---

## 📊 Comparativo de Custos

| Solução | API | PostgreSQL | Total/mês | Uptime |
|---------|-----|------------|-----------|--------|
| **Railway** | $5* | Incluso | $5* | 99.9% |
| **Fly.io + Neon** | Grátis | Grátis | $0 | 99.9% |
| **Fly.io + Supabase** | Grátis | Grátis | $0 | 99.9% |
| **Render Paid** | $7 | $7 | $14 | 99.9% |
| **Vercel + Neon** | Grátis | Grátis | $0** | ~95% |

*Railway tem $5 de créditos grátis/mês
**Vercel grátis tem cold starts e limites de execução

---

## 🆘 Troubleshooting

### Erro: "Database does not exist"
```bash
npx prisma migrate deploy
```

### Erro: "Migration failed"
```bash
npx prisma migrate reset  # ⚠️ Apaga dados!
# ou
npx prisma db push --force-reset  # ⚠️ Apaga dados!
```

### Erro: "Connection refused"
- Verifique se a `DATABASE_URL` está correta
- Verifique se o IP está na whitelist (Supabase/Neon)
- Verifique se SSL está habilitado (`?sslmode=require`)

### Dados sumiram após deploy
- Você está usando SQLite? Mude para PostgreSQL
- Verificar se `migrate reset` não está no build script

---

## 📞 Suporte

- **Railway:** https://railway.app/help
- **Fly.io:** https://fly.io/docs
- **Neon:** https://neon.tech/docs
- **Supabase:** https://supabase.com/docs
- **Prisma:** https://prisma.io/docs
