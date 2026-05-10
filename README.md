 cd /Users/caiohaddad/pin-balmoral-humania
npm i -g vercel
vercel login
vercel link
cat .vercel/project.json# PIN Balmoral ESG - Deploy (Cloudflare + Vercel CI/CD)

Projeto estático (HTML/CSS/JS) com deploy automático configurado para:

- **Cloudflare Pages** (link externo público)
- **Vercel** (CI/CD preview + produção)

## Estrutura adicionada

- `vercel.json` - regras de deploy e headers de segurança
- `.github/workflows/cloudflare-pages.yml` - deploy automático no Cloudflare Pages
- `.github/workflows/vercel-cicd.yml` - pipeline CI/CD no Vercel
- `.gitignore` - ignora `.vercel` e arquivos locais

## 1) Cloudflare - criar link externo

### 1.1 Criar projeto no Cloudflare Pages

1. Acesse **Cloudflare Dashboard -> Workers & Pages -> Create -> Pages**.
2. Nomeie o projeto como **pin-balmoral-humania**.
3. Se usar import por GitHub, selecione este repositório.
4. Build command: deixe vazio.
5. Build output directory: `.`
6. Faça o primeiro deploy.

Após o deploy, seu link externo padrão fica neste formato:

- `https://pin-balmoral-humaniwrangler logina.pages.dev`

> Depois você pode adicionar domínio próprio em **Custom domains**.

### 1.2 Secrets no GitHub para workflow Cloudflare

No GitHub, adicione em **Settings -> Secrets and variables -> Actions**:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

## 2) Vercel - CI/CD

### 2.1 Conectar projeto no Vercel

1. Acesse Vercel e importe este repositório.
2. Framework preset: **Other**.
3. Output directory: deixe padrão para estático.
4. Finalize o projeto.

### 2.2 Secrets no GitHub para workflow Vercel

No GitHub Actions secrets, adicione:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`

## 3) Fluxo dos pipelines

- Pull Request em `main` -> gera **preview deploy** no Vercel.
- Push em `main` -> deploy de **produção** no Vercel.
- Push em `main` -> deploy no **Cloudflare Pages**.

## 4) Teste local rápido

```zsh
cd /Users/caiohaddad/pin-balmoral-humania
python3 -m http.server 5500
```

Abra:

```zsh
open "http://localhost:5500/index.html"
```

## 5) Dica para obter ORG/PROJECT ID do Vercel

No seu terminal local (após login no Vercel):

```zsh
cd /Users/caiohaddad/pin-balmoral-humania
vercel link
cat .vercel/project.json
```

O `project.json` traz os valores para `VERCEL_ORG_ID` e `VERCEL_PROJECT_ID`.

