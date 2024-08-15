import { ValueEditorProps } from 'react-querybuilder'
import { SearchableInput } from './SearchableInput'
import { useCallback } from 'react'
import { Address, ApprovalRule, Buyer, Catalog, CostCenter, LineItem, Order, Product, User } from 'ordercloud-javascript-sdk'

const getModelName = (props: ValueEditorProps): string => {
  const modelParts = props.field.split('.')
  return modelParts[modelParts.length - 2]
}

// eslint-disable-next-line react-refresh/only-export-components
export const hasSearchableField = (props: ValueEditorProps): boolean => {
  const modelName = getModelName(props)
  if (modelName === 'Variant') {
    // too weird to handle, and not very useful anyway
    return false
  }
  return props.field.endsWith('.ID') || props.field === 'LineItem.Product.Category'
}

interface SearchableFieldProps extends ValueEditorProps {
  showInModal?: boolean
}
export const SearchableField = (props: SearchableFieldProps) => {
  const modelName = getModelName(props)

  const formatProductOptions = useCallback(
    (product: Product) => ({
      value: product.ID,
      label: `${product.Name} | ${product.ID}`,
    }),
    []
  )

  const formatVariantOptions = useCallback(
    (variant: Product) => ({ value: variant.ID, label: `${variant.Name} | ${variant.ID}` }),
    []
  )
  const formatCatalogOptions = useCallback(
    (catalog: Catalog) => ({ value: catalog.ID, label: `${catalog.Name} | ${catalog.ID}` }),
    []
  )
  const formatOrderOptions = useCallback((order: Order) => ({ value: order.ID, label: order.ID }), [])
  const formatBuyerOptions = useCallback(
    (buyer: Buyer) => ({ value: buyer.ID, label: `${buyer.Name} | ${buyer.ID}` }),
    []
  )
  const formatAddressOptions = useCallback(
    (address: Address) => ({ value: address.ID, label: `${address.AddressName} | ${address.ID}` }),
    []
  )
  const formatUserOptions = useCallback(
    (user: User) => ({ value: user.ID, label: `${user.Username} | ${user.ID}` }),
    []
  )
  const formatLineItemOptions = useCallback(
    (lineItem: LineItem) => ({ value: lineItem.ID, label: lineItem.ID }),
    []
  )
  const formatCostCenterOptions = useCallback(
    (costCenter: CostCenter) => ({ value: costCenter.ID, label: `${costCenter.Name} | ${costCenter.ID}` }),
    []
  )

  const formatApprovalRuleOptions = useCallback(
    (approvalRule: ApprovalRule) => ({
      value: approvalRule.ID,
      label: approvalRule.Name ? `${approvalRule.Name} | ${approvalRule.ID}` : approvalRule.ID,
    }),
    []
  )

  if (props.field === 'LineItem.Product.Category') {
    return (
      <SearchableInput
        showInModal={!!props.showInModal}
        resource="Categories"
        onUpdate={props.handleOnChange}
        value={props.value}
        formatResourceOptions={formatProductOptions}
        parentResource="Catalogs"
        formatParentResourceOptions={formatCatalogOptions}
        isDisabled={props.context?.isDisabled}
      />
    )
  }
  switch (modelName) {
    case 'Product':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="Products"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatProductOptions}
          isDisabled={props.context?.isDisabled}
        />
      )
    case 'LineItem':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="LineItems"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatLineItemOptions}
          params={['All']}
          parentResource="Orders"
          formatParentResourceOptions={formatOrderOptions}
          isDisabled={props.context?.isDisabled}
        />
      )
    case 'Variant':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="Variants"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatVariantOptions}
          parentResource="Products"
          formatParentResourceOptions={formatProductOptions}
          isDisabled={props.context?.isDisabled}
        />
      )
    case 'FromUser':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="Users"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatUserOptions}
          parentResource="Buyers"
          formatParentResourceOptions={formatBuyerOptions}
          isDisabled={props.context?.isDisabled}
        />
      )
    case 'Order':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="Orders"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatOrderOptions}
          params={['All']}
          isDisabled={props.context?.isDisabled}
        />
      )
    case 'OrderReturn':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="OrderReturns"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatOrderOptions}
          params={['All']}
          isDisabled={props.context?.isDisabled}
        />
      )
    case 'BillingAddress':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="Addresses"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatAddressOptions}
          parentResource="Buyers"
          formatParentResourceOptions={formatBuyerOptions}
          isDisabled={props.context?.isDisabled}
        />
      )
    case 'ShippingAddress':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="Addresses"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatAddressOptions}
          parentResource="Buyers"
          formatParentResourceOptions={formatBuyerOptions}
          isDisabled={props.context?.isDisabled}
        />
      )
    case 'ApprovalRule':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="ApprovalRules"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatApprovalRuleOptions}
          parentResource="Buyers"
          formatParentResourceOptions={formatBuyerOptions}
          isDisabled={props.context?.isDisabled}
        />
      )
    case 'SellerApprovalRule':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="SellerApprovalRules"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatApprovalRuleOptions}
          isDisabled={props.context?.isDisabled}
        />
      )
    case 'CostCenter':
      return (
        <SearchableInput
          showInModal={!!props.showInModal}
          resource="CostCenters"
          onUpdate={props.handleOnChange}
          value={props.value}
          formatResourceOptions={formatCostCenterOptions}
          isDisabled={props.context?.isDisabled}
          parentResource="Buyers"
          formatParentResourceOptions={formatBuyerOptions}
        />
      )
    default:
      throw new Error(`No searchable id field for model ${modelName}`)
  }
}
