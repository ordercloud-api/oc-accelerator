import {
  Button,
  Container,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";
import { Link as RouterLink } from "react-router-dom";
import defaultHeroImage from "../assets/default_images/default_hero_image.jpg";
import {
  DASHBOARD_HERO_CTA_LINK,
  DASHBOARD_HERO_CTA_TEXT,
  DASHBOARD_HERO_IMAGE,
  DASHBOARD_HERO_TAGLINE,
  DASHBOARD_SECONDARY_CTA_LINK,
  DASHBOARD_SECONDARY_CTA_TEXT,
  DASHBOARD_SECONDARY_DESCRIPTION,
  DASHBOARD_SECONDARY_HEADING,
  DASHBOARD_SECONDARY_IMAGE,
  DASHBOARD_TERTIARY_CTA_LINK,
  DASHBOARD_TERTIARY_CTA_TEXT,
  DASHBOARD_TERTIARY_DESCRIPTION,
  DASHBOARD_TERTIARY_HEADING,
  DASHBOARD_TERTIARY_IMAGE
} from "../constants";

import defaultImage1 from "../assets/default_images/default_image_1.jpg";
import defaultImage2 from "../assets/default_images/default_image_2.jpg";
import defaultImage3 from "../assets/default_images/default_image_3.jpg";
import defaultImage4 from "../assets/default_images/default_image_4.jpg";
import defaultImage5 from "../assets/default_images/default_image_5.jpg";
import defaultImage6 from "../assets/default_images/default_image_6.jpg";
import defaultImage7 from "../assets/default_images/default_image_7.jpg";
import defaultImage8 from "../assets/default_images/default_image_8.jpg";

const defaultImages = [
  defaultImage1,
  defaultImage2,
  defaultImage3,
  defaultImage4,
  defaultImage5,
  defaultImage6,
  defaultImage7,
  defaultImage8,
];

const Dashboard: FC = () => {
  const getDefaultImage = () => {
    const randomIndex = Math.floor(Math.random() * defaultImages.length);
    return defaultImages[randomIndex];
  };

  return (
    <Container maxW="full">
      <SimpleGrid gridTemplateColumns={{ lg: "1fr 2fr" }}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          gap={6}
          px={{ base: 12, lg: "24" }}
          minH={{ base: "40vh", lg: "unset%" }}
        >
          <Heading maxW={{ lg: "sm" }} size="4xl" as="h1">
            {DASHBOARD_HERO_TAGLINE}
          </Heading>
          {DASHBOARD_HERO_CTA_LINK && (
            <Button size="sm" mt={8} onClick={DASHBOARD_HERO_CTA_LINK}>
              {DASHBOARD_HERO_CTA_TEXT}
            </Button>
          )}
        </Stack>
        <Image
          h="75dvh"
          w="full"
          objectFit="cover"
          objectPosition="center center"
          src={DASHBOARD_HERO_IMAGE || defaultHeroImage}
          alt="homepage hero"
        />
      </SimpleGrid>
      <SimpleGrid gridTemplateColumns={{ lg: "1fr 1fr" }}>
        <Image
          h="75dvh"
          w="full"
          objectFit="cover"
          objectPosition="center center"
          src={DASHBOARD_SECONDARY_IMAGE || getDefaultImage()}
          alt="homepage hero"
        />
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          gap={6}
          px={{ base: 12, lg: 12 }}
          minH={{ base: "40vh", lg: "unset%" }}
          maxW="prose"
        >
          <Heading>{DASHBOARD_SECONDARY_HEADING}</Heading>
          <Text>{DASHBOARD_SECONDARY_DESCRIPTION}</Text>
          {DASHBOARD_SECONDARY_CTA_LINK && (
            <Button
              as={RouterLink}
              to={DASHBOARD_SECONDARY_CTA_LINK}
              mt={6}
              variant="outline"
              colorScheme="secondary"
            >
              {DASHBOARD_SECONDARY_CTA_TEXT}
            </Button>
          )}
        </Stack>
      </SimpleGrid>
      <SimpleGrid gridTemplateColumns={{ lg: "1fr 1fr" }}>
        <Stack
          direction="column"
          justifyContent="center"
          alignItems="flex-start"
          gap={6}
          px={{ base: 12, lg: 24 }}
          minH={{ base: "40vh", lg: "unset" }}
          maxW="prose"
        >
          <Heading>{DASHBOARD_TERTIARY_HEADING}</Heading>
          <Text>{DASHBOARD_TERTIARY_DESCRIPTION}</Text>
          {DASHBOARD_TERTIARY_CTA_LINK && (
            <Button
              as={RouterLink}
              to={DASHBOARD_TERTIARY_CTA_LINK}
              mt={6}
              variant="outline"
              colorScheme="secondary"
            >
              {DASHBOARD_TERTIARY_CTA_TEXT}
            </Button>
          )}
        </Stack>
        <Image
          h="75dvh"
          w="full"
          objectFit="cover"
          objectPosition="center center"
          src={DASHBOARD_TERTIARY_IMAGE || getDefaultImage()}
          alt="homepage hero"
        />
      </SimpleGrid>
    </Container>
  );
};

export default Dashboard;
