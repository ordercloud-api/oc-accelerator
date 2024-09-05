import { Container, Grid, GridItem, Skeleton } from "@chakra-ui/react";
import React from "react";


const CartSkeleton: React.FC = () => {

  return (
    <Grid
      gridTemplateColumns={{ md: "3fr 2fr" }}
      w="full"
      justifyItems="stretch"
      flex="1"
    >
      <GridItem alignSelf="flex-end" h="full">
        <Container maxW="container.lg" mx="0" ml="auto" p={{ base: 6, lg: 12 }}>
          <Skeleton w="full" h="200px" rounded="none" />
          <Skeleton w="full" h="400px" rounded="none" my={6} />
          <Skeleton w="full" h="100px" rounded="none" />
        </Container>
      </GridItem>

      <GridItem h="full">
        <Container maxW="container.sm" mx="0" mr="auto" p={{ base: 6, lg: 12 }}>
          <Skeleton rounded="none" w="full" h="200px" />
          <Skeleton rounded="none" w="full" h="525px" mt={6} />
        </Container>
      </GridItem>
    </Grid>
  );
};

export default CartSkeleton;
