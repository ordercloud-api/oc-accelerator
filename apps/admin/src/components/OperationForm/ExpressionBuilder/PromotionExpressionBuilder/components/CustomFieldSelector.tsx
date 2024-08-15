import {
  Button,
  HStack,
  Input,
  InputGroup,
  InputLeftAddon,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tag,
  VStack,
  useDisclosure,
  Text,
  ButtonGroup,
} from '@chakra-ui/react'
import { ChangeEvent, useEffect, useState } from 'react'
import { FieldSelectorProps } from 'react-querybuilder'
import { isInvalid, getValidationMessage } from '../validator'

export function CustomFieldSelector({
  options,
  rule,
  value,
  className,
  handleOnChange,
  validation,
  context,
}: FieldSelectorProps) {
  const [xp, setXp] = useState<string>('')
  const [xpLabel, setXpLabel] = useState<string>('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const fieldOptions = (options as any).filter((o: any) => o['modelPath'] === (rule as any)['modelPath'])

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const value = event.target.value
    if (value.includes('.xp.')) {
      onOpen()
      return
    }
    handleOnChange(value)
  }

  const handleXpSelect = () => {
    handleOnChange(`${(rule as any)['modelPath']}.xp.${xp}`)
    onClose()
  }

  useEffect(() => {
    if (xp) {
      setXpLabel(`xp.${xp}`)
    } else {
      setXpLabel('xp')
    }
  }, [xp])

  return (
    <>
      <Modal
        isOpen={isOpen}
        size="xs"
        onClose={onClose}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="lg"
            fontWeight="bold"
          >
            Add XP (Extended Property)
          </ModalHeader>

          <ModalBody>
            <InputGroup>
              <InputLeftAddon>xp.</InputLeftAddon>
              <Input
                type="text"
                placeholder="my.custom.property"
                value={xp}
                onChange={(e) => setXp(e.target.value)}
              />
            </InputGroup>
          </ModalBody>

          <ModalFooter>
            <ButtonGroup
              justifyContent="flex-end"
              width="full"
            >
              <Button
                variant="ghost"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                colorScheme="primary"
                onClick={handleXpSelect}
                ml={3}
                isDisabled={!xp}
              >
                Add
              </Button>
            </ButtonGroup>
          </ModalFooter>
        </ModalContent>
      </Modal>
      <VStack
        width="full"
        alignItems="flex-start"
      >
        {isInvalid(validation) && <Text color="red">{getValidationMessage(validation)}</Text>}
        <HStack width="full">
          <Tag
            minWidth="fit-content"
            colorScheme="gray"
          >{`${(rule as any)['modelName']}`}</Tag>
          <Select
            className={className}
            value={value}
            onChange={handleSelectChange}
            isDisabled={context?.isDisabled}
          >
            {fieldOptions.map((option: any) => (
              <option
                key={option['name']}
                value={option['name']}
              >
                {option.label}
              </option>
            ))}
            {(rule as any)['modelName'] === 'Product' && (
              <option value="LineItem.Product.Category">Category</option>
            )}
            {xp && <option value={`${(rule as any)['modelPath']}.xp.${xp}`}>{xpLabel}</option>}
            <option value=".xp.">xp</option>
          </Select>
        </HStack>
      </VStack>
    </>
  )
}
