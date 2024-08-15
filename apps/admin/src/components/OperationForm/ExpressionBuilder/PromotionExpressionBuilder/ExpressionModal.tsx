import {
  Button,
  ButtonGroup,
  Container,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  UseDisclosureProps,
} from '@chakra-ui/react'
import { yupResolver } from '@hookform/resolvers/yup'
import { FC, useCallback, useEffect, useState } from 'react'
import { FormProvider, useForm, useFormContext, useWatch } from 'react-hook-form'
import { RuleGroupTypeIC } from 'react-querybuilder'
import * as yup from 'yup'
import { ExpressionRecipesSelect } from '../ExpressionRecipes/ExpressionRecipesSelect'
import { PromotionExpressionBuilder } from './PromotionExpressionBuilder'
import { RuleExpressionBuilder } from './RuleExpressionBuilder'
import { formatQuery } from './formatQuery'
import { isQueryValid } from './isAllValid'
import { SubmitButton, SwitchControl } from '../../Controls'

interface ExpressionEditorModalProps {
  disclosure: UseDisclosureProps
  type: 'Promotion' | 'Approval Rule'
}

const defaultRuleGroup: RuleGroupTypeIC = {
  rules: [],
  id: 'root',
}

const ExpressionEditorModal: FC<ExpressionEditorModalProps> = ({ disclosure, type }) => {
  const { isOpen, onClose } = disclosure

  const [ruleExpressionQuery, setRuleExpressionQuery] = useState<RuleGroupTypeIC>(defaultRuleGroup)
  const [valueExpressionQuery, setValueExpressionQuery] =
    useState<RuleGroupTypeIC>(defaultRuleGroup)
  const [eligibleExpressionQuery, setEligibleExpressionQuery] =
    useState<RuleGroupTypeIC>(defaultRuleGroup)
  const [isValid, setIsValid] = useState<boolean>(false)

  const { setValue: setParentFormValue } = useFormContext()

  const methods = useForm({
    defaultValues: {
      isLineItemLevel: true,
      eligibleExpression: '',
      valueExpression: '',
      ruleExpression: '',
    },
    resolver: yupResolver(
      yup.object().shape({
        isLineItemLevel: yup.boolean(),
        eligibleExpression: yup.string(),
        valueExpression: yup.string(),
        ruleExpression: yup.string(),
      })
    ),
    mode: 'onBlur',
  })

  const lineItemLevel = useWatch({ control: methods.control, name: 'isLineItemLevel' })

  const handlePromoRecipeChange = (
    eligibleExpressionQuery: any,
    valueExpressionQuery: any,
    ruleExpressionQuery: any,
    isLineItemLevel: boolean
  ) => {
    if (type === 'Promotion') {
      setEligibleExpressionQuery(eligibleExpressionQuery)
      setValueExpressionQuery(valueExpressionQuery)
      methods.setValue('isLineItemLevel', isLineItemLevel)
    } else {
      setRuleExpressionQuery(ruleExpressionQuery)
    }
  }

  useEffect(() => {
    if (type === 'Promotion') {
      const isEligibleExpressionValid = isQueryValid(eligibleExpressionQuery, !!lineItemLevel)
      const isValueExpressionValid = isQueryValid(valueExpressionQuery, !!lineItemLevel)
      !isEligibleExpressionValid || !isValueExpressionValid ? setIsValid(false) : setIsValid(true)
    } else {
      setIsValid(isQueryValid(ruleExpressionQuery, false))
    }
  }, [eligibleExpressionQuery, lineItemLevel, ruleExpressionQuery, type, valueExpressionQuery])

  useEffect(() => {
    if (eligibleExpressionQuery?.rules?.length) {
      const formattedQuery = formatQuery(eligibleExpressionQuery, !!lineItemLevel)
      methods.setValue('eligibleExpression', formattedQuery)
    }
  }, [eligibleExpressionQuery, lineItemLevel, methods])

  useEffect(() => {
    if (valueExpressionQuery?.rules?.length) {
      const formattedQuery = formatQuery(valueExpressionQuery, !!lineItemLevel)
      methods.setValue('valueExpression', formattedQuery)
    }
  }, [valueExpressionQuery, methods, lineItemLevel])

  useEffect(() => {
    if (ruleExpressionQuery?.rules?.length) {
      console.log(ruleExpressionQuery)
      const formattedQuery = formatQuery(ruleExpressionQuery, false)
      methods.setValue('ruleExpression', formattedQuery)
    }
  }, [ruleExpressionQuery, methods])

  const handleClearInputs = useCallback(() => {
    setRuleExpressionQuery(defaultRuleGroup)
    setValueExpressionQuery(defaultRuleGroup)
    setEligibleExpressionQuery(defaultRuleGroup)
  }, [])

  const handleSave = useCallback(
    (values: any) => {
      if (type === 'Promotion') {
        setParentFormValue('body.EligibleExpression', values.eligibleExpression)
        setParentFormValue('body.ValueExpression', values.valueExpression)
        setParentFormValue('body.LineItemLevel', values.isLineItemLevel)
      } else {
        setParentFormValue('body.RuleExpression', values.ruleExpression)
      }
      handleClearInputs()
      methods.reset()
      if (onClose) onClose()
    },
    [type, handleClearInputs, methods, onClose, setParentFormValue]
  )

  const handleOnClose = useCallback(() => {
    handleClearInputs()
    methods.reset()
    if (onClose) onClose()
  }, [handleClearInputs, methods, onClose])

  return (
    <Modal
      size="full"
      isOpen={!!isOpen}
      onClose={handleOnClose}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalCloseButton />
        <ModalBody
          display="grid"
          placeItems="center center"
          h="100%"
        >
          <Container
            h="100%"
            maxW="container.xl"
            display="flex"
            flexFlow="column nowrap"
            p={12}
            gap={3}
          >
            <Heading
              as="h1"
              size="lg"
              mb={3}
            >
              {type} Expression Builder
            </Heading>
            <FormProvider {...methods}>
              <form
                id="EDIT_EXPRESSION_FORM"
                autoComplete="off"
                noValidate
                onSubmit={(e) => {
                  e.stopPropagation()
                  return methods.handleSubmit(handleSave)(e)
                }}
              >
                <ExpressionRecipesSelect
                  onChange={handlePromoRecipeChange}
                  type={type}
                />
                <br />
                {type === 'Approval Rule' && (
                  <RuleExpressionBuilder
                    query={ruleExpressionQuery}
                    setQuery={setRuleExpressionQuery}
                    isValid={isValid}
                  />
                )}
                {type === 'Promotion' && (
                  <>
                    <SwitchControl
                      label="Line Item Level Promo"
                      name="isLineItemLevel"
                    />
                    <PromotionExpressionBuilder
                      expressionType="Eligible"
                      query={eligibleExpressionQuery}
                      lineItemLevel={lineItemLevel}
                      setQuery={setEligibleExpressionQuery}
                      isValid={isValid}
                    />{' '}
                    <PromotionExpressionBuilder
                      expressionType="Value"
                      query={valueExpressionQuery}
                      lineItemLevel={lineItemLevel}
                      setQuery={setValueExpressionQuery}
                      isValid={isValid}
                    />
                  </>
                )}
              </form>
            </FormProvider>
            <ButtonGroup
              gap={3}
              mt={6}
              alignSelf="flex-end"
            >
              <Button
                variant="ghost"
                onClick={() => {
                  handleClearInputs()
                  methods.reset()
                }}
              >
                Reset
              </Button>
              <SubmitButton
                form="EDIT_EXPRESSION_FORM"
                control={methods.control}
                isDisabled={!isValid}
              >
                Save
              </SubmitButton>
            </ButtonGroup>
          </Container>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default ExpressionEditorModal
