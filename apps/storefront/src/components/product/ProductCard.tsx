import {
  Card,
  CardBody,
  Center,
  Heading,
  Icon,
  Image,
  Text,
  VStack,
} from "@chakra-ui/react";
import { BuyerProduct } from "ordercloud-javascript-sdk";
import { FunctionComponent } from "react";
import { TbPhoto } from "react-icons/tb";
import { Link as RouterLink } from "react-router-dom";
import formatPrice from "../../utils/formatPrice";

interface ProductCardProps {
  product: BuyerProduct;
}

const ProductCard: FunctionComponent<ProductCardProps> = ({ product }) => {
  return (
    <>
      {product && (
        <RouterLink
          to={`/products/${product.ID}`}
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
                {product.xp?.Images &&
                (product.xp.Images[0]?.ThumbnailUrl ||
                  product.xp.Images[0]?.Url) ? (
                  <Image
                    borderTopRadius="md"
                    boxSize="full"
                    objectFit="cover"
                    src={
                      product.xp.Images[0]?.ThumbnailUrl ||
                      product.xp.Images[0]?.Url
                    }
                    zIndex={1}
                    bgColor="white"
                    onError={(e) => {
                      e.currentTarget.src = ""; // Prevent the broken image from rendering
                      e.currentTarget.style.display = "none"; // Hide the broken image
                    }}
                  />
                ) : (
                  <Icon fontSize="5rem" color="gray.300" as={TbPhoto} />
                )}
                <Icon
                  fontSize="5rem"
                  color="gray.300"
                  as={TbPhoto}
                  position="absolute"
                />
              </Center>

              <VStack w="full" minH={"120px"} alignItems="flex-start" p={6}>
                <Text fontSize="xs" color="chakra-subtle-text">
                  {product.ID}
                </Text>
                <Heading size="lg">{product.Name}</Heading>
                {product.PriceSchedule?.PriceBreaks && (
                  <Text fontSize="md" fontWeight="normal">
                    {formatPrice(
                      product?.PriceSchedule?.PriceBreaks[0].Price ?? 0
                    )}
                  </Text>
                )}
              </VStack>
            </CardBody>
          </Card>
        </RouterLink>
      )}
    </>
  );
};

export default ProductCard;
