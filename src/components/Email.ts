import { PublicClientApplication, AuthenticationResult, SsoSilentRequest, PopupRequest,InteractionRequiredAuthError, AuthError } from "@azure/msal-browser";

const clientId = 'f648d662-3e0a-4c10-9095-ae81ca9b36bd'
const clientSecret = 'oc68Q~WHfdZY37tCxnEK_KxgJE5fisFwWxvcPaKl'
const tenantId = '4ae02620-284e-438b-bf51-098630d0e1dc'

const scopes = ['https://graph.microsoft.com/.default']

const configuration = {
    auth:
    {
        clientId: clientId,
        //clientSecret: clientSecret,
        authority: `https://login.microsoft.com/${tenantId}`,
        redirectUri: window.location.origin,
        postLogoutRedirectUri: window.location.origin,
        //redirectUri: 'http://localhost:1234/api/v1/graphresponse',
    },
    cache:
    {
        cacheLocation: "sessionStorage",
        temporaryCacheLocation: "sessionStorage",
        storeAuthStateInCookie: false,
        secureCookies: false,
        claimsBasedCachingEnabled: true,
    },
}

const authClient = new PublicClientApplication(configuration)

const deviceCodeRequest = {
    scopes: ["user.read", "mail.send"],
    redirectUri: 'http://localhost:1234/api/v1/graphresponse',
}

export const GetGraphToken = async (): Promise<string> => {
    await authClient.initialize()
    /*await authClient.acquireTokenPopup(deviceCodeRequest).then((response) => {
        console.log(`***${JSON.stringify(response)}***`);
        return response?.accessToken
    }).catch((error) => {
        console.log(JSON.stringify(error));
        return "false"
    })
    return "error" */
    const silentRequest: SsoSilentRequest = {
        scopes: scopes,
        loginHint: "username",
        redirectUri: window.location.origin
    }

    try
    {
        const loginResponse = await authClient.ssoSilent(silentRequest);
        console.log('SILENT id_token acquired at: ' + new Date().toString());
        console.log('SILENT access_token', loginResponse.accessToken)
        console.log(loginResponse);
        return loginResponse.accessToken;
    }catch (error: any)
    {
        if (error instanceof InteractionRequiredAuthError) {
            console.log("Silent Login failed - interactive requred")
            return await logIn();
          } else if (error instanceof AuthError) {
            console.log("Some other auth error - fallback to interactive login anyway", error)
            return await logIn();
          }
          else {
            console.error("auth.loginSilent()", error);
            throw new Error(`Login failed: ${error}`);
          }
    }
}

export const logIn = async () => {

    const loginRequest: PopupRequest = 
    {
        scopes: scopes,
        authority: `https://login.microsoft.com/${tenantId}`,
        //redirectUri: window.location.origin,
    }

    try {
      const loginResponse = await authClient.loginPopup(loginRequest);
  
      return loginResponse.accessToken;
    } catch (error: any) {
      // some error - not logged in
      console.error("auth.logIn()", error);
      //return "";
      throw new Error(`logIn failed: ${error}`);
    }
  
  }

export default GetGraphToken

