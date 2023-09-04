import { PublicClientApplication, AuthenticationResult } from "@azure/msal-browser";

const clientId = 'f648d662-3e0a-4c10-9095-ae81ca9b36bd'
const clientSecret = 'oc68Q~WHfdZY37tCxnEK_KxgJE5fisFwWxvcPaKl'
const tenantId = '4ae02620-284e-438b-bf51-098630d0e1dc'

const scopes = ['https://graph.microsoft.com/.default']

const configuration = {
    auth:
    {
        clientId: clientId,
        clientSecret: clientSecret,
        authority: `https://login.microsoft.com/${tenantId}`,
    }
}

const authClient = new PublicClientApplication(configuration)

const deviceCodeRequest = {
    scopes: ["User.Read"],
}

export const GetGraphToken = async (): Promise<string> => {
    await authClient.initialize()
    authClient.loginPopup({ scopes: scopes, redirectUri: 'http://localhost:1234/api/v1/graphresponse' }).then((response) => {
        console.log(JSON.stringify(response));
        return response.accessToken
    }).catch((error) => {
        console.log(JSON.stringify(error));
        return "false"
    })
    return "false"
}

export default GetGraphToken

