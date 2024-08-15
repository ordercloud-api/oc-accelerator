import { RuleType, RuleGroupTypeAny, ValidationMap, ValidationResult } from 'react-querybuilder'
import { combinators } from './combinators'

export const validator = (
  query: RuleGroupTypeAny,
  isLineItemLevel: boolean
): boolean | ValidationMap => {
  const result: ValidationMap = {}

  validateGroup(query, result, isLineItemLevel)

  return result
}

function validateGroup(group: RuleGroupTypeAny, result: ValidationMap, isLineItemLevel: boolean) {
  const reasons: any[] = []

  if (group.rules.length === 0) {
    reasons.push({ code: 'empty', message: 'Groups must have at least one rule' })
  } else if (!('combinator' in group)) {
    // Odd indexes should be valid combinators and even indexes should be rules or groups
    let invalidICs = false
    for (let i = 0; i < group.rules.length && !invalidICs; i++) {
      if (
        (i % 2 === 0 && typeof group.rules[i] === 'string') ||
        (i % 2 === 1 && typeof group.rules[i] !== 'string') ||
        (i % 2 === 1 &&
          typeof group.rules[i] === 'string' &&
          !combinators.map((c) => c.name as string).includes(group.rules[i] as string))
      ) {
        invalidICs = true
      }
    }
    if (invalidICs) {
      reasons.push({
        code: 'invalidIndependentCombinator',
        message: 'Invalid independent combinator',
      })
    }
  }

  // Note: combinators are considered rules, thats why we are checking 3 instead of 2
  if ((group as any)['operator'] === 'min' && group.rules.length !== 3) {
    reasons.push({ code: 'min', message: 'Min must have exactly two rules' })
  }

  // Note: combinators are considered rules, thats why we are checking 3 instead of 2
  if ((group as any)['operator'] === 'max' && group.rules.length !== 3) {
    reasons.push({ code: 'max', message: 'Max must have exactly two rules' })
  }

  if (group.id) {
    if (reasons.length) {
      result[group.id] = { valid: false, reasons }
    } else {
      result[group.id] = true
    }
  }
  group.rules.forEach((r) => {
    if (typeof r === 'string') {
      // Validation for this case was done earlier
    } else if ('rules' in r) {
      validateGroup(r, result, isLineItemLevel)
    } else {
      validateRule(r, group, result, isLineItemLevel)
    }
  })
}

function validateRule(
  rule: RuleType,
  group: RuleGroupTypeAny,
  result: ValidationMap,
  isLineItemLevel: boolean
) {
  const reasons: any[] = []
  if (!isLineItemLevel) {
    if ((rule as any)['modelPath'].startsWith('LineItem.') && !(group as any)['operator']?.startsWith('items.')) {
      reasons.push({
        code: 'lineItemFieldWithoutItemsGroup',
        message:
          'LineItems, Products, Variants, and ShippingAddresses must use the line item group operators OR promotion must be set to line item level',
      })
    }

    if (
      (group as any)['operator']?.startsWith('items.') &&
      !(rule as any)['modelPath'].startsWith('LineItem') &&
      !(rule as any)['modelPath'].startsWith('CostCenter')
    ) {
      reasons.push({
        code: 'invalidFieldForItemsGroup',
        message:
          'The line item group operators can only be used with LineItem, Product, Variant, and ShippingAddress fields',
      })
    }

    if (!(group as any)['operator']?.startsWith('items.') && (rule as any)['modelPath'].startsWith('CostCenter')) {
      reasons.push({
        code: 'invalidFieldForItemsGroup',
        message:
          'The Cost Center field can only be used in conjunction with line item group operators',
      })
    }

    if ((group as any)['operator']?.startsWith('order') && !(rule as any)['field'].includes('ApprovalRule')) {
      reasons.push({
        code: 'invalidRuleForOrderGroup',
        message:
          'The order group operators can only be used with Approval Rules or Seller Approval Rules',
      })
    }

    if (!(group as any)['operator'] && rule['field'].includes('ApprovalRule')) {
      reasons.push({
        code: 'invalidRuleForOrderGroup',
        message:
          'Approval Rules or Seller Approval Rules can only be used in combination with the order approved or order return approved group operators',
      })
    }
  }

  if (!rule.operator) {
    reasons.push({ code: 'empty', message: 'Rule must have an operator' })
  }
  if (rule.value === 'undefined' && rule.operator !== 'value') {
    reasons.push({ code: 'empty', message: 'Rule must have a value' })
  }
  if (rule.value === '' && rule.operator !== 'value') {
    reasons.push({ code: 'empty', message: 'Rule must have a value' })
  }

  if (rule.id) {
    if (reasons.length) {
      result[rule.id] = { valid: false, reasons }
    } else {
      result[rule.id] = true
    }
  }
}

export function isInvalid(validation: boolean | ValidationResult | undefined): boolean {
  if (!validation) {
    return false
  }
  if (typeof validation === 'boolean') {
    return !validation
  }
  return !validation.valid
}

export function getValidationMessage(validation: boolean | ValidationResult | undefined): string {
  if (typeof validation === 'boolean' || validation?.valid || !validation?.reasons) {
    // our custom validation should never return a boolean
    return ''
  }
  return validation.reasons[0].message
}

export function getValidationCode(validation: boolean | ValidationResult): string {
  if (typeof validation === 'boolean' || validation.valid || !validation?.reasons) {
    // our custom validation should never return a boolean
    return ''
  }
  return validation.reasons[0].code
}
