import { FC, useCallback } from "react";
import routes from "./routes";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import { IOrderCloudErrorContext, OrderCloudProvider } from "@ordercloud/react-sdk";
import {
  ALLOW_ANONYMOUS,
  BASE_API_URL,
  CLIENT_ID,
  IS_AUTO_APPLY,
  OPENID_CONNECT_CONFIG_ID,
  OPENID_CONNECT_ENABLED,
  OPENIDCONNECT_ACCESS_TOKEN_QUERY_PARAM_NAME,
  OPENIDCONNECT_IDP_ACCESS_TOKEN_QUERY_PARAM_NAME,
  OPENIDCONNECT_REFRESH_TOKEN_QUERY_PARAM_NAME
} from "./constants";
import { useToast } from "@chakra-ui/react";
import { OrderCloudError } from "ordercloud-javascript-sdk";
import GlobalLoadingIndicator from "./components/GlobalLoadingIndicator";

const basename = import.meta.env.VITE_APP_CONFIG_BASE;

const router = createBrowserRouter(routes, { basename });

const AppProvider: FC = () => {
  const toast = useToast();

  const defaultErrorHandler = useCallback((error: OrderCloudError, {logout}:IOrderCloudErrorContext) => {
    if (error.status === 401) {
      console.log('DEFAULT ERROR HANDLER', 401)
      return logout()
    }
    if (!toast.isActive(error.errorCode)) {
      toast({ id: error.errorCode, title: error.status === 403 ? 'Permission denied' : error.message, status: "error" });
    }
  }, [toast])

  return (
    <OrderCloudProvider
      baseApiUrl={BASE_API_URL}
      clientId={CLIENT_ID}
      scope={[]}
      customScope={[]}
      allowAnonymous={ALLOW_ANONYMOUS}
      autoApplyPromotions={IS_AUTO_APPLY}
      defaultErrorHandler={defaultErrorHandler}
      openIdConnect={{
        enabled: OPENID_CONNECT_ENABLED,
        autoRedirect: true,
        configs: [{ id: OPENID_CONNECT_CONFIG_ID}],
        accessTokenQueryParamName: OPENIDCONNECT_ACCESS_TOKEN_QUERY_PARAM_NAME,
        refreshTokenQueryParamName: OPENIDCONNECT_REFRESH_TOKEN_QUERY_PARAM_NAME,
        idpAccessTokenQueryParamName: OPENIDCONNECT_IDP_ACCESS_TOKEN_QUERY_PARAM_NAME
      }}
    >
      <RouterProvider router={router} />
      <GlobalLoadingIndicator/>
    </OrderCloudProvider>
  );
};

export default AppProvider;
