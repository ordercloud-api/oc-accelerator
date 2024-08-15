import { Box, Button, Container, Heading, Image, SimpleGrid, Stack } from "@chakra-ui/react";
import { FC } from "react";
import { useCurrentUser } from "../hooks/currentUser";


const Dashboard: FC = () => {
  const { data: user } = useCurrentUser();

  return (
    <Container maxW="full">
      <SimpleGrid gridTemplateColumns={{ xl: "1fr 2fr" }}>
        <Stack direction="column" justifyContent="center" alignItems="flex-start" gap={6} pl="25%">
          <Heading maxW="xs" size="2xl">
            Insert Your Brand's Tagline.
          </Heading>
          <Button size="sm">Call to action</Button>
        </Stack>
        <Image
          h="75dvh"
          w="full"
          objectFit="cover"
          objectPosition="center center"
          src="https://images.unsplash.com/photo-1620987278429-ab178d6eb547?q=80&w=3750&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="homepage hero"
        />
      </SimpleGrid>
    </Container>
  );
};

export default Dashboard;
