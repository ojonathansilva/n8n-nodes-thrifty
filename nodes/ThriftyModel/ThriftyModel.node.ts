/* eslint-disable n8n-nodes-base/node-dirname-against-convention */
import {
  IExecuteFunctions,
  INodeType,
  INodeTypeDescription,
  ISupplyDataFunctions,
  SupplyData,
  ILoadOptionsFunctions,
  INodePropertyOptions,
} from "n8n-workflow";
import { ChatOpenAI } from "@langchain/openai";

export class ThriftyModel implements INodeType {
  description: INodeTypeDescription = {
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
          } as any,
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
            description:
              "Se ativado, economiza créditos usando o cache da Thrifty",
          },
        ],
      },
    ],
  };

  methods = {
    loadOptions: {
      async getModels(
        this: ILoadOptionsFunctions,
      ): Promise<INodePropertyOptions[]> {
        try {
          const response = await this.helpers.requestWithAuthentication.call(
            this,
            "thriftyApi",
            {
              method: "GET",
              uri: "https://api.thrifty.qzz.io/v1/models",
              json: true,
            },
          );

          if (response && Array.isArray(response.data)) {
            return response.data.map((model: any) => ({
              name: model.id,
              value: model.id,
            }));
          }
          return [];
        } catch (error) {
          return [];
        }
      },
    },
  };

  async supplyData(
    this: ISupplyDataFunctions,
    itemIndex: number,
  ): Promise<SupplyData> {
    const credentials = await this.getCredentials("thriftyApi");

    const modelName = this.getNodeParameter("model", itemIndex) as string;
    const options = this.getNodeParameter("options", itemIndex, {}) as any;

    const headers: Record<string, string> = {};
    if (options.useCache !== false) {
      headers["x-thrifty-use-cache"] = "true";
    }

    const model = new ChatOpenAI({
      modelName: modelName,
      openAIApiKey: credentials.apiKey as string,
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
