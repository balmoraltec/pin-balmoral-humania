# PIN Balmoral ESG

Projeto estático (HTML/CSS/JS) para posicionamento comercial ESG na hotelaria, com:

- Site institucional
- Diagnóstico ESG
- Dashboard mockup
- Trilha ESG
- Apresentação institucional de vendas

## Links públicos

- Vercel: `https://pin-balmoral-humania.vercel.app`
- Cloudflare Pages: `https://pin-balmoral-humania.pages.dev`

## Arquivos principais

- `index.html` - Landing page principal
- `trilha.html` - Trilha de capacitação ESG
- `diagnostico.html` - Diagnóstico ESG (quiz)
- `dashboard.html` - Dashboard do hotel
- `apresentacao-institucional.html` - Apresentação comercial para venda em hotéis
- `assets/selo-verde-esg-balmoral.svg` - Logotipo do Selo Verde

## Rodar localmente

```zsh
cd /Users/caiohaddad/pin-balmoral-humania
python3 -m http.server 5500
```

Abra no navegador:

```zsh
open "http://localhost:5500/index.html"
open "http://localhost:5500/apresentacao-institucional.html"
```

## Controles da apresentação

Na página `apresentacao-institucional.html`:

- `ArrowRight` / `PageDown`: próximo slide
- `ArrowLeft` / `PageUp`: slide anterior
- `P`: imprimir/exportar PDF

## Deploy e CI/CD

- `vercel.json` - regras de deploy Vercel
- `.github/workflows/vercel-cicd.yml` - CI/CD Vercel
- `.github/workflows/cloudflare-pages.yml` - deploy Cloudflare Pages

Secrets esperados no GitHub Actions:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`
