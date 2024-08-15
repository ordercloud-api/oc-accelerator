import {
  Button,
  Container,
  Heading,
  Icon,
  Text,
} from "@chakra-ui/react";
import { Link } from "react-router-dom";
import { TbCircleCheck } from "react-icons/tb";

export const OrderSummary = (): JSX.Element => {

  return (
    <Container centerContent size="xl">
    <Heading size="lg" m={5}><Icon color="green" mr={3} as={TbCircleCheck} />Thank you for your order!</Heading>
    <Text>Your order has been placed and is being processed.</Text>
    <Button as={Link} to={'/products'} m={5}>Continue Shopping</Button>
    </Container>
  );
};
