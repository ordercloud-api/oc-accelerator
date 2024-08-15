import {
  Card,
  CardBody,
  CardFooter,
  Center,
  Heading,
  Icon,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Category } from "ordercloud-javascript-sdk";
import { FunctionComponent } from "react";
import { TbPhoto } from "react-icons/tb";
import { Link as RouterLink } from "react-router-dom";

interface CategoryCardProps {
  category: Category;
}

const CategoryCard: FunctionComponent<CategoryCardProps> = ({ category }) => {
  return (
    <>
      {category && (
        <RouterLink
          to={`/categories/${category.ID}`}
          style={{ textDecoration: "none" }}
        >
          <Card
            minH="333px"
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
              m={0}
              p={0}
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="stretch"
            >
              <Center
                bgColor="chakra-subtle-bg"
                aspectRatio="1 / 1"
                objectFit="cover"
                boxSize="100%"
                maxH="300px"
                borderTopRadius="md"
              >
                {category.xp?.ImageUrl ? (
                  <Image
                    borderTopRadius="md"
                    boxSize="full"
                    objectFit="cover"
                    src={category.xp.ImageUrl}
                    zIndex={1}
                    onError={(e) => {
                      e.currentTarget.src = ""; // Prevent the broken image from rendering
                      e.currentTarget.style.display = "none"; // Hide the broken image
                    }}
                  />
                ) : (
                  <Icon fontSize="5rem" color="gray.300" as={TbPhoto} />
                )}
              </Center>

              <VStack w="full" minH="120px" alignItems="flex-start" p={6}>
                <Text fontSize="xs" color="chakra-subtle-text">
                  {category.ID}
                </Text>
                <Heading size="md">{category.Name}</Heading>
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
