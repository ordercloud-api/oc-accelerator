import {
  Button,
  ButtonGroup,
  FormControl,
  FormLabel,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Tooltip,
  useDisclosure,
} from '@chakra-ui/react'
import { Select } from 'chakra-react-select'
import { groupBy } from 'lodash'
import { useMemo, useState } from 'react'
import { ValueEditorProps } from 'react-querybuilder'
import { CustomValueEditor } from '../PromotionExpressionBuilder/components/CustomValueEditor'
import approvalRuleRecipes from './approval-rule-recipes.json'
import promoRecipes from './promo-recipes.json'
import { usePromoExpressions } from '@ordercloud/react-sdk'
import { InfoOutlineIcon } from "@chakra-ui/icons";
import { transformFunctions } from './transformFunctions'

interface RecipeVariables {
  label: string
  ordercloudProperty: string
  transformFunctionName: string
  token: string
  value: string
}

interface ExpressionRecipesSelectProps {
  onChange: (
    eligibleExpressionQuery: any,
    valueExpressionQuery: any,
    ruleExpressionQuery: any,
    isLineItemLevel: boolean
  ) => void
  type: 'Promotion' | 'Approval Rule'
}

export function ExpressionRecipesSelect({ onChange, type }: ExpressionRecipesSelectProps) {
  const { fields } = usePromoExpressions()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [recipeName, setRecipeName] = useState('')
  const [recipeVariables, setRecipeVariables] = useState([] as RecipeVariables[])

  const recipes: any = useMemo(() => {
    if (type === 'Promotion') {
      return promoRecipes
    } else {
      return approvalRuleRecipes
    }
  }, [type])

  const options = groupRecipes()

  function groupRecipes() {
    const grouped = Object.entries(groupBy(recipes, 'group'))
    return grouped.reduce((acc, [groupName, group]) => {
      const groupOptions = group.map((o) => ({ label: o.label, value: o.label }))
      acc.push({ label: groupName, options: groupOptions })
      return acc
    }, [] as any[])
  }

  const handleChange = (option: any) => {
    setRecipeName(option.value)
    const recipe = recipes.find((o: any) => o.label === option.value)
    if (recipe) {
      if (recipe.variables?.length) {
        setRecipeVariables(recipe.variables)
        onOpen()
      } else {
        if (type === 'Promotion') {
          onChange(
            recipe.eligibleExpressionQuery,
            recipe.valueExpressionQuery,
            null,
            recipe.isLineItemLevel
          )
        } else {
          onChange(null, null, recipe.ruleExpressionQuery, false)
        }
      }
    }
  }

  const handleChangeWithVariables = (recipeVariables: RecipeVariables[]) => {
    let recipe = recipes.find((p: any) => p.label === recipeName)
    let recipeStringified = JSON.stringify(recipe)
    recipeVariables.forEach((variables: any) => {
      let updatedValue = variables.value
      if (variables.transformFunctionName) {
        updatedValue = (transformFunctions as any)[variables.transformFunctionName](variables.value)
      }
      recipeStringified = recipeStringified.replace(
        new RegExp(`"${variables.token}"`, 'g'),
        JSON.stringify(updatedValue)
      )
    })
    recipe = JSON.parse(recipeStringified)
    if (type === 'Promotion') {
      onChange(
        recipe.eligibleExpressionQuery,
        recipe.valueExpressionQuery,
        null,
        recipe.isLineItemLevel
      )
    } else {
      onChange(null, null, recipe.ruleExpressionQuery, false)
    }
    setRecipeVariables([])
  }

  return (
    <>
      <FormControl>
        <FormLabel>
          {type} Recipes{' '}
          <Tooltip
            label="A collection of pre-built expressions that you can customize to fit your specific needs."
            shouldWrapChildren={true}
            placement="right"
            aria-label="Tooltip for prebuilt expressions field"
          >
            <InfoOutlineIcon />
          </Tooltip>
        </FormLabel>
        <Select<any, false, any>
          options={options}
          value={options.flatMap((o) => o.options).find((o) => o.value === recipeName)}
          onChange={handleChange}
          formatGroupLabel={(groupedOption) => groupedOption.label}
          chakraStyles={{
            container: (baseStyles) => ({ ...baseStyles, maxWidth: '400px' }),
          }}
        />
      </FormControl>
      <Modal
        isOpen={isOpen && recipeVariables?.length > 0}
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Enter details for recipe</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {recipeVariables.map((variables) => {
              const fieldData = fields?.find((f: any) => f.name === variables.ordercloudProperty)
              const valueEditorProps = {
                operator: '=',
                field: variables.ordercloudProperty,
                fieldData,
                inputType: fieldData?.inputType || 'text',
                valueSource: 'value',
              } as unknown as ValueEditorProps
              return (
                <FormControl key={variables.label}>
                  <FormLabel>{variables.label}</FormLabel>
                  <CustomValueEditor
                    {...valueEditorProps}
                    showInModal={true}
                    handleOnChange={(newVal) => {
                      variables.value = newVal
                    }}
                  />
                </FormControl>
              )
            })}
          </ModalBody>
          <ModalFooter>
            <ButtonGroup
              justifyContent="flex-end"
              width="full"
            >
              <Button
                variant="ghost"
                onClick={() => {
                  setRecipeVariables([])
                  onClose()
                }}
              >
                Cancel
              </Button>
              <Button onClick={() => handleChangeWithVariables(recipeVariables)}>Submit</Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}
