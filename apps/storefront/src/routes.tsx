import { Link } from "@chakra-ui/react";
import startCase from "lodash/startCase";
import { RouteObject, Link as RouterLink } from "react-router-dom";
import Layout from "./Layout/Layout";
import Dashboard from "./components/Dashboard";
import OrderConfirmation from "./components/cart/OrderConfirmation";
import { ShoppingCart } from "./components/cart/ShoppingCart";
import CategoryList from "./components/category/CategoryList";
import ProductDetailWrapper from "./components/product/ProductDetailWrapper";
import ProductList from "./components/product/ProductList";

interface Params {
  catalogId?: string;
  categoryId?: string;
  productId?: string;
}

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
        path: "cart",
        element: <ShoppingCart />,
        handle: {
          crumb: () => (
            <Link as={RouterLink} to="/card">
              Cart
            </Link>
          ),
        },
      },
      {
        path: "order-confirmation",
        element: <OrderConfirmation />,
        handle: {
          crumb: () => <span>Order Confirmation</span>,
        },
      },
      {
        path: "shop",
        handle: {
          crumb: () => (
            <Link as={RouterLink} to="/shop">
              Shop
            </Link>
          ),
        },
        children: [
          {
            index: true,
            element: <ProductList />,
          },
          {
            path: ":catalogId",
            handle: {
              crumb: ({ params }: { params: Params }) => (
                <Link as={RouterLink} to={`/shop/${params.catalogId}`}>
                  {startCase(params.catalogId)}
                </Link>
              ),
            },
            children: [
              {
                index: true,
                element: <ProductList />,
              },
              {
                path: "categories",
                handle: {
                  crumb: ({ params }: { params: Params }) => (
                    <Link
                      as={RouterLink}
                      to={`/shop/${params.catalogId}/categories`}
                    >
                      Categories
                    </Link>
                  ),
                },
                children: [
                  {
                    index: true,
                    element: <CategoryList />,
                  },
                  {
                    path: ":categoryId",
                    handle: {
                      crumb: ({ params }: { params: Params }) => (
                        <Link
                          as={RouterLink}
                          to={`/shop/${params.catalogId}/categories/${params.categoryId}`}
                        >
                          {startCase(params.categoryId)}
                        </Link>
                      ),
                    },
                    children: [
                      {
                        index: true,
                        element: <ProductList />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "products/:productId",
        element: <ProductDetailWrapper />,
      },
    ],
  },
];

export default routes;
