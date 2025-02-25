import { FC, useCallback } from 'react'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import { IOrderCloudErrorContext, OrderCloudProvider } from '@ordercloud/react-sdk'
import {
  ALLOW_ANONYMOUS,
  BASE_API_URL,
  CLIENT_ID,
} from '../constants/constants'
import { useToast } from '@chakra-ui/react'
import { OrderCloudError } from 'ordercloud-javascript-sdk'
import GlobalLoadingIndicator from '../components/Shared/GlobalLoadingIndicator'
import { schemaObject } from '../config/xpSchemas'
import routes from '../routes'

const basename = import.meta.env.VITE_APP_CONFIG_BASE

const router = createBrowserRouter(routes, { basename })

const AppProvider: FC = () => {
  const toast = useToast()

  const defaultErrorHandler = useCallback(
    (error: OrderCloudError, { logout }: IOrderCloudErrorContext) => {
      if (error.status === 401) {
        console.log('DEFAULT ERROR HANDLER', 401)
        return logout()
      }
      if (!toast.isActive(error.errorCode)) {
        toast({
          id: error.errorCode,
          title: error.status === 403 ? 'Permission denied' : error.message,
          status: 'error',
        })
      }
    },
    [toast]
  )

  return (
    <OrderCloudProvider
      baseApiUrl={BASE_API_URL}
      clientId={CLIENT_ID}
      scope={[]}
      customScope={[]}
      allowAnonymous={ALLOW_ANONYMOUS}
      defaultErrorHandler={defaultErrorHandler}
      xpSchemas={schemaObject}
    >
      <RouterProvider router={router} />
      <GlobalLoadingIndicator />
    </OrderCloudProvider>
  )
}

export default AppProvider
