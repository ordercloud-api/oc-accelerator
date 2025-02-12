import { IndexRouteObject, NonIndexRouteObject } from 'react-router-dom'
import ResourceList from '../components/ResourceList/ResourceList'
import { ResourceDetailWithParams } from '../components/ResourceDetail/ResourceDetail'
import AssignmentList from '../components/AssignmentList/AssignmentList'
import ResourceAssignment from '../components/ResourceAssignment/ResourceAssignment'

interface IndexResourceRoute extends IndexRouteObject {
  label?: string
  defaultParams?: { [key: string]: string }
  children: undefined
}

interface NonIndexResourceRoute extends NonIndexRouteObject {
  label?: string
  defaultParams?: { [key: string]: string }
  children?: ResourceRoute[]
}

export type ResourceRoute = IndexResourceRoute | NonIndexResourceRoute

export const resources: ResourceRoute[] = [
  {
    label: 'Admin Users',
    path: '/admin-users',
    element: <ResourceList resourceName="AdminUsers" />,
  },
  {
    path: '/admin-users/:userID',
    element: (
      <ResourceDetailWithParams
        resourceName="AdminUsers"
        navigationItemsWithParams={(params) => [
          {
            path: `/admin-users/${params.userID}`,
            label: 'Details',
          },
          {
            path: `/admin-users/${params.userID}/admin-user-groups`,
            label: 'User Groups',
          },
        ]}
      />
    ),
    children: [
      {
        path: `/admin-users/:userID/admin-user-groups`,
        element: (
          <ResourceAssignment
            fromResource="AdminUserGroups"
            toResource="AdminUsers"
            operationInclusion="User"
            reverseDirection={true}
          />
        ),
      },
    ],
  },
  {
    label: 'Admin User Groups',
    path: '/admin-user-groups',
    element: <ResourceList resourceName="AdminUserGroups" />,
  },
  {
    path: '/admin-user-groups/:userGroupID',
    element: (
      <ResourceDetailWithParams
        resourceName="AdminUserGroups"
        navigationItemsWithParams={(params) => [
          {
            path: `/admin-user-groups/${params.userGroupID}`,
            label: 'Details',
          },
          {
            path: `/admin-user-groups/${params.userGroupID}/admin-users`,
            label: 'Users',
          },
        ]}
      />
    ),
    children: [
      {
        path: `/admin-user-groups/:userGroupID/admin-users`,
        element: (
          <ResourceAssignment
            fromResource="AdminUsers"
            toResource="AdminUserGroups"
            operationInclusion="User"
            hideEditAction={true}
          />
        ),
      },
    ],
  },
  {
    label: 'Admin Addresses',
    path: '/admin-addresses',
    element: <ResourceList resourceName="AdminAddresses" />,
  },
  {
    label: 'Orders',
    defaultParams: { direction: 'Incoming' },
    path: '/orders/:direction',
    element: (
      <ResourceList
        key="OrderList"
        resourceName="Orders"
        readOnly={true}
      />
    ),
  },
  {
    path: '/orders/:direction/:orderID',
    element: (
      <ResourceDetailWithParams
        resourceName="Orders"
        readOnly={true}
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/orders/${params.direction}/${params.orderID}`,
          },
          {
            label: 'Line Items',
            path: `/orders/${params.direction}/${params.orderID}/line-items`,
          },
          {
            label: 'Promotions',
            path: `/orders/${params.direction}/${params.orderID}/promotions`,
          },
          {
            label: 'Approvers',
            path: `/orders/${params.direction}/${params.orderID}/approvers`,
          },
          {
            label: 'Approvals',
            path: `/orders/${params.direction}/${params.orderID}/approvals`,
          },
          {
            label: 'Payments',
            path: `/orders/${params.direction}/${params.orderID}/payments`,
          },
          {
            label: 'Shipments',
            path: `/orders/${params.direction}/${params.orderID}/shipments`,
          },
        ]}
      />
    ),
    children: [
      {
        path: `/orders/:direction/:orderID/line-items`,
        element: (
          <ResourceList
            resourceName="LineItems"
            readOnly={true}
          />
        ),
      },
      {
        path: `/orders/:direction/:orderID/promotions`,
        element: (
          <ResourceList
            resourceName="OrderPromotions"
            readOnly={true}
            hrefResolver={(promotion: any) => `/promotions/${promotion.ID}`}
          />
        ),
      },
      {
        path: `/orders/:direction/:orderID/approvers`,
        element: (
          <ResourceList
            resourceName="OrderApprovers"
            readOnly={true}
          />
        ),
      },
      {
        path: '/orders/:direction/:orderID/approvals',
        element: (
          <ResourceList
            resourceName="OrderApprovals"
            readOnly={true}
          />
        ),
      },
      {
        path: `/orders/:direction/:orderID/payments`,
        element: (
          <ResourceList
            resourceName="Payments"
            readOnly={true}
          />
        ),
      },
      {
        path: `/orders/:direction/:orderID/shipments`,
        element: (
          <ResourceList
            resourceName="OrderShipments"
            readOnly={true}
            hrefResolver={(shipment: any) => `/shipments/${shipment.ID}`}
          />
        ),
      },
    ],
  },
  {
    path: '/orders/:direction/:orderID/line-items/:lineItemID',
    element: (
      <ResourceDetailWithParams
        resourceName="LineItems"
        readOnly={true}
      />
    ),
  },
  {
    path: '/orders/:direction/:orderID/payments/:paymentID',
    element: (
      <ResourceDetailWithParams
        resourceName="Payments"
        readOnly={true}
      />
    ),
  },
  {
    label: 'Shipments',
    path: '/shipments',
    element: <ResourceList resourceName="Shipments" />,
  },
  {
    path: '/shipments/:shipmentID',
    element: (
      <ResourceDetailWithParams
        resourceName="Shipments"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/shipments/${params.shipmentID}`,
          },
          {
            label: 'Shipment Items',
            path: `/shipments/${params.shipmentID}/shipment-items`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/shipments/:shipmentID/shipment-items',
        element: <ResourceList resourceName="ShipmentItems" />,
      },
    ],
  },
  {
    label: 'Order Returns',
    path: '/order-returns',
    element: <ResourceList resourceName="OrderReturns" />,
  },
  {
    path: '/order-returns/:returnID',
    element: <ResourceDetailWithParams resourceName="OrderReturns" />,
  },
  {
    label: 'Products',
    path: '/products',
    element: (
      <ResourceList
        key="ProductsList"
        resourceName="Products"
      />
    ),
  },
  {
    path: '/products/:productID',
    element: (
      <ResourceDetailWithParams
        resourceName="Products"
        navigationItemsWithParams={(params) => [
          {
            path: `/products/${params.productID}`,
            label: 'Details',
          },
          {
            label: 'Specs',
            path: `/products/${params.productID}/specs`,
          },
          {
            label: 'Inventory Records',
            path: `/products/${params.productID}/inventory-records`,
          },
          {
            label: 'Bundles',
            path: `/products/${params.productID}/bundles`,
          },
          {
            label: 'Catalogs',
            path: `/products/${params.productID}/catalogs`,
          },
          {
            label: 'Categories',
            path: `/products/${params.productID}/categories`,
          },
          {
            label: 'Assignments',
            path: `/products/${params.productID}/assignments`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/products/:productID/assignments',
        element: <AssignmentList resourceName="Products" />,
      },
      {
        path: '/products/:productID/catalogs',
        element: (
          <ResourceAssignment
            toResource="Products"
            fromResource="Catalogs"
            operationInclusion="Product"
            reverseDirection={true}
            hideEditAction={true}
          />
        ),
      },
      {
        path: '/products/:productID/inventory-records',
        element: <ResourceList resourceName="InventoryRecords" />,
      },
      {
        path: '/products/:productID/inventory-records/:inventoryRecordID',
        element: (
          <ResourceDetailWithParams
            resourceName="InventoryRecords"
            navigationItemsWithParams={(params) => [
              {
                label: 'Details',
                path: `/products/${params.productID}/inventory-records/${params.inventoryRecordID}`,
              },
              {
                label: 'Buyers',
                path: `/products/${params.productID}/inventory-records/${params.inventoryRecordID}/buyers`,
              },
            ]}
          />
        ),
        children: [
          {
            path: '/products/:productID/inventory-records/:inventoryRecordID/buyers',
            element: (
              <ResourceAssignment
                fromResource="Buyers"
                toResource="InventoryRecords"
                fieldsToHide={['UserGroupID']}
                hideEditAction={true}
              />
            ),
          },
        ],
      },
      {
        path: '/products/:productID/bundles',
        element: (
          <ResourceAssignment
            fromResource="Bundles"
            toResource="Products"
            reverseDirection={true}
            hideEditAction={true}
            operationInclusion="Product"
          />
        ),
      },
      {
        path: '/products/:productID/categories',
        element: (
          <ResourceAssignment
            filters={{ depth: 'all' }}
            switcherIdKey="catalogID"
            switcherResourceName="Catalogs"
            fromResource="Categories"
            toResource="Products"
            reverseDirection={true}
            hrefOverride="/catalogs/:catalogID/categories"
            operationInclusion="Product"
          />
        ),
      },
      {
        path: '/products/:productID/specs',
        element: (
          <ResourceAssignment
            fromResource="Specs"
            toResource="Products"
            reverseDirection={true}
            operationInclusion="Product"
          />
        ),
      },
    ],
  },
  {
    path: '/price-schedules',
    element: <ResourceList resourceName="PriceSchedules" />,
    label: 'Price Schedules',
  },
  {
    path: '/price-schedules/:priceScheduleID',
    element: (
      <ResourceDetailWithParams
        navigationItemsWithParams={(params) => [
          {
            path: `/price-schedules/${params.priceScheduleID}`,
            label: 'Details',
          },
          {
            path: `/price-schedules/${params.priceScheduleID}/assignments`,
            label: 'Assignments',
          },
        ]}
        resourceName="PriceSchedules"
      />
    ),
    children: [
      {
        path: '/price-schedules/:priceScheduleID/assignments',
        element: (
          <AssignmentList
            resourceName="Products"
            primaryAssignmentKey="PriceScheduleID"
          />
        ),
      },
    ],
  },
  {
    path: '/specs',
    label: 'Specs',
    element: <ResourceList resourceName="Specs" />,
  },
  {
    path: '/specs/:specID',
    element: (
      <ResourceDetailWithParams
        resourceName="Specs"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/specs/${params.specID}`,
          },
          {
            label: 'Options',
            path: `/specs/${params.specID}/options`,
          },
          {
            label: 'Products',
            path: `/specs/${params.specID}/products`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/specs/:specID/options',
        element: <ResourceList resourceName="SpecOptions" />,
      },
      {
        path: '/specs/:specID/products',
        element: (
          <ResourceAssignment
            fromResource="Products"
            toResource="Specs"
            operationInclusion="Product"
          />
        ),
      },
    ],
  },
  {
    path: '/specs/:specID/options/:optionID',
    element: <ResourceDetailWithParams resourceName="SpecOptions" />,
  },
  {
    path: '/product-facets',
    element: <ResourceList resourceName="ProductFacets" />,
  },
  {
    path: '/product-facets/:productFacetID',
    element: <ResourceDetailWithParams resourceName="ProductFacets" />,
  },
  {
    path: '/promotions',
    element: <ResourceList resourceName="Promotions" />,
    label: 'Promotions',
  },
  {
    path: '/promotions/:promotionID',
    element: (
      <ResourceDetailWithParams
        resourceName="Promotions"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/promotions/${params.promotionID}`,
          },
          {
            label: 'Buyers',
            path: `/promotions/${params.promotionID}/buyers`,
          },
          {
            label: 'User Groups',
            path: `/promotions/${params.promotionID}/user-groups`,
          },
        ]}
      />
    ),
    children: [
      {
        path: `/promotions/:promotionID/buyers`,
        element: (
          <ResourceAssignment
            fromResource="Buyers"
            toResource="Promotions"
            fieldsToHide={['UserGroupID']}
            hideEditAction={true}
          />
        ),
      },
      {
        path: `/promotions/:promotionID/user-groups`,
        element: (
          <ResourceAssignment
            fromResource="UserGroups"
            toResource="Promotions"
            level="Group"
            switcherResourceName="Buyers"
            switcherIdKey="buyerID"
          />
        ),
      },
    ],
  },
  {
    label: 'Suppliers',
    path: '/suppliers',
    element: <ResourceList resourceName="Suppliers" />,
  },
  {
    path: '/suppliers/:supplierID',
    element: (
      <ResourceDetailWithParams
        resourceName="Suppliers"
        navigationItemsWithParams={(params) => [
          {
            path: `/suppliers/${params.supplierID}`,
            label: 'Details',
          },
          {
            path: `/suppliers/${params.supplierID}/user-groups`,
            label: 'User Groups',
          },
          {
            path: `/suppliers/${params.supplierID}/users`,
            label: 'Users',
          },
          {
            path: `/suppliers/${params.supplierID}/addresses`,
            label: 'Addresses',
          },
        ]}
      />
    ),
    children: [
      {
        path: '/suppliers/:supplierID/user-groups',
        element: <ResourceList resourceName="SupplierUserGroups" />,
      },
      {
        path: '/suppliers/:supplierID/users',
        element: <ResourceList resourceName="SupplierUsers" />,
      },
      {
        path: '/suppliers/:supplierID/addresses',
        element: <ResourceList resourceName="SupplierAddresses" />,
      },
    ],
  },
  {
    path: '/suppliers/:supplierID/users',
    element: <ResourceList resourceName="SupplierUsers" />,
  },
  {
    path: '/suppliers/:supplierID/users/:userID',
    element: (
      <ResourceDetailWithParams
        resourceName="SupplierUsers"
        navigationItemsWithParams={(params) => [
          {
            path: `/suppliers/${params.supplierID}/users/${params.userID}`,
            label: 'Details',
          },
          {
            path: `/suppliers/${params.supplierID}/users/${params.userID}/users-groups`,
            label: 'User Groups',
          },
        ]}
      />
    ),
    children: [
      {
        path: '/suppliers/:supplierID/users/:userID',
        element: <ResourceDetailWithParams resourceName="SupplierUsers" />,
      },
      {
        path: `/suppliers/:supplierID/users/:userID/users-groups`,
        element: (
          <ResourceAssignment
            fromResource="SupplierUserGroups"
            toResource="SupplierUsers"
            operationInclusion="User"
            reverseDirection={true}
            hideEditAction={true}
          />
        ),
      },
    ],
  },
  {
    path: '/suppliers/:supplierID/addresses/:addressID',
    element: <ResourceDetailWithParams resourceName="SupplierAddresses" />,
  },
  {
    path: '/suppliers/:supplierID/user-groups/:userGroupID',
    element: (
      <ResourceDetailWithParams
        resourceName="SupplierUserGroups"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/suppliers/${params.supplierID}/user-groups/${params.userGroupID}`,
          },
          {
            label: 'Users',
            path: `/suppliers/${params.supplierID}/user-groups/${params.userGroupID}/users`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/suppliers/:supplierID/user-groups/:userGroupID/users',
        element: (
          <ResourceAssignment
            fromResource="SupplierUsers"
            toResource="SupplierUserGroups"
            operationInclusion="User"
            hideEditAction={true}
          />
        ),
      },
    ],
  },
  {
    label: 'Catalogs',
    path: '/catalogs',
    element: <ResourceList resourceName="Catalogs" />,
  },
  {
    path: '/catalogs/:catalogID',
    element: (
      <ResourceDetailWithParams
        resourceName="Catalogs"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/catalogs/${params.catalogID}`,
          },
          {
            label: 'Categories',
            path: `/catalogs/${params.catalogID}/categories`,
          },
          {
            label: 'Buyers',
            path: `/catalogs/${params.catalogID}/buyers`,
          },
          {
            label: 'Products',
            path: `/catalogs/${params.catalogID}/products`,
          },
          {
            label: 'Bundles',
            path: `/catalogs/${params.catalogID}/bundles`,
          },
        ]}
      />
    ),
    children: [
      {
        path: `/catalogs/:catalogID/categories`,
        element: (
          <ResourceList
            resourceName="Categories"
            filters={{ depth: 'all' }}
          />
        ),
      },
      {
        path: '/catalogs/:catalogID/buyers',
        element: (
          <ResourceAssignment
            fromResource="Buyers"
            toResource="Catalogs"
          />
        ),
      },
      {
        path: '/catalogs/:catalogID/products',
        element: (
          <ResourceAssignment
            fromResource="Products"
            toResource="Catalogs"
            operationInclusion="Product"
          />
        ),
      },
      {
        path: '/catalogs/:catalogID/bundles',
        element: (
          <ResourceAssignment
            fromResource="Bundles"
            toResource="Catalogs"
            operationInclusion="Bundle"
          />
        ),
      },
    ],
  },
  {
    path: `/catalogs/:catalogID/categories/:categoryID`,
    element: (
      <ResourceDetailWithParams
        resourceName="Categories"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/catalogs/${params.catalogID}/categories/${params.categoryID}`,
          },
          {
            label: 'Buyers',
            path: `/catalogs/${params.catalogID}/categories/${params.categoryID}/buyers`,
          },
          {
            label: 'User Groups',
            path: `/catalogs/${params.catalogID}/categories/${params.categoryID}/user-groups`,
          },
          {
            label: 'Products',
            path: `/catalogs/${params.catalogID}/categories/${params.categoryID}/products`,
          },
          {
            label: 'Bundles',
            path: `/catalogs/${params.catalogID}/categories/${params.categoryID}/bundles`,
          },
        ]}
      />
    ),
    children: [
      {
        path: `/catalogs/:catalogID/categories/:categoryID/buyers`,
        element: (
          <ResourceAssignment
            fromResource="Buyers"
            toResource="Categories"
            level="Company"
            fieldsToHide={['UserGroupID']}
          />
        ),
      },
      {
        path: `/catalogs/:catalogID/categories/:categoryID/user-groups`,
        element: (
          <ResourceAssignment
            fromResource="UserGroups"
            toResource="Categories"
            level="Group"
            switcherResourceName="Buyers"
            switcherIdKey="buyerID"
          />
        ),
      },
      {
        path: `/catalogs/:catalogID/categories/:categoryID/products`,
        element: (
          <ResourceAssignment
            fromResource="Products"
            toResource="Categories"
            operationInclusion="Product"
          />
        ),
      },
      {
        path: `/catalogs/:catalogID/categories/:categoryID/bundles`,
        element: (
          <ResourceAssignment
            fromResource="Bundles"
            toResource="Categories"
            operationInclusion="Bundle"
          />
        ),
      },
    ],
  },
  {
    path: '/bundles',
    element: <ResourceList resourceName="Bundles" />,
  },
  {
    path: '/bundles/:bundleID',
    element: (
      <ResourceDetailWithParams
        resourceName="Bundles"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/bundles/${params.bundleID}`,
          },
          {
            label: 'Products',
            path: `/bundles/${params.bundleID}/products`,
          },
          {
            label: 'Catalog',
            path: `/bundles/${params.bundleID}/catalog`,
          },
          {
            label: 'Categories',
            path: `/bundles/${params.bundleID}/categories`,
          },
          {
            label: 'Assignments',
            path: `/bundles/${params.bundleID}/assignments`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/bundles/:bundleID/products',
        element: (
          <ResourceAssignment
            fromResource="Products"
            toResource="Bundles"
            operationInclusion="Product"
            hideEditAction={true}
          />
        ),
      },
      {
        path: '/bundles/:bundleID/catalog',
        element: (
          <ResourceAssignment
            fromResource="Catalogs"
            toResource="Bundles"
            operationInclusion="Product"
            reverseDirection={true}
          />
        ),
      },
      {
        path: '/bundles/:bundleID/categories',
        element: (
          <ResourceAssignment
            fromResource="Categories"
            toResource="Bundles"
            operationInclusion="Bundle"
            reverseDirection={true}
            switcherIdKey="catalogID"
            switcherResourceName="Catalogs"
            hrefOverride="/catalogs/:catalogID/categories"
          />
        ),
      },
      {
        path: '/bundles/:bundleID/assignments',
        element: <AssignmentList resourceName="Bundles" />,
      },
    ],
  },
  {
    path: '/locales/:localeID',
    element: (
      <ResourceDetailWithParams
        resourceName="Locales"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/locales/${params.localeID}`,
          },
          {
            label: 'Buyers',
            path: `/locales/${params.localeID}/buyers`,
          },
          {
            label: 'User Groups',
            path: `/locales/${params.localeID}/user-groups`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/locales/:localeID/buyers',
        element: (
          <ResourceAssignment
            toResource="Locales"
            fromResource="Buyers"
            fieldsToHide={['UserGroupID']}
            level="Company"
            hideEditAction={true}
          />
        ),
      },
      {
        path: '/locales/:localeID/user-groups',
        element: (
          <ResourceAssignment
            toResource="Locales"
            fromResource="UserGroups"
            hrefOverride="/buyers/:buyerID/user-groups"
            level="Group"
            switcherResourceName="Buyers"
            switcherIdKey="buyerID"
          />
        ),
      },
    ],
  },
  {
    label: 'Buyers',
    path: '/buyers',
    element: <ResourceList resourceName="Buyers" />,
  },
  {
    path: '/buyers/:buyerID',
    element: (
      <ResourceDetailWithParams
        resourceName="Buyers"
        navigationItemsWithParams={(params) => [
          {
            path: `/buyers/${params.buyerID}`,
            label: 'Details',
          },
          {
            path: `/buyers/${params.buyerID}/user-groups`,
            label: 'User Groups',
          },
          {
            path: `/buyers/${params.buyerID}/users`,
            label: 'Users',
          },
          {
            path: `/buyers/${params.buyerID}/addresses`,
            label: 'Addresses',
          },
          {
            path: `/buyers/${params.buyerID}/catalogs`,
            label: 'Catalogs',
          },
          {
            path: `/buyers/${params.buyerID}/categories`,
            label: 'Categories',
          },
          {
            path: `/buyers/${params.buyerID}/cost-centers`,
            label: 'Cost Centers',
          },
          {
            path: `/buyers/${params.buyerID}/credit-cards`,
            label: 'Credit Cards',
          },
          {
            path: `/buyers/${params.buyerID}/spending-accounts`,
            label: 'Spending Accounts',
          },
          {
            path: `/buyers/${params.buyerID}/locales`,
            label: 'Locales',
          },
          {
            path: `/buyers/${params.buyerID}/promotions`,
            label: 'Promotions',
          },
          {
            path: `/buyers/${params.buyerID}/approval-rules`,
            label: 'Approval Rules',
          },
        ]}
      />
    ),
    children: [
      {
        path: '/buyers/:buyerID/users',
        element: <ResourceList resourceName="Users" />,
      },
      {
        path: '/buyers/:buyerID/addresses',
        element: <ResourceList resourceName="Addresses" />,
      },
      {
        path: '/buyers/:buyerID/catalogs',
        element: (
          <ResourceAssignment
            toResource="Buyers"
            fromResource="Catalogs"
            reverseDirection={true}
          />
        ),
      },
      {
        path: '/buyers/:buyerID/categories',
        element: (
          <ResourceAssignment
            toResource="Buyers"
            fromResource="Categories"
            reverseDirection={true}
            hrefOverride="/catalogs/:catalogID/categories"
            switcherIdKey="catalogID"
            switcherResourceName="Catalogs"
          />
        ),
      },
      {
        path: '/buyers/:buyerID/cost-centers',
        element: <ResourceList resourceName="CostCenters" />,
      },
      {
        path: '/buyers/:buyerID/credit-cards',
        element: <ResourceList resourceName="CreditCards" />,
      },
      {
        path: '/buyers/:buyerID/user-groups',
        element: <ResourceList resourceName="UserGroups" />,
      },
      {
        path: '/buyers/:buyerID/spending-accounts',
        element: <ResourceList resourceName="SpendingAccounts" />,
      },
      {
        path: '/buyers/:buyerID/locales',
        element: (
          <ResourceAssignment
            toResource="Buyers"
            fromResource="Locales"
            reverseDirection={true}
            fieldsToHide={['UserGroupID']}
          />
        ),
      },
      {
        path: '/buyers/:buyerID/promotions',
        element: (
          <ResourceAssignment
            toResource="Buyers"
            fromResource="Promotions"
            reverseDirection={true}
            fieldsToHide={['UserGroupID']}
            level="Company"
            hideEditAction={true}
          />
        ),
      },
      {
        path: '/buyers/:buyerID/approval-rules',
        element: <ResourceList resourceName="ApprovalRules" />,
      },
    ],
  },
  {
    path: '/buyers/:buyerID/addresses/:addressID',
    element: (
      <ResourceDetailWithParams
        resourceName="Addresses"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/buyers/${params.buyerID}/addresses/${params.addressID}`,
          },
          {
            label: 'Company',
            path: `/buyers/${params.buyerID}/addresses/${params.addressID}/company`,
          },
          {
            label: 'User Groups',
            path: `/buyers/${params.buyerID}/addresses/${params.addressID}/user-groups`,
          },
          {
            label: 'Users',
            path: `/buyers/${params.buyerID}/addresses/${params.addressID}/users`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/buyers/:buyerID/addresses/:addressID/company',
        element: (
          <ResourceAssignment
            toResource="Addresses"
            fromResource="Buyers"
            level="Company"
            fieldsToHide={['UserGroupID', 'UserID']}
            directCompanyLevelAssignment={true}
          />
        ),
      },
      {
        path: '/buyers/:buyerID/addresses/:addressID/user-groups',
        element: (
          <ResourceAssignment
            toResource="Addresses"
            fromResource="UserGroups"
            level="Group"
            fieldsToHide={['BuyerID', 'UserID']}
            hrefOverride="/buyers/:buyerID/user-groups"
          />
        ),
      },
      {
        path: '/buyers/:buyerID/addresses/:addressID/users',
        element: (
          <ResourceAssignment
            toResource="Addresses"
            fromResource="Users"
            level="User"
            fieldsToHide={['UserGroupID']}
            hrefOverride="/buyers/:buyerID/users"
          />
        ),
      },
    ],
  },
  {
    path: '/buyers/:buyerID/users/:userID',
    element: (
      <ResourceDetailWithParams
        resourceName="Users"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/buyers/${params.buyerID}/users/${params.userID}`,
          },
          {
            label: 'User Groups',
            path: `/buyers/${params.buyerID}/users/${params.userID}/user-groups`,
          },
        ]}
      />
    ),
    children: [
      {
        path: `/buyers/:buyerID/users/:userID/user-groups`,
        element: (
          <ResourceAssignment
            toResource="Users"
            fromResource="UserGroups"
            operationInclusion="User"
            hrefOverride="/buyers/:buyerID/user-groups"
            reverseDirection={true}
            hideEditAction={true}
          />
        ),
      },
    ],
  },
  {
    path: '/buyers/:buyerID/user-groups/:userGroupID',
    element: (
      <ResourceDetailWithParams
        resourceName="UserGroups"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/buyers/${params.buyerID}/user-groups/${params.userGroupID}`,
          },
          {
            label: 'Users',
            path: `/buyers/${params.buyerID}/user-groups/${params.userGroupID}/users`,
          },
          {
            label: 'Locales',
            path: `/buyers/${params.buyerID}/user-groups/${params.userGroupID}/locales`,
          },
          {
            label: 'Promotions',
            path: `/buyers/${params.buyerID}/user-groups/${params.userGroupID}/promotions`,
          },
          {
            label: 'Categories',
            path: `/buyers/${params.buyerID}/user-groups/${params.userGroupID}/categories`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/buyers/:buyerID/user-groups/:userGroupID/users',
        element: (
          <ResourceAssignment
            toResource="UserGroups"
            fromResource="Users"
            operationInclusion="User"
            hideEditAction={true}
            hrefOverride="/buyers/:buyerID/users"
          />
        ),
      },
      {
        path: '/buyers/:buyerID/user-groups/:userGroupID/locales',
        element: (
          <ResourceAssignment
            toResource="UserGroups"
            fromResource="Locales"
            hideEditAction={true}
            reverseDirection={true}
            fieldsToHide={['BuyerID']}
          />
        ),
      },
      {
        path: '/buyers/:buyerID/user-groups/:userGroupID/promotions',
        element: (
          <ResourceAssignment
            toResource="UserGroups"
            fromResource="Promotions"
            hideEditAction={true}
            reverseDirection={true}
            level="Group"
            fieldsToHide={['BuyerID']}
          />
        ),
      },
      {
        path: '/buyers/:buyerID/user-groups/:userGroupID/categories',
        element: (
          <ResourceAssignment
            toResource="UserGroups"
            fromResource="Categories"
            reverseDirection={true}
            hrefOverride="/buyers/:buyerID/user-groups/:userGroupID/categories"
            fieldsToHide={['BuyerID']}
            switcherIdKey="catalogID"
            switcherResourceName="Catalogs"
            additionalRequiredParams={['buyerID']}
          />
        ),
      },
    ],
  },
  {
    path: '/buyers/:buyerID/cost-centers/:costCenterID',
    element: (
      <ResourceDetailWithParams
        resourceName="CostCenters"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/buyers/${params.buyerID}/cost-centers/${params.costCenterID}`,
          },
          {
            label: 'Company',
            path: `/buyers/${params.buyerID}/cost-centers/${params.costCenterID}/company`,
          },
          {
            label: 'User Groups',
            path: `/buyers/${params.buyerID}/cost-centers/${params.costCenterID}/user-groups`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/buyers/:buyerID/cost-centers/:costCenterID/company',
        element: (
          <ResourceAssignment
            toResource="CostCenters"
            fromResource="Buyers"
            level="Company"
            fieldsToHide={['UserGroupID', 'UserID']}
            directCompanyLevelAssignment={true}
          />
        ),
      },
      {
        path: '/buyers/:buyerID/cost-centers/:costCenterID/user-groups',
        element: (
          <ResourceAssignment
            toResource="CostCenters"
            fromResource="Buyers"
            level="Group"
            fieldsToHide={['BuyerID', 'UserID']}
            hrefOverride="/buyers/:buyerID/user-groups"
          />
        ),
      },
    ],
  },
  {
    path: '/buyers/:buyerID/credit-cards/:creditCardID',
    element: (
      <ResourceDetailWithParams
        resourceName="CreditCards"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/buyers/${params.buyerID}/credit-cards/${params.creditCardID}`,
          },
          {
            label: 'Company',
            path: `/buyers/${params.buyerID}/credit-cards/${params.creditCardID}/company`,
          },
          {
            label: 'User Groups',
            path: `/buyers/${params.buyerID}/credit-cards/${params.creditCardID}/user-groups`,
          },
          {
            label: 'Users',
            path: `/buyers/${params.buyerID}/credit-cards/${params.creditCardID}/users`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/buyers/:buyerID/credit-cards/:creditCardID/company',
        element: (
          <ResourceAssignment
            toResource="CreditCards"
            fromResource="Buyers"
            level="Company"
            fieldsToHide={['UserGroupID', 'UserID']}
            directCompanyLevelAssignment={true}
          />
        ),
      },
      {
        path: '/buyers/:buyerID/credit-cards/:creditCardID/user-groups',
        element: (
          <ResourceAssignment
            toResource="CreditCards"
            fromResource="Buyers"
            level="Group"
            fieldsToHide={['BuyerID', 'UserID']}
            hrefOverride="/buyers/:buyerID/user-groups"
          />
        ),
      },
      {
        path: '/buyers/:buyerID/credit-cards/:creditCardID/users',
        element: (
          <ResourceAssignment
            toResource="CreditCards"
            fromResource="Buyers"
            level="User"
            fieldsToHide={['UserGroupID', 'UserID']}
            hrefOverride="/buyers/:buyerID/users"
          />
        ),
      },
    ],
  },
  {
    path: '/buyers/:buyerID/spending-accounts/:spendingAccountID',
    element: (
      <ResourceDetailWithParams
        resourceName="SpendingAccounts"
        navigationItemsWithParams={(params) => [
          {
            label: 'Details',
            path: `/buyers/${params.buyerID}/spending-accounts/${params.spendingAccountID}`,
          },
          {
            label: 'Company',
            path: `/buyers/${params.buyerID}/spending-accounts/${params.spendingAccountID}/company`,
          },
          {
            label: 'User Groups',
            path: `/buyers/${params.buyerID}/spending-accounts/${params.spendingAccountID}/user-groups`,
          },
          {
            label: 'Users',
            path: `/buyers/${params.buyerID}/spending-accounts/${params.spendingAccountID}/users`,
          },
        ]}
      />
    ),
    children: [
      {
        path: '/buyers/:buyerID/spending-accounts/:spendingAccountID/company',
        element: (
          <ResourceAssignment
            toResource="SpendingAccounts"
            fromResource="Buyers"
            level="Company"
            fieldsToHide={['UserGroupID', 'UserID']}
            directCompanyLevelAssignment={true}
          />
        ),
      },
      {
        path: '/buyers/:buyerID/spending-accounts/:spendingAccountID/user-groups',
        element: (
          <ResourceAssignment
            toResource="SpendingAccounts"
            fromResource="Buyers"
            level="Group"
            fieldsToHide={['BuyerID', 'UserID']}
            hrefOverride="/buyers/:buyerID/user-groups"
          />
        ),
      },
      {
        path: '/buyers/:buyerID/spending-accounts/:spendingAccountID/users',
        element: (
          <ResourceAssignment
            toResource="SpendingAccounts"
            fromResource="Buyers"
            level="User"
            fieldsToHide={['UserGroupID', 'UserID']}
            hrefOverride="/buyers/:buyerID/users"
          />
        ),
      },
    ],
  },
  {
    path: '/buyers/:buyerID/approval-rules/:approvalRuleID',
    element: <ResourceDetailWithParams resourceName="ApprovalRules" />,
  },
  {
    path: '/security-profiles',
    label: 'Security Profiles',
    element: <ResourceList resourceName="SecurityProfiles" />,
  },
  {
    path: '/security-profiles/:securityProfileID',
    element: (
      <ResourceDetailWithParams
        resourceName="SecurityProfiles"
        navigationItemsWithParams={(params) => [
          {
            path: `/security-profiles/${params.securityProfileID}`,
            label: 'Details',
          },
          {
            path: `/security-profiles/${params.securityProfileID}/assignments`,
            label: 'Assignments',
          },
        ]}
      />
    ),
    children: [
      {
        path: '/security-profiles/:securityProfileID/assignments',
        element: <AssignmentList resourceName="SecurityProfiles" />,
      },
    ],
  },
]
