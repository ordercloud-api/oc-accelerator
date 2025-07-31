# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Working locally
1. Running the accelerator from the /infrastructure directory generates `.env.local` files for the admin and storefront applications.  Verify your admin `.env.local` contians the following variables:

```bash
VITE_APP_ORDERCLOUD_BASE_API_URL="https://sandboxapi.ordercloud.io"
VITE_APP_ORDERCLOUD_CLIENT_ID="********-****-****-****-************"
VITE_APP_NAME="OrderCloud Admin Application"
VITE_APP_ORDERCLOUD_ALLOW_ANONYMOUS=true
VITE_APP_ORDERCLOUD_OPENIDCONNECT_ENABLED=false
VITE_APP_ORDERCLOUD_OPENIDCONNECT_CONFIG_ID=
VITE_APP_ORDERCLOUD_OPENIDCONNECT_ACCESS_TOKEN_QUERY_PARAM_NAME=
VITE_APP_ORDERCLOUD_OPENIDCONNECT_REFRESH_TOKEN_QUERY_PARAM_NAME=
VITE_APP_ORDERCLOUD_OPENIDCONNECT_IDP_ACCESS_TOKEN_QUERY_PARAM_NAME=
```

| Variable                                                              | Description                                                                                                                                                                                                                                                                              |
|-----------------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `VITE_APP_ORDERCLOUD_BASE_API_URL`                                    | Base OrderCloud API URL                                                                                                                                                                                                                                                                  |
| `VITE_APP_ORDERCLOUD_CLIENT_ID`                                       | Buyer Client ID                                                                                                                                                                                                                                                                          |
| `VITE_APP_NAME`                                                       | Name of the application title                                                                                                                                                                                                                                                            |
| `VITE_APP_ORDERCLOUD_OPENIDCONNECT_ENABLED`                           | Set to `true` to activate single-sign-on via OpenIDConnect in your application                                                                                                                                                                                                           |
| `VITE_APP_ORDERCLOUD_OPENIDCONNECT_CONFIG_ID`                         | The ID of the [OpenID connect configuration](https://ordercloud.io/api-reference/authentication-and-authorization/open-id-connects/create) that should be targeted for authentication                                                                                                    |
| `VITE_APP_ORDERCLOUD_OPENIDCONNECT_ACCESS_TOKEN_QUERY_PARAM_NAME`     | Query parameter name where the OrderCloud access token is stored after login. For example, if [AppStartUrl](https://ordercloud.io/api-reference/authentication-and-authorization/open-id-connects/create) is `https://my-application.com/login?token={0}`, use `token`                   |
| `VITE_APP_ORDERCLOUD_OPENIDCONNECT_REFRESH_TOKEN_QUERY_PARAM_NAME`    | (Optional) Query parameter name for the refresh token after login. Example: if [AppStartUrl](https://ordercloud.io/api-reference/authentication-and-authorization/open-id-connects/create) is `https://my-application.com/login?token={0}&refresh={3}`, use `refresh`                    |
| `VITE_APP_ORDERCLOUD_OPENIDCONNECT_IDP_ACCESS_TOKEN_QUERY_PARAM_NAME` | (Optional) Query parameter name for the identity provider access token after login. Example: if [AppStartUrl](https://ordercloud.io/api-reference/authentication-and-authorization/open-id-connects/create) is `https://my-application.com/login?token={0}&idptoken={1}`, use `idptoken` |



2. Run Vite in development mode
```bash
npm install
npm run dev
```

Your app should be up and running on [http://localhost:3001](http://localhost:3001)!

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
export default {
  // other rules...
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },
}
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
