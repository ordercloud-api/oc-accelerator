import {
  Card,
  CardBody,
  CardFooter,
  Heading,
  Text,
  VStack
} from "@chakra-ui/react";
import { Category } from "ordercloud-javascript-sdk";
import { FunctionComponent } from "react";
import { Link as RouterLink } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
  catalogId?: string;
}

const CategoryCard: FunctionComponent<CategoryCardProps> = ({
  category,
  catalogId,
}) => {
  return (
    <>
      {category && (
        <RouterLink
          to={category.ChildCount ? `/shop/${catalogId}/categories/${category.ID}` : `/shop/${catalogId}/categories/${category.ID}/products`}
          style={{ textDecoration: "none" }}
        >
          <Card
            minH="133px"
            p={0}
            m={0}
            display="flex"
            h="full"
            transition="all .15s ease"
            border="1px solid transparent"
            _hover={{
              shadow: "md",
              transform: "translateY(-1px)",
              borderColor: "primary.100",
            }}
          >
            <CardBody
              display="flex"
              flexDirection="column"
              alignItems="flex-start"
              justifyContent="flex-end"
            >
              <VStack alignItems="flex-start" gap={0}>
                <Heading size="lg" fontWeight="medium" lineHeight="1.1">
                  {category.Name}
                </Heading>
                {/* TODO: would be cool to get the product list length here but not necessary */}
                {/* <Text color="chakra-subtle-text">
                  {category.ChildCount} items
                </Text> */}
              </VStack>
            </CardBody>
            {category.xp?.Description && (
              <CardFooter
                h="2rem"
                py={0}
                bgColor="blackAlpha.50"
                display="flex"
                alignItems="center"
                justifyContent="flex-end"
              >
                <Text fontWeight="normal" fontSize="sm">
                  {category.xp.Description}
                </Text>
              </CardFooter>
            )}
          </Card>
        </RouterLink>
      )}
    </>
  );
};

export default CategoryCard;
