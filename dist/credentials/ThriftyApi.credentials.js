"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ThriftyApi = void 0;
class ThriftyApi {
    constructor() {
        this.name = "thriftyApi";
        this.displayName = "Thrifty AI API";
        this.documentationUrl = "https://thrifty.qzz.io/docs";
        this.properties = [
            {
                displayName: "API Key",
                name: "apiKey",
                type: "string",
                typeOptions: { password: true },
                default: "",
                placeholder: "sk-thrifty-...",
                description: "Sua chave de API da Thrifty",
            },
        ];
        this.authenticate = {
            type: "generic",
            properties: {
                headers: {
                    Authorization: '={{"Bearer " + $credentials.apiKey}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: "https://api.thrifty.qzz.io/v1",
                url: "/models", // Rota leve para testar se a chave funciona
            },
        };
    }
}
exports.ThriftyApi = ThriftyApi;
