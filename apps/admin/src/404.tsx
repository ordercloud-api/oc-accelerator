import { Button, Card, Heading, SimpleGrid } from '@chakra-ui/react'
import { Link } from 'react-router-dom'

export const NotFoundPage = () => (
  <SimpleGrid
    w="100dvw"
    h="100dvh"
    placeItems="center center"
  >
    <Card
      variant="unstyled"
      mt={-24}
      p={8}
      alignItems="center"
    >
      <Heading
        as="h1"
        fontSize="8vw"
        color="chakra-subtle-text"
      >
        404
      </Heading>
      <Heading
        mt={-5}
        mb={4}
      >
        Page not found
      </Heading>
      <Button
        as={Link}
        to="/"
      >
        Back to dashboard
      </Button>
    </Card>
  </SimpleGrid>
)
