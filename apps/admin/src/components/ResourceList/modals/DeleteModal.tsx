import {
  Badge,
  Button,
  Center,
  Heading,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Spinner,
  Text,
  UseDisclosureProps,
} from '@chakra-ui/react'
import pluralize from 'pluralize'
import { FC, useCallback, useEffect, useMemo, useState } from 'react'

interface IDeleteModal {
  item?: any
  resource: string
  disclosure: UseDisclosureProps
  isAssignment?: boolean
  onComplete: (idsToRemove: string[], nonIdParametersObj?: any) => void
}

const DeleteModal: FC<IDeleteModal> = ({
  item,
  disclosure,
  resource,
  isAssignment,
  onComplete,
}) => {
  const { isOpen, onClose } = disclosure
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!isOpen) {
      setLoading(false)
    }
  }, [isOpen])

  const singularResource = useMemo(() => {
    return pluralize.singular(resource)
  }, [resource])

  const handleSubmit = useCallback(() => {
    setLoading(true)
    if (!item.ID) {
      onComplete([], item)
    } else {
      onComplete(item.ID)
    }
    if (onClose) onClose()
  }, [onComplete, item, onClose])

  const handleClose = useCallback(() => {
    if (onClose) onClose()
  }, [onClose])

  return (
    <Modal
      isOpen={Boolean(isOpen)}
      onClose={handleClose}
    >
      <ModalOverlay />
      <ModalContent>
        {loading && (
          <Center
            rounded="md"
            position="absolute"
            left={0}
            w="full"
            h="full"
            bg="whiteAlpha.500"
            zIndex={2}
            color="primary"
          >
            <Spinner></Spinner>
          </Center>
        )}
        <ModalHeader>Are you sure?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <HStack
            justifyContent="space-between"
            mb={5}
          >
            <Heading
              size="sm"
              as="h5"
            >
              Deleting <Badge>{item?.ID ?? singularResource}</Badge>{isAssignment && ' Assignment'}
            </Heading>
          </HStack>

          <Text>
            This is an irreversible, destructive action. Please make sure that you have selected the
            right {singularResource}.
          </Text>
        </ModalBody>
        <ModalFooter as={HStack}>
          <Button
            variant="ghost"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
          >
            Delete {singularResource}{isAssignment && ' Assignment'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default DeleteModal
