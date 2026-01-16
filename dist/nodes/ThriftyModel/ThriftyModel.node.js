"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThriftyModel = void 0;
const openai_1 = require("@langchain/openai");
class ThriftyModel {
    constructor() {
        this.description = {
            displayName: "Thrifty AI Model",
            name: "thriftyModel",
            icon: "fa:robot",
            group: ["transform"],
            version: 1,
            description: "Modelo de linguagem da Thrifty para usar em Agentes e Chains",
            defaults: {
                name: "Thrifty Model",
            },
            inputs: [],
            outputs: ["ai_languageModel"],
            credentials: [
                {
                    name: "thriftyApi",
                    required: true,
                },
            ],
            properties: [
                {
                    displayName: "Model",
                    name: "model",
                    type: "options",
                    description: "Escolha o modelo da Thrifty",
                    default: "gpt-4o",
                    typeOptions: {
                        loadOptions: {
                            // [CORREÇÃO] Adicionado "as any" para o TypeScript não reclamar
                            method: "getModels",
                        },
                    },
                    // Fallback visual
                    options: [
                        { name: "GPT-4o (OpenAI)", value: "gpt-4o" },
                        { name: "GPT-4o Mini", value: "gpt-4o-mini" },
                        { name: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20240620" },
                        { name: "Llama 3.1 70B", value: "llama-3.1-70b-versatile" },
                    ],
                },
                {
                    displayName: "Options",
                    name: "options",
                    type: "collection",
                    placeholder: "Add Option",
                    default: {},
                    options: [
                        {
                            displayName: "Temperature",
                            name: "temperature",
                            type: "number",
                            default: 0.7,
                            typeOptions: { minValue: 0, maxValue: 2 },
                            description: "Quão criativa deve ser a resposta",
                        },
                        {
                            displayName: "Maximum Tokens",
                            name: "maxTokens",
                            type: "number",
                            default: -1,
                            description: "O número máximo de tokens para gerar na resposta",
                        },
                        {
                            displayName: "Use Thrifty Cache",
                            name: "useCache",
                            type: "boolean",
                            default: true,
                            description: "Se ativado, economiza créditos usando o cache da Thrifty",
                        },
                    ],
                },
            ],
        };
        this.methods = {
            loadOptions: {
                async getModels() {
                    try {
                        const response = await this.helpers.requestWithAuthentication.call(this, "thriftyApi", {
                            method: "GET",
                            uri: "https://api.thrifty.qzz.io/v1/models",
                            json: true,
                        });
                        if (response && Array.isArray(response.data)) {
                            return response.data.map((model) => ({
                                name: model.id,
                                value: model.id,
                            }));
                        }
                        return [];
                    }
                    catch (error) {
                        return [];
                    }
                },
            },
        };
    }
    async supplyData(itemIndex) {
        const credentials = await this.getCredentials("thriftyApi");
        const modelName = this.getNodeParameter("model", itemIndex);
        const options = this.getNodeParameter("options", itemIndex, {});
        const headers = {};
        if (options.useCache !== false) {
            headers["x-thrifty-use-cache"] = "true";
        }
        const model = new openai_1.ChatOpenAI({
            modelName: modelName,
            openAIApiKey: credentials.apiKey,
            temperature: options.temperature,
            maxTokens: options.maxTokens === -1 ? undefined : options.maxTokens,
            configuration: {
                baseURL: "https://api.thrifty.qzz.io/v1",
                defaultHeaders: headers,
            },
        });
        return {
            response: model,
        };
    }
}
exports.ThriftyModel = ThriftyModel;
