import { RouteObject } from 'react-router-dom'
import { resources } from './resources'
import { omit } from 'lodash'
import { NotFoundPage } from '../404'
import Dashboard from '../components/Dashboard/Dashboard'
import Layout from '../components/Layout/Layout'

const resourceRoutes: RouteObject[] = resources.map((r) => omit(r, 'label') as RouteObject)

const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Dashboard />,
      },
      ...resourceRoutes,
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]

export default routes
