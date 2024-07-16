import { Flex, Spinner } from '@chakra-ui/react'
import { useIsFetching } from '@tanstack/react-query'

const GlobalLoadingIndicator = () => {
  const isFetching = useIsFetching()

  return isFetching ? (
    <Flex
      w="100dvw"
      h="100dvh"
      position="fixed"
      inset="0"
      zIndex="3"
      bgColor="rbga(255,255,255,.05)"
      alignItems="center"
      justifyContent="center"
      backdropFilter="blur(5px)"
    >
      <Spinner
        size="xl"
        thickness="10px"
        colorScheme="primary"
      />
    </Flex>
  ) : null
}

export default GlobalLoadingIndicator
