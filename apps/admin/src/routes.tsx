import { RouteObject } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import Layout from "./components/Layout";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
    ],
  },
];

export default routes;
