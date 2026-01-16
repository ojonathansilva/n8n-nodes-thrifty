"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThriftyChat = void 0;
class ThriftyChat {
    constructor() {
        this.description = {
            displayName: "Thrifty AI Chat",
            name: "thriftyChat",
            icon: "fa:robot", // Você pode usar um SVG depois se quiser
            group: ["transform"],
            version: 1,
            subtitle: '={{$parameter["model"]}}',
            description: "Gere texto usando a API econômica da Thrifty",
            defaults: {
                name: "Thrifty AI",
            },
            inputs: ["main"],
            outputs: ["main"],
            credentials: [
                {
                    name: "thriftyApi",
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: "Modelo",
                    name: "model",
                    type: "options",
                    options: [
                        { name: "GPT-4o (OpenAI)", value: "gpt-4o" },
                        { name: "GPT-4o Mini", value: "gpt-4o-mini" },
                        { name: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20240620" },
                        { name: "Llama 3.1 70B (Groq)", value: "llama-3.1-70b-versatile" },
                        { name: "Gemini 1.5 Pro", value: "gemini-1.5-pro-latest" },
                    ],
                    default: "gpt-4o-mini",
                    description: "O modelo que você deseja utilizar",
                },
                {
                    displayName: "Mensagem do Usuário",
                    name: "prompt",
                    type: "string",
                    default: "",
                    placeholder: "Ex: Escreva um email de vendas...",
                    description: "O que você quer perguntar para a IA?",
                    typeOptions: {
                        rows: 4,
                    },
                },
                {
                    displayName: "Opções Avançadas",
                    name: "options",
                    type: "collection",
                    placeholder: "Adicionar Opção",
                    default: {},
                    options: [
                        {
                            displayName: "Temperatura",
                            name: "temperature",
                            type: "number",
                            default: 0.7,
                            typeOptions: {
                                minValue: 0,
                                maxValue: 2,
                            },
                        },
                        {
                            displayName: "System Prompt",
                            name: "systemPrompt",
                            type: "string",
                            default: "",
                            placeholder: "Ex: Você é um assistente útil...",
                            typeOptions: { rows: 2 },
                        },
                        {
                            displayName: "Usar Cache Inteligente",
                            name: "useCache",
                            type: "boolean",
                            default: true,
                            description: "Se ativado, economiza créditos usando respostas cacheadas.",
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let i = 0; i < items.length; i++) {
            const model = this.getNodeParameter("model", i);
            const prompt = this.getNodeParameter("prompt", i);
            const options = this.getNodeParameter("options", i, {});
            const messages = [];
            if (options.systemPrompt) {
                messages.push({ role: "system", content: options.systemPrompt });
            }
            messages.push({ role: "user", content: prompt });
            const body = {
                model: model,
                messages: messages,
                temperature: options.temperature || 0.7,
                stream: false,
            };
            const headers = {};
            if (options.useCache) {
                headers["x-thrifty-use-cache"] = "true";
            }
            try {
                // Faz a chamada para a SUA API
                const response = await this.helpers.requestWithAuthentication.call(this, "thriftyApi", {
                    method: "POST",
                    uri: "https://api.thrifty.qzz.io/v1/chat/completions",
                    body,
                    headers,
                    json: true,
                });
                const aiText = response.choices[0].message.content;
                const usage = response.usage;
                returnData.push({
                    json: {
                        response: aiText,
                        usage: usage,
                        model: model,
                    },
                });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    // [CORREÇÃO] Adicionado "as any" para o TypeScript aceitar .message
                    const errorMessage = error.message || "Unknown error";
                    returnData.push({ json: { error: errorMessage } });
                    continue;
                }
                throw error;
            }
        }
        return [returnData];
    }
}
exports.ThriftyChat = ThriftyChat;
