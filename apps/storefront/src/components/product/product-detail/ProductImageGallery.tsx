import {
  Button,
  Center,
  Flex,
  HStack,
  Icon,
  Image,
  VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { TbPhoto } from "react-icons/tb";

type ProductImage = {
  ThumbnailUrl?: string;
  Url: string;
};

interface ProductImageGalleryProps {
  images: ProductImage[];
}

const ProductImageGallery: React.FC<ProductImageGalleryProps> = ({
  images,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [error, setError] = useState(false);

  if (!images.length || error) {
    return (
      <Center
        bgColor="chakra-subtle-bg"
        objectFit="contain"
        boxSize="100%"
        maxH="50vh"
      >
        <Icon fontSize="5rem" color="gray.300" as={TbPhoto} />
      </Center>
    );
  }

  return (
    <HStack
      bgColor="chakra-subtle-bg"
      maxH="75vh"
      alignItems="flex-start"
      justifyContent="flex-start"
      gap={3}
      zIndex={0}
    >
      {images.length > 1 && (
        <VStack
          maxH="100%"
          gap={2}
          overflowY="auto"
          justifyContent="flex-start"
          pr="4"
          zIndex={2}
        >
          {images.map((image, idx) => (
            <Button
              key={idx}
              boxSize="full"
              variant="unstyled"
              onClick={() => {
                setSelectedIndex(idx);
                setError(false);
              }}
              _hover={{ transform: "scale(1.025)" }}
              transition="transform 0.2s ease"
              isActive={idx === selectedIndex}
              border="3px solid transparent"
              _active={{ borderColor: "primary" }}
            >
              <Image
                boxSize="60px"
                objectFit="cover"
                src={image.ThumbnailUrl || image.Url}
              />
            </Button>
          ))}
        </VStack>
      )}
      <Flex
        flex="1"
        maxH="75vh"
        alignItems="flex-start"
        justifyContent="flex-start"
      >
        <Image
          w="full"
          maxH="75vh"
          objectFit="contain"
          src={images[selectedIndex]?.ThumbnailUrl || images[selectedIndex]?.Url}
          onError={() => setError(true)}
        />
      </Flex>
    </HStack>
  );
};

export default ProductImageGallery;
