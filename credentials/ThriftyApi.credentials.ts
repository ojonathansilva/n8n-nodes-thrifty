import {
  IAuthenticateGeneric,
  ICredentialTestRequest,
  ICredentialType,
  INodeProperties,
} from "n8n-workflow";

export class ThriftyApi implements ICredentialType {
  name = "thriftyApi";
  displayName = "Thrifty AI API";
  documentationUrl = "https://thrifty.qzz.io/docs";
  properties: INodeProperties[] = [
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

  authenticate: IAuthenticateGeneric = {
    type: "generic",
    properties: {
      headers: {
        Authorization: '={{"Bearer " + $credentials.apiKey}}',
      },
    },
  };

  test: ICredentialTestRequest = {
    request: {
      baseURL: "https://api.thrifty.qzz.io/v1",
      url: "/models", // Rota leve para testar se a chave funciona
    },
  };
}
