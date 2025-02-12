import {
  Box,
  Center,
  Heading,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalOverlay,
  UseDisclosureReturn,
} from "@chakra-ui/react";
import { FC, useRef } from "react";
import LoginForm from "./LoginForm";
import { useOrderCloudContext } from "@ordercloud/react-sdk";

interface ILoginModal {
  disclosure: UseDisclosureReturn;
}

const LoginModal: FC<ILoginModal> = ({ disclosure: {onClose, isOpen} }) => {
  const {allowAnonymous} = useOrderCloudContext();
  const initialFocusRef = useRef<HTMLInputElement>(null);
  return (
    <Modal
      size={allowAnonymous ? "lg" : "full"}
      onClose={onClose}
      isOpen={isOpen}
      initialFocusRef={initialFocusRef}
      isCentered
    >
      <ModalOverlay backdropFilter="blur(10px)" />
      <ModalContent>
        {allowAnonymous && <ModalCloseButton />}
        <ModalBody as={Center}>
          <Box w={allowAnonymous ? "full" : "400px"} maxW="100%" pt={5}>
            <Heading size="md" textAlign="center" mb={10}>
              Login {!allowAnonymous && "Required"}
            </Heading>
            <LoginForm initialFocusRef={initialFocusRef} onSuccess={onClose}/>
          </Box>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default LoginModal;
