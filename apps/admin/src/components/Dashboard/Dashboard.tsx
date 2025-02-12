import { CheckIcon, CloseIcon, EmailIcon, PhoneIcon } from "@chakra-ui/icons";
import {
  Badge,
  Card,
  Container,
  HStack,
  Heading,
  SimpleGrid,
  Text,
} from "@chakra-ui/react";
import { useOrderCloudContext } from "@ordercloud/react-sdk";
import { FC } from "react";
import { useCurrentUser } from "../../hooks/currentUser";

const Dashboard: FC = () => {
  const { data: user } = useCurrentUser();
  const ocContext = useOrderCloudContext();

  return (
    <Container maxW="full" p={8}>
      <Heading as="h1" size="lg" color="chakra-subtle-text">
        Dashboard
      </Heading>
      <SimpleGrid
        gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
        gap={6}
        mt={6}
      >
        <Card variant="outline" p={6}>
          <Text color="chakra-subtle-text">My User:</Text>
          <Text>
            {user?.FirstName} {user?.LastName}
            <Text
              ml="3"
              display="inline"
              color="chakra-subtle-text"
              fontFamily="monospace"
            >
              ({user?.ID})
            </Text>
          </Text>
          <HStack>
            <Text>
              <Text display="inline" color="chakra-subtle-text">
                Active:
              </Text>
              {user?.Active === true ? (
                <CheckIcon mx="2" color="green.500" />
              ) : (
                <CloseIcon mx="2" color="red.500" />
              )}
              {user?.Active.toString()}
            </Text>
          </HStack>
        </Card>
        <Card variant="outline" p={6}>
          <Text color="chakra-subtle-text">Contact:</Text>
          <Text display="flex" gap={3} alignItems="center">
            <EmailIcon color="chakra-placeholder-color" />
            {user?.Email}
          </Text>
          {user?.Phone && (
            <Text display="flex" gap={3} alignItems="center">
              <PhoneIcon color="chakra-placeholder-color" />
              {user?.Phone?.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3")}
            </Text>
          )}
        </Card>
        <Card variant="outline" p={6}>
          <Text color="chakra-subtle-text">Seller ID:</Text>
          <Text>{user?.Seller.ID}</Text>
        </Card>
        <Card variant="outline" p={6} alignItems="flex-start" gap={3}>
          <Text mb={-2} color="chakra-subtle-text">
            Available roles:
          </Text>
          <HStack gap={2} flexWrap="wrap">
            {user?.AvailableRoles.map((role, idx) => (
              <Badge w="min-content" key={idx}>
                {role}
              </Badge>
            ))}
          </HStack>
        </Card>
        <Card variant="outline" p={6} alignItems="flex-start" gap={3}>
          <Text mb={-2} color="chakra-subtle-text">
            OrderCloud Base API URL
          </Text>
          <Text>{ocContext?.baseApiUrl}</Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
};

export default Dashboard;
