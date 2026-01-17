# n8n-nodes-thrifty

Este é o pacote oficial de nós da **Thrifty AI** para n8n. Ele permite integrar a API econômica da Thrifty diretamente em seus workflows, com suporte nativo a Agentes de IA e Chains.

## Nós Incluídos

### 1. Thrifty AI Chat

Um nó simples para conversas diretas (Chat Completions). Ideal para tarefas únicas de transformação de texto.

### 2. Thrifty AI Model (Novo!)

Um nó de **Modelo de Linguagem** compatível com os Agentes de IA do n8n (AI Agent).

- Conecte na entrada "Model" do AI Agent.
- Suporta memória (Window Buffer, Redis).
- Suporta Tools.

## Como Instalar

1. No seu n8n, vá em **Settings** > **Community Nodes**.
2. Clique em **Install**.
3. Digite: `n8n-nodes-thrifty`.
4. Instale e reinicie se necessário.

## Configuração

1. Adicione um nó Thrifty ao seu workflow.
2. Em **Credentials**, selecione **Create New**.
3. Insira sua **API Key** (obtida no painel da Thrifty).
   - O Base URL já vem configurado automaticamente.

## Suporte

Para dúvidas sobre a API, acesse a [Documentação Oficial](https://thrifty.qzz.io/docs).
