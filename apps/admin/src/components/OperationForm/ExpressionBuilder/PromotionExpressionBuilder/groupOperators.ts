// In ordercloud its possible to apply a function to a group of items
// so we must extend react-querybuilder to support this
// ex: items.any evaluates to true if any of the items in the order meet the condition


export const groupOperators = [
  {
    name: "items.any",
    label: "If any lineitem",
    description: "Evaluates to true when any one of the line items on the order matches the condition",
    appliesToExpressionType: ["Eligible", "Rule"]
  },
  {
    name: "items.all",
    label: "If all lineitems",
    description: "Evaluates to true when all line items on the order match the condition",
    appliesToExpressionType: ["Eligible", "Rule"]
  },
  {
    name: "items.quantity",
    label: "Sum lineitems quantity",
    description: "The sum of all line item quantities that match the condition",
    appliesToExpressionType: ["Eligible", "Value", "Rule"]
  },
  {
    name: "items.count",
    label: "Sum lineitems count",
    description: "The sum of line items that match the condition",
    appliesToExpressionType: ["Eligible", "Value", "Rule"]
  },
  {
    name: "items.total",
    label: "Sum lineitems total",
    description: "The sum of all line item totals ($ amount) that match the condition",
    appliesToExpressionType: ["Eligible", "Value", "Rule"]
  },
  {
    name: "min",
    label: "Min",
    description: "The minimum value between two numbers",
    appliesToExpressionType: ["Eligible", "Value"]
  },
  {
    name: "max",
    label: "Max",
    description: "The maximum value between two numbers",
    appliesToExpressionType: ["Eligible", "Value"]
  },
  {
    name: "order.approved",
    label: "If order rule approved",
    description: "Evaluates to true when the specified approval rule ID has been approved",
    appliesToExpressionType: ["Rule"]
  },
  {
    name: "orderReturn.approved",
    label: "If order return rule approved",
    description: "Evaluates to true when the specified approval rule ID has been approved",
    appliesToExpressionType: ["Rule"]
  }
]
