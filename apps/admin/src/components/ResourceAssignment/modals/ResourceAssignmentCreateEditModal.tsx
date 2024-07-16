import {
  Box,
  Button,
  ButtonGroup,
  Center,
  Container,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  Spinner,
  UseDisclosureProps,
} from "@chakra-ui/react";
import { pickBy } from "lodash";
import { FC, useCallback, useEffect, useRef, useState } from "react";
import OperationForm from "../../OperationForm";

interface IResourceAssignmentCreateEditModal {
  disclosure: UseDisclosureProps;
  onComplete: (newAssignment: any) => void;
  onDiscard: () => void;
  assignmentIdKey?: string;
  bodyFieldsToHide?: string[];
  assignedItemIDs?: string[];
  existingAssignmentBody?: any;
  saveAssignmentOperationId: string;
  operationParams?: object;
  isCreatingNew: boolean;
  configOptions?: string[];
  operationInclusion?: string;
}

const ResourceAssignmentCreateEditModal: FC<
  IResourceAssignmentCreateEditModal
> = ({
  disclosure,
  onComplete,
  onDiscard,
  assignmentIdKey,
  bodyFieldsToHide = [],
  existingAssignmentBody,
  saveAssignmentOperationId,
  operationParams = {},
  isCreatingNew,
  configOptions,
  operationInclusion,
}) => {
  const assignmentBtnRef = useRef<HTMLDivElement>(null);
  const { isOpen, onClose } = disclosure;
  const [loading, setLoading] = useState(false);
  if (isCreatingNew) {
    bodyFieldsToHide = bodyFieldsToHide.filter((f) => f !== assignmentIdKey);
  } else {
    bodyFieldsToHide = [
      ...bodyFieldsToHide,
      ...Object.keys(
        pickBy(existingAssignmentBody, (_val, key) => {
          if (key === "PriceScheduleID") return false;
          return key.includes("ID") && !configOptions?.includes(key);
        })
      ),
    ];
  }

  useEffect(() => {
    if (!isOpen) {
      setLoading(false);
    }
  }, [isOpen]);

  const success = useCallback(
    (newAssignment: any) => {
      setLoading(true);
      onComplete(newAssignment);
      if (onClose) onClose();
    },
    [onComplete, onClose]
  );

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  return (
    <Modal size="full" isOpen={Boolean(isOpen)} onClose={handleClose}>
      <ModalOverlay />
      <ModalContent rounded="none">
        {loading && (
          <Center
            rounded="md"
            position="absolute"
            left={0}
            w="full"
            h="full"
            bg="whiteAlpha.500"
            zIndex={2}
            color="teal"
          >
            <Spinner></Spinner>
          </Center>
        )}
        <ModalCloseButton />
        <ModalBody display="grid" placeItems="center center" h="100%">
          <Container
            h="100%"
            maxW="container.xl"
            display="flex"
            flexFlow="column nowrap"
            p={12}
          >
            <Heading as="h1" size="xl" mb={6}>
              {!isCreatingNew ? "Edit" : "Create"} Assignment
            </Heading>
            <OperationForm
              operationId={saveAssignmentOperationId}
              bodyFieldsToHide={bodyFieldsToHide}
              initialValues={{
                parameters: operationParams,
                body: existingAssignmentBody,
              }}
              submitButtonRef={assignmentBtnRef}
              afterSubmit={success}
              isAssignment={true}
              operationInclusion={operationInclusion}
            />
            <Container maxW="2xl" ml={0} padding={0}></Container>
            <ButtonGroup gap={3} mt="auto" alignSelf="flex-end">
              <Button
                variant="ghost"
                onClick={() => {
                  onDiscard();
                }}
              >
                Discard changes
              </Button>
              <Box ref={assignmentBtnRef}></Box>
            </ButtonGroup>
          </Container>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default ResourceAssignmentCreateEditModal;
