import { FormControl, FormLabel, Tooltip, VStack } from '@chakra-ui/react'
import { QueryBuilderChakra } from '@react-querybuilder/chakra'
import { Field, QueryBuilder, RuleGroupTypeIC } from 'react-querybuilder'
import { combinators } from './combinators'
import { CustomAddGroupAction } from './components/CustomAddGroupAction'
import { CustomAddRuleAction } from './components/CustomAddRuleAction'
import { CustomCombinatorSelector } from './components/CustomCombinatorSelector'
import { CustomFieldSelector } from './components/CustomFieldSelector'
import { CustomOperatorSelector } from './components/CustomOperatorSelector'
import { CustomRemoveGroupAction } from './components/CustomRemoveGroupAction'
import { CustomRemoveRuleAction } from './components/CustomRemoveRuleAction'
import { CustomValueEditor } from './components/CustomValueEditor'
import { operators } from './operators'
import { validator } from './validator'
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { usePromoExpressions } from '@ordercloud/react-sdk'
import { InputControl } from '../../Controls'

interface RuleExpressionBuilderProps {
  query: RuleGroupTypeIC
  setQuery: (query: RuleGroupTypeIC) => void
  isDisabled?: boolean
  isValid: boolean
}

export function RuleExpressionBuilder({
  query,
  setQuery,
  isDisabled,
  isValid,
}: RuleExpressionBuilderProps) {
  const { fields } = usePromoExpressions()

  if (!fields) return null
  return (
    <>
      <FormControl isInvalid={!isValid}>
        <FormLabel>
          Rule Expression{' '}
          <Tooltip
            shouldWrapChildren={true}
            label="The expression evaluated to determine an order requires approval."
            placement="right"
            aria-label="Tooltip for Rule Expression"
          >
            <InfoOutlineIcon />
          </Tooltip>
        </FormLabel>
      </FormControl>

      <InputControl
        mb={5}
        name={'ruleExpression'}
        isRequired={true}
        isDisabled={true}
      />
      <VStack
        mb={6}
        id="vstack-wrapper"
        width="full"
        alignItems="stretch"
        sx={{
          '& > .queryBuilder': {
            '& .ruleGroup': {
              '& .ruleGroup-body': {
                '& .betweenRules': {
                  my: 3,
                },
                '& .rule': {
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: 6,
                  paddingBlock: 3,
                  '& span': {
                    fontFamily: 'mono',
                    alignSelf: 'stretch',
                    justifyContent: 'center',
                    minW: '24',
                    mr: 4,
                  },
                },
              },
            },
            '& .queryBuilder-invalid': {
              rounded: 'md',
              backgroundColor: 'rgb(225, 40, 30, .1)',
              borderColor: 'danger',
              padding: 3,
              '.ruleGroup .ruleGroup-body > .rule': {
                rounded: 'md',
                padding: 3,
                borderColor: 'danger',
              },
            },
          },
        }}
      >
        <QueryBuilderChakra>
          <QueryBuilder
            fields={fields as Field[]}
            independentCombinators={true}
            combinators={combinators}
            query={query}
            context={{
              query,
              setQuery,
              isLineItemLevelPromo: false,
              isDisabled,
              expressionType: 'Rule',
            }}
            onQueryChange={setQuery}
            onAddRule={(rule, _parentPath, _query, context) => {
              // add the modelPath to the rule so we can filter the fields in the fieldSelector
              (rule as any)['modelPath'] = context.modelPath;
              (rule as any)['modelName'] = context.modelName

              if (context['groupOperator'] === 'min' || context['groupOperator'] === 'max') {
                // For min/max we always want the ',' operator
                rule.combinatorPreceding = ','
              }

              // set the field to the first field in the list
              rule['field'] = fields.find((f: any) => f['modelPath'] === context.modelPath)?.name || ''
              return rule
            }}
            onAddGroup={(group, _parentPath, _query, _context) => {
              group.rules = [] // clear out rules, we want to force them to pick an entity first so we can filter fields/operators accordingly
              return group
            }}
            getOperators={(fieldName) => {
              if (fieldName.includes('.xp.')) {
                // xp could be any type, so give them all of the operators
                return operators
              }

              if (
                fieldName === 'LineItem.Product.Category' ||
                fieldName === 'ApprovalRule.ID' ||
                fieldName === 'SellerApprovalRule.ID' ||
                fieldName === 'CostCenter.ID'
              ) {
                // Category is a special case, we only want to allow =
                return operators.filter((o) => o.name === '=')
              }

              // Get relevant operators based on field type
              const split = fieldName.split('.')
              const name = split[split.length - 1]
              const modelPath = split.slice(0, split.length - 1).join('.')
              const definition = fields.find((f: any) => f.name === `${modelPath}.${name}`)
              if (!definition) {
                throw new Error('no definition found for field: ' + fieldName)
              }
              const inputType = definition.inputType
              switch (inputType) {
                case 'number':
                  return operators.filter((o) => o.appliesTo.includes('number'))
                case 'datetime-local':
                  return operators.filter((o) => o.appliesTo.includes('date'))
                case 'text':
                  return operators.filter((o) => o.appliesTo.includes('string'))
              }
              return operators
            }}
            addRuleToNewGroups
            showCombinatorsBetweenRules
            controlElements={{
              addRuleAction: CustomAddRuleAction,
              addGroupAction: CustomAddGroupAction,
              fieldSelector: CustomFieldSelector,
              valueEditor: CustomValueEditor,
              combinatorSelector: CustomCombinatorSelector,
              operatorSelector: CustomOperatorSelector,
              removeRuleAction: CustomRemoveRuleAction,
              removeGroupAction: CustomRemoveGroupAction,
            }}
            validator={(query) => validator(query, false)}
          />
        </QueryBuilderChakra>
      </VStack>
    </>
  )
}
