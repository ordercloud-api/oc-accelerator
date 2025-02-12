# OrderCloud Accelerator Admin

## What is Sitecore Commerce OrderCloud?
[OrderCloud](https://ordercloud.io/discover/platform-overview) is a B2B, B2C, B2X commerce and marketplace development platform.
OrderCloud delivers cloud-based, API-first, headless eCommerce architecture. Limitless customizations and endless freedom for growth to support your complete commerce strategy.

## What is the Accelerator Admin App?
An administrative application that provides simple and reusable components that dynamically generate resource list and detail views from the [OrderCloud OpenApi Spec](https://api.ordercloud.io/v1/openapi/v3). The OrderCloud SDK is also used to facilitate authentication and authorization.  The Accelerator Admin app uses similar patterns to the OrderCloud Portal and it was created to speed up the solution development process.  Technologies include:

* React
* Vite
* Typescript
* Chakra UI
* React Hook Form
* Tanstack React Query and React Table

## What you can do with this app?
Out of the box functionality for create, read, update, delete, and assignment actions on the following OrderCloud resources:

* Orders
* Shipments
* Order Returns
* Products
* Price Schedules
* Specs
* Promotions
* Admin Users
* Admin User Groups
* Suppliers
* Catalogs
* Categories
* Buyers
* Locales
* Users
* Groups
* Addresses
* Credit Cards
* Cost Centers
* Spending Accounts

## Features

### Resource List
Uses `ordercloud-react` hooks to generate column definitions for a reusable `@tanstack/react-table` DataTable component.  The data table will display cell values according to the data types defined in OrderCloud's Open API spec, as well as any marketplace specific xp definitions provided in the configuration.  The List View component contains:

* Search: A debounced search input for searching for a specific item using the OrderCloud API
* Filtering: A dynamic filter tool for filtering an OrderCloud list using property keys and operator/value comparisons.
* Sorting: Dynamic sorting for OrderCloud properties that are flagged as sortable by the OpenAPI specification.
* Pagination: List views automatically link the current list Meta data to a pagination component.
* Create Modals: List views will contain a “create” action which will open a create form in a modal.

### Resource Detail
Dynamically generates `react-hook-form` form controls from resource schemas defined in OrderCloud's Open API spec.  Includes out of the box validation with `Yup`. 

### Configuration and Overrides

#### Xp Schemas
Developers can optionally provide marketplace xp schemas under `src/config/xpSchemas/index.ts`.  Schema definitions are passed into the `OrderCloudProvider` for `ordercloud-react` and will flow through to the resource's tables and forms. All schemas must adhere to [Open API Specification](https://swagger.io/specification).    

#### Form and Table Overrides
Resource list and detail views will display all native properties on a resource by default. Developers can optionally provide overrides for the visibility, order, and names of these properties under the configuration files `src/config/formOverrides.ts` and `src/config/tableOverrides.ts`. The presence of a property indicates that it will be displayed in the order that is specified, and the name that is mapped to the property will be shown on either the form label (formOverrides) or column header (tableOverrides).
  

## Working locally
1. Running the accelerator from the /infrastructure directory generates `.env.local` files for the admin and storefront applications.  Verify your admin `.env.local` contians the following variables:

```bash
VITE_APP_ORDERCLOUD_BASE_API_URL="https://sandboxapi.ordercloud.io"
VITE_APP_ORDERCLOUD_CLIENT_ID="********-****-****-****-************"
VITE_APP_ORDERCLOUD_SCOPE="OrderAdmin ProductAdmin CatalogAdmin AdminUserAdmin AdminUserGroupAdmin SupplierAdmin BuyerAdmin"
VITE_APP_NAME="OrderCloud Admin Application"
```
| Variable                            | Description                                                                                                       |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `VITE_APP_ORDERCLOUD_BASE_API_URL`  | Base OrderCloud API URL                                          |
| `VITE_APP_ORDERCLOUD_CLIENT_ID`     | Admin Client ID                                                                                                   |
| `VITE_APP_ORDERCLOUD_SCOPE`         | The ID for your OrderCloud Marketplace                                                                            |
| `VITE_APP_NAME`                     | Name of the application title                                                                                     |

2. Run Vite in development mode
```bash
npm install
npm run dev
```

Your app should be up and running on [http://localhost:3000](http://localhost:3000)!

## Roadmap

Milestone 2 will expand OrderCloud API coverage and add assignment functionality.

## References
- [OrderCloud Javascript SDK](https://www.npmjs.com/package/ordercloud-javascript-sdk)
- [OrderCloud React SDK](https://www.npmjs.com/package/@ordercloud/react-sdk)
- [OrderCloud API Reference](https://ordercloud.io/api-reference)
- [React Hook Form](https://react-hook-form.com/)
- [Tanstack React Table](https://tanstack.com/table)
- [Tanstack React Query](https://tanstack.com/query)
- [Vite Documentation](https://vitejs.dev/)
- [Chakra UI](https://chakra-ui.com)
- [TypeScript](https://www.typescriptlang.org)