import {
  Button,
  FormLabel,
  HStack,
  Menu,
  MenuButton,
  MenuItemOption,
  MenuList,
  MenuOptionGroup,
  Select,
  Text,
  VStack,
} from '@chakra-ui/react'
import { ChangeEvent, MouseEvent, useMemo } from 'react'
import { ActionWithRulesAndAddersProps, RuleGroupType, update } from 'react-querybuilder'
import { groupOperators } from '../groupOperators'
import { getValidationMessage } from '../validator'
import { usePromoExpressions } from '@ordercloud/react-sdk'
import { ChevronDownIcon } from '@chakra-ui/icons'

export function CustomAddRuleAction({
  handleOnClick,
  path,
  context,
  ruleOrGroup,
  validation,
}: ActionWithRulesAndAddersProps) {
  const { options } = usePromoExpressions()
  const applicableGroupOperators = groupOperators.filter((o) =>
    o.appliesToExpressionType.includes(context.expressionType)
  )

  const groupOperator = useMemo(()=> (ruleOrGroup as any)['operator'],[ruleOrGroup])

  const handleMenuClick = (modelName: string, modelPath: string) => (e: MouseEvent) => {
    // we're passing modelPath as context, then in onAddRule we will use that context to add it to the rule
    // this will allow us to filter the options based on the selected model
    handleOnClick(e, { modelName, modelPath, groupOperator })
  }

  const updateGroup = (e: ChangeEvent<HTMLSelectElement>) => {
    let updatedQuery: any
    const operator = e.target.value
    const wasPreviouslyMinOrMax =
    groupOperator === 'min' || groupOperator === 'max'
    const willBeMinOrMax = operator === 'min' || operator === 'max'
    const combinatorIndices = (ruleOrGroup as RuleGroupType).rules
      .map((r, index) => {
        if (typeof r !== 'string') {
          return null
        }
        return index
      })
      .filter((i) => i !== undefined)

    // Update group with new function
    updatedQuery = update(context.query, 'operator', operator, path)

    // if operator is min/max then update combinators to be COMMA
    if (willBeMinOrMax) {
      combinatorIndices.forEach((combinatorIndex) => {
        updatedQuery = update(updatedQuery, 'combinator', ',', [...path!, combinatorIndex!])
      })
    }
    // if operator was previously min/max and is now something else then update combinators to be AND
    else if (wasPreviouslyMinOrMax && !willBeMinOrMax) {
      combinatorIndices.forEach((combinatorIndex) => {
        updatedQuery = update(updatedQuery, 'combinator', 'and', [...path!, combinatorIndex!])
      })
    }

    context.setQuery(updatedQuery)
  }

  const isAddRuleDisabled = useMemo(() => {
    const isMinOrMax = groupOperator === 'min' || groupOperator === 'max'
    // Max number of rules is 2 for min/max
    // Note: combinators are considered rules, thats why we are checking 3 instead of 2
    const result = isMinOrMax && (ruleOrGroup as RuleGroupType)?.rules?.length >= 3

    return result
  }, [groupOperator, ruleOrGroup])

  return (
    <HStack
      justifyContent="space-between"
      width="full"
      alignItems="flex-end"
      gap={6}
    >
      <HStack w="full">
        <VStack
          alignItems="flex-start"
          w="full"
        >
          <FormLabel
            fontWeight="normal"
            fontSize="sm"
            color="chakra-subtle-text"
          >
            {applicableGroupOperators.find((o) => o.name === groupOperator)
              ?.description || 'Optionally apply an operator to all the rules in the group'}
          </FormLabel>
          <Select
            onChange={updateGroup}
            maxW="md"
            value={groupOperator}
            isDisabled={context?.isDisabled}
          >
            <option value="">Select Operator</option>
            {applicableGroupOperators.map((o) => (
              <option
                key={o.name}
                value={o.name}
              >
                {o.label}
              </option>
            ))}
          </Select>
        </VStack>
        <Text
          fontSize="sm"
          color="danger"
          whiteSpace="nowrap"
          alignSelf="flex-end"
          mb={2}
        >
          {getValidationMessage(validation)}
        </Text>
      </HStack>
      <Menu placement="right-start">
        <MenuButton
          as={Button}
          size="sm"
          variant="outline"
          isDisabled={isAddRuleDisabled || context?.isDisabled}
          title={isAddRuleDisabled ? 'Min/Max can compare up to two expressions' : 'Add a new rule'}
          aria-label={
            isAddRuleDisabled ? 'Min/Max can compare up to two expressions' : 'Add a new rule'
          }
          rightIcon={
            <ChevronDownIcon />
          }
        >
          Add Rule
        </MenuButton>
        <MenuList>
          <MenuOptionGroup title="Add New Rule">
            {options?.map((option: any) => (
              <MenuItemOption
                key={option.value}
                icon={<></>}
                iconSpacing={0}
                value={option.value}
                onClick={handleMenuClick(option.label, option.value)}
              >
                {option.label}
              </MenuItemOption>
            ))}
          </MenuOptionGroup>
        </MenuList>
      </Menu>
    </HStack>
  )
}
