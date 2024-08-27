import {
  Box,
  Container,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  UseDisclosureProps,
} from "@chakra-ui/react";
import Case from "case";
import pluralize from "pluralize";
import { FC, useCallback, useMemo, useRef } from "react";
import OperationForm from "../../OperationForm";
import { useLocation, useNavigate, useParams } from "react-router-dom";

interface CreateDrawerProps {
  resourceId: string;
  disclosure: UseDisclosureProps;
  operation?: any;
}

export const CreateModal: FC<CreateDrawerProps> = ({
  resourceId,
  disclosure
}) => {
  const { isOpen, onClose } = disclosure;
  const params = useParams()
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const submitButtonRef = useRef<HTMLDivElement>(null);

  const resourceName = useMemo(() => {
    return pluralize.singular(Case.title(resourceId)).toLocaleLowerCase();
  }, [resourceId]);

  const handleAfterSubmit = useCallback(
    (newItem: any) => {
      // need check for resources without native ID property
      if (
        newItem?.ID
      ) {
        if (onClose) onClose();
        navigate(
          { pathname: `${pathname}/${newItem.ID}` },
          { state: { shallow: true } }
        );
      } else {
        if (onClose) onClose();
      }
    },
    [onClose, pathname, navigate]
  );

  const operationId = useMemo(() => {
    return `${resourceId}.Create`;
  }, [resourceId]);

  const handleClose = useCallback(() => {
    if (onClose) onClose();
  }, [onClose]);

  return (
    <Modal isOpen={Boolean(isOpen)} onClose={handleClose} size="full">
      <ModalOverlay />
      <ModalContent rounded="none">
        <ModalHeader
          as={Container}
          px={2}
          maxW="2xl"
          borderBottom="1px"
          borderColor="chakra-border-color"
        >
          {`Create a new ${resourceName}`}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Container maxW="2xl" px={2}>
            <OperationForm
              operationId={operationId}
              initialValues={{
                parameters: params,
              }}
              submitButtonRef={submitButtonRef}
              afterSubmit={handleAfterSubmit}
              showReadOnlyFields={false}
            />
          </Container>
        </ModalBody>
        <ModalFooter
          as={Container}
          px={2}
          maxW="2xl"
          borderTop="1px"
          borderColor="chakra-border-color"
        >
          <Box ref={submitButtonRef} />
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
