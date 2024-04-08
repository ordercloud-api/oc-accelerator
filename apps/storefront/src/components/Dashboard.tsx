import { Container, Heading } from "@chakra-ui/react";
import { FC } from "react";
import { useCurrentUser } from "../hooks/currentUser";

const Dashboard: FC = () => {
  const {data:user} = useCurrentUser()

  return (
    <Container maxW="full">
      <Heading size="md" py={5}>
        Dashboard
      </Heading>
      {user && <pre>{JSON.stringify(user, null, 2)}</pre>}
    </Container>
  );
};

export default Dashboard;
