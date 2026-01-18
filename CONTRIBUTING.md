# Guia de Contribuição e Publicação (CI/CD)

Este documento detalha o processo de configuração do pipeline de automação para publicar o pacote no NPM via GitHub Actions, contornando as restrições de Autenticação de Dois Fatores (2FA) de forma segura.

## ⚠️ Visão Geral da Segurança

O NPM exige 2FA para contas seguras. Robôs (GitHub Actions) não possuem celular para gerar códigos OTP. Para resolver isso, utilizamos:

1.  **Trusted Publishing (OIDC):** O NPM confia na identidade do repositório GitHub.
2.  **Granular Access Token:** Um token específico com permissão de bypass.
3.  **Provenance:** Assinatura digital que prova a origem do código.

---

## 1. Configuração no NPM (Crítico)

Se precisar reconfigurar os tokens ou o acesso, siga estes passos exatos para evitar erros `EOTP` ou `E403`.

### 1.1. Ajustar Permissões do Pacote

1.  Vá em [npmjs.com](https://www.npmjs.com/) > Seu Pacote > **Settings**.
2.  Em **Publishing Access**, selecione a opção:
    > "Require two-factor authentication or a granular access token with bypass 2fa enabled"
    > _(Isso permite que tokens de automação publiquem sem pedir código de celular)._

### 1.2. Gerar Token de Automação

1.  Vá em **Access Tokens** > **Generate New Token** > **Granular Access Token**.
2.  **Name:** `GitHub Actions Automation`.
3.  **Expiration:** 90 dias (máximo permitido).
4.  **Packages:** Selecione o pacote específico (`n8n-nodes-thrifty`).
5.  **Permissions:** Marque **"Read and write"**.
6.  **IMPORTANTE:** Dependendo da interface, se houver uma checkbox "Automation" ou "Bypass 2FA", marque-a.
7.  Copie o token gerado (`npm_...`).

---

## 2. Configuração no GitHub

1.  No repositório, vá em **Settings** > **Secrets and variables** > **Actions**.
2.  Crie/Edite o segredo chamado `NPM_TOKEN`.
3.  Cole o token gerado no passo anterior.
    - **ATENÇÃO:** Certifique-se de não copiar espaços em branco ou quebras de linha no final do token. Isso gera erros de "Illegal HTTP Header".

---

## 3. Arquivos Obrigatórios no Projeto

Para que a automação funcione (erro `E422`), o `package.json` **DEVE** conter o link do repositório:

```json
"repository": {
  "type": "git",
  "url": "git+[https://github.com/SEU_USUARIO/n8n-nodes-thrifty.git](https://github.com/SEU_USUARIO/n8n-nodes-thrifty.git)"
},
"publishConfig": {
  "access": "public",
  "registry": "[https://registry.npmjs.org/](https://registry.npmjs.org/)"
}

```

## 4. O Workflow do GitHub Actions

O arquivo em .github/workflows/npm-publish.yml deve ter exatamente esta estrutura para validar o OIDC e usar o Token corretamente:

name: Publicar no NPM

on:
release:
types: [created]

jobs:
publish:
runs-on: ubuntu-latest
permissions:
contents: read
id-token: write # Permissão CRÍTICA para Trusted Publishing

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          registry-url: '[https://registry.npmjs.org](https://registry.npmjs.org)'

      - run: npm ci
      - run: npm run build

      # --provenance: Ativa a verificação OIDC (necessário para pular 2FA)
      # --access public: Garante publicação pública
      - run: npm publish --provenance --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}

```

```
