import { RouteObject } from "react-router-dom";
import Layout from "./Layout/Layout";
import Dashboard from './components/Dashboard';
import { OrderSummary } from "./components/cart/OrderSummary";
import { ShoppingCart } from "./components/cart/ShoppingCart";
import CategoryList from "./components/category/CategoryList";
import ProductDetailWrapper from "./components/product/ProductDetailWrapper";
import ProductList from "./components/product/ProductList";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Layout />,
    children: [
      {
        path: "/",
        element: <Dashboard />,
      },
      {
        path: "/cart",
        element: <ShoppingCart />,
      },
      { path: "/order-summary", element: <OrderSummary /> },
      {
        path: "/products",
        element: <ProductList />,
      },
      {
        path: "/categories/:catalogId",
        element: <CategoryList />,
      },
      {
        path: "/product-list/:catalogId",
        element: <ProductList />,
      },
      {
        path: "/product-list/:catalogId/:categoryId",
        element: <ProductList />,
      },
      {
        path: "/products/:productId",
        element: <ProductDetailWrapper />,
      },
    ],
  },
];

export default routes;
