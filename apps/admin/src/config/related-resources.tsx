import { AddressTemplate } from '../components/OperationForm/Controls/related-resource-control/templates/AddressTemplate'
import { DefaultTemplate } from '../components/OperationForm/Controls/related-resource-control/templates/DefaultTemplate'
import { LocaleTemplate } from '../components/OperationForm/Controls/related-resource-control/templates/LocaleTemplate'
import { PriceScheduleTemplate } from '../components/OperationForm/Controls/related-resource-control/templates/PriceScheduleTemplate'
import { SpecOptionTemplate } from '../components/OperationForm/Controls/related-resource-control/templates/SpecOptionTemplate'
import { UserTemplate } from '../components/OperationForm/Controls/related-resource-control/templates/UserTemplate'
import { ReactNode } from 'react'

export interface IRelatedOpData {
  dependencies?: Array<string | null>
  operationInfo(dependencies?: Array<string | null>): {
    pauseOperation?: boolean
    operationId: string
    parameters?: {
      [key: string]: string
    }
    filters?: {
      [key: string]: string
    }
  }
  renderItem(result: any): ReactNode
}

// Generally items that do not have dependencies can be shared

const CatalogID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'Catalogs.List' }),
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const ProductID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'Products.List' }),
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const BundleID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'Bundles.List' }),
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const LocaleID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'Locales.List' }),
  renderItem: (result: any) => <LocaleTemplate result={result} />,
}

const PromotionID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'Promotions.List' }),
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const CategoryID: IRelatedOpData = {
  dependencies: ['body.CatalogID', 'parameters.catalogID'],
  operationInfo: (dependencies) => {
    const catalogID = dependencies![0]! || dependencies![1]!
    return {
      pauseOperation: !catalogID,
      operationId: 'Categories.List',
      parameters: { catalogID },
      filters: { depth: 'all' },
    }
  },
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const FromUserID: IRelatedOpData = {
  dependencies: ['body.FromCompanyID'],
  operationInfo: (dependencies) => {
    const buyerID = dependencies![0]!
    return {
      pauseOperation: !buyerID,
      operationId: 'Users.List',
      parameters: { buyerID: dependencies![0]! },
    }
  },
  renderItem: (result: any) => <UserTemplate result={result} />,
}

const FromCompanyID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'Buyers.List' }),
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const ToCompanyID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'Suppliers.List' }),
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const AddressID: IRelatedOpData = {
  dependencies: ['body.BuyerID', 'parameters.buyerID'],
  operationInfo: (dependencies) => {
    const buyerID = dependencies![0]! || dependencies![1]!
    return {
      operationId: 'Addresses.List',
      parameters: {
        buyerID,
      },
    }
  },
  renderItem: (result: any) => <AddressTemplate result={result} />,
}

const BuyerID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'Buyers.List' }),
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const SupplierID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'Suppliers.List' }),
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const AdminUserGroupID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'AdminUserGroups.List' }),
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const AdminUserID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'AdminUsers.List' }),
  renderItem: (result: any) => <UserTemplate result={result} />,
}

const BuyerUserGroupID: IRelatedOpData = {
  dependencies: ['body.BuyerID', 'parameters.buyerID'],
  operationInfo: (dependencies) => {
    const buyerID = dependencies![1]! || dependencies![0]!
    return {
      pauseOperation: !buyerID,
      operationId: 'UserGroups.List',
      parameters: { buyerID },
    }
  },
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const BuyerUserID: IRelatedOpData = {
  dependencies: ['body.BuyerID', 'parameters.buyerID'],
  operationInfo: (dependencies) => {
    const buyerID = dependencies![1]! || dependencies![0]!
    return {
      pauseOperation: !buyerID,
      operationId: 'Users.List',
      parameters: { buyerID },
    }
  },
  renderItem: (result: any) => <UserTemplate result={result} />,
}

const SpecID: IRelatedOpData = {
  operationInfo: () => {
    return {
      operationId: 'Specs.List',
    }
  },
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const SupplierUserGroupID: IRelatedOpData = {
  dependencies: ['body.SupplierID', 'parameters.supplierID'],
  operationInfo: (dependencies) => {
    const supplierID = dependencies![1]! || dependencies![0]!
    return {
      pauseOperation: !supplierID,
      operationId: 'SupplierUserGroups.List',
      parameters: { supplierID },
    }
  },
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

const SupplierUserID: IRelatedOpData = {
  dependencies: ['body.SupplierID', 'parameters.supplierID'],
  operationInfo: (dependencies) => {
    const supplierID = dependencies![1]! || dependencies![0]!
    return {
      pauseOperation: !supplierID,
      operationId: 'SupplierUsers.List',
      parameters: { supplierID },
    }
  },
  renderItem: (result: any) => <UserTemplate result={result} />,
}

const PriceScheduleID: IRelatedOpData = {
  dependencies: ['body.SellerID'],
  operationInfo: (dependencies) => ({
    operationId: 'PriceSchedules.List',
    parameters: dependencies![0]
      ? {
          OwnerID: dependencies![0],
        }
      : undefined,
  }),
  renderItem: (result: any) => <PriceScheduleTemplate result={result} />,
}

const SecurityProfileID: IRelatedOpData = {
  operationInfo: () => ({ operationId: 'SecurityProfiles.List' }),
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

// UserGroupID is used specifically for SecurityProfile assignments
// It will retrieve SupplierUserGroups if SupplierID exists, then check BuyerID, and finally AdminUserGroups if no BuyerID
const UserGroupID: IRelatedOpData = {
  dependencies: ['body.BuyerID', 'parameters.buyerID', 'body.SupplierID', 'parameters.supplierID'],
  operationInfo: (dependencies) => {
    const buyerID = dependencies![1] || dependencies![0]
    const supplierID = dependencies![2] || dependencies![3]
    if (supplierID) {
      return {
        operationId: 'SupplierUserGroups.List',
        parameters: { supplierID, buyerID: '' },
      }
    }
    if (buyerID) {
      return {
        operationId: 'UserGroups.List',
        parameters: { buyerID: buyerID, supplierID: '' },
      }
    }
    return {
      operationId: 'AdminUserGroups.List',
    }
  },
  renderItem: (result: any) => <DefaultTemplate result={result} />,
}

// UserID is used specifically for SecurityProfile assignments
// It will retrieve SupplierUsers if SupplierID exists, then check BuyerID, and finally AdminUsers if no BuyerID
const UserID: IRelatedOpData = {
  dependencies: ['body.BuyerID', 'parameters.buyerID', 'body.SupplierID', 'parameters.supplierID'],
  operationInfo: (dependencies) => {
    const buyerID = dependencies![1] || dependencies![0]
    const supplierID = dependencies![2] || dependencies![3]
    if (supplierID) {
      return {
        operationId: 'SupplierUsers.List',
        parameters: { supplierID, buyerID: '' },
      }
    }
    if (buyerID) {
      return {
        operationId: 'Users.List',
        parameters: { buyerID: buyerID, supplierID: '' },
      }
    }
    return {
      operationId: 'AdminUsers.List',
    }
  },
  renderItem: (result: any) => <UserTemplate result={result} />,
}

export const relatedListOperationsByResource: {
  [resourceId: string]: { [propertyKey: string]: IRelatedOpData }
} = {
  // Assignments will be checked if a resource specific config does not exist
  Assignments: {
    BuyerID,
    BundleID,
    SupplierID,
    CatalogID,
    UserGroupID: BuyerUserGroupID,
    UserID: BuyerUserID,
    SpecID: SpecID,
    ProductID,
    LocaleID,
    PromotionID,
    PriceScheduleID,
    SecurityProfileID
  },
  AdminUsers: {},
  AdminUserGroups: {
    UserID: AdminUserID,
    UserGroupID: AdminUserGroupID,
  },
  Users: {},
  UserGroups: {
    UserID: BuyerUserID,
    UserGroupID: BuyerUserGroupID,
  },
  Addresses: {
    AddressID,
  },
  SupplierUsers: {},
  SupplierUserGroups: {
    UserID: SupplierUserID,
    UserGroupID: SupplierUserGroupID,
  },
  Products: {
    DefaultPriceScheduleID: PriceScheduleID,
    DefaultSupplierID: {
      operationInfo: () => ({ operationId: 'Suppliers.List' }),
      renderItem: (result: any) => <DefaultTemplate result={result} />,
    },
    ShipFromAddressID: {
      dependencies: ['body.DefaultSupplierID'],
      operationInfo: (dependencies?: string[]) => {
        return dependencies![0]
          ? {
              operationId: 'SupplierAddresses.List',
              parameters: { supplierID: dependencies![0] },
            }
          : {
              operationId: 'AdminAddresses.List',
            }
      },
      renderItem: (result: any) => <AddressTemplate result={result} />,
    },
    ParentID: {
      operationInfo: () => ({
        operationId: 'Products.List',
        parameters: {
          IsParent: 'true',
        },
      }),
      renderItem: (result: any) => <DefaultTemplate result={result} />,
    },
  },
  Buyers: {
    DefaultCatalogID: CatalogID,
  },
  Catalogs: {
    ProductID,
  },
  Categories: {
    CategoryID,
    UserGroupID: BuyerUserGroupID,
    ParentID: {
      dependencies: ['parameters.catalogID'],
      operationInfo: (dependencies) => {
        return {
          pauseOperation: !dependencies![0],
          operationId: 'Categories.List',
          parameters: { catalogID: dependencies![0]! },
          filters: { depth: 'all' },
        }
      },
      renderItem: (result: any) => <DefaultTemplate result={result} />,
    },
  },
  Specs: {
    DefaultOptionID: {
      dependencies: ['parameters.specID', 'body.SpecID'],
      operationInfo: (dependencies) => {
        const specID = dependencies![0]! || dependencies![1]!
        return {
          pauseOperation: !specID,
          operationId: 'Specs.ListOptions',
          parameters: { specID },
        }
      },
      renderItem: (result: any) => <SpecOptionTemplate result={result} />,
    },
  },
  Orders: {
    FromCompanyID,
    ToCompanyID,
    FromUserID,
    BillingAddressID: {
      dependencies: ['body.FromCompanyID'],
      operationInfo: (dependencies) => ({
        pauseOperation: !dependencies![0],
        operationId: 'Addresses.List',
        parameters: { buyerID: dependencies![0]! },
      }),
      renderItem: (result: any) => <AddressTemplate result={result} />,
    },
    ShippingAddressID: {
      dependencies: ['body.FromCompanyID'],
      operationInfo: (dependencies) => ({
        pauseOperation: !dependencies![0],
        operationId: 'Addresses.List',
        parameters: { buyerID: dependencies![0]! },
      }),
      renderItem: (result: any) => <AddressTemplate result={result} />,
    },
  },
  Payments: {
    /*     TODO: CreditCardID, SpendingAccountID
    We need the buyerID to make these list calls, but that 
    would require an additional call before making the list calls */
  },
  SubscriptionItems: {
    ProductID,
    /*     TODO: ShipFromAddressID, ShippingAddressID
    We need the buyerID & supplierID for these but don't have access to them on the form */
  },
  Subscriptions: {
    FromCompanyID,
    ToCompanyID,
    FromUserID,
  },
  SecurityProfiles: {
    SecurityProfileID,
    UserGroupID,
    UserID,
  }
}
