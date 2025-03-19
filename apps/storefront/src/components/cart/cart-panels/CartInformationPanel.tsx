import {
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { Address } from "ordercloud-javascript-sdk";
import { Dispatch, SetStateAction, useState } from "react";

type CartInformationPanelProps = {
  shippingAddress: Address;
  setShippingAddress: Dispatch<SetStateAction<Address>>;
  handleSaveShippingAddress: () => void;
};

export const CartInformationPanel = ({
  shippingAddress,
  setShippingAddress,
  handleSaveShippingAddress,
}: CartInformationPanelProps) => {
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const validateFields = () => {
    const newErrors: Record<string, boolean> = {};
    const requiredFields = [
      "FirstName",
      "LastName",
      "Street1",
      "City",
      "State",
      "Zip",
      "Phone",
    ] as const;

    requiredFields.forEach((field) => {
      if (!shippingAddress?.[field]) {
        newErrors[field] = true;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormSubmit = () => {
    if (validateFields()) {
      handleSaveShippingAddress();
    }
  };

  return (
    <VStack alignItems="stretch" as="form">
      <Stack direction={["column", "row"]} spacing={6}>
        <FormControl flexBasis="75%" isInvalid={errors.Phone} isRequired>
          <FormLabel>Phone</FormLabel>
          <Input
            placeholder="Phone"
            value={shippingAddress?.Phone || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                Phone: e.target.value,
              })
            }
          />
          {errors.Phone && (
            <FormErrorMessage>Phone is required.</FormErrorMessage>
          )}
        </FormControl>
      </Stack>

      <Heading size="md" my={6}>
        Shipping address
      </Heading>

      <Stack direction={["column", "row"]} spacing={6}>
        <FormControl isRequired isInvalid={errors.FirstName}>
          <FormLabel>First Name</FormLabel>
          <Input
            placeholder="Enter first name"
            value={shippingAddress?.FirstName || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                FirstName: e.target.value,
              })
            }
          />
          {errors.FirstName && (
            <FormErrorMessage>First Name is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl isRequired isInvalid={errors.LastName}>
          <FormLabel>Last Name</FormLabel>
          <Input
            placeholder="Enter last name"
            value={shippingAddress?.LastName || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                LastName: e.target.value,
              })
            }
          />
          {errors.LastName && (
            <FormErrorMessage>Last Name is required.</FormErrorMessage>
          )}
        </FormControl>
      </Stack>

      <FormControl>
        <FormLabel>Company (optional)</FormLabel>
        <Input
          placeholder="Enter company name"
          value={shippingAddress?.CompanyName || ""}
          onChange={(e) =>
            setShippingAddress({
              ...shippingAddress,
              CompanyName: e.target.value,
            })
          }
        />
      </FormControl>

      <HStack gap="6">
        <FormControl isRequired isInvalid={errors.Street1}>
          <FormLabel>Street 1</FormLabel>
          <Input
            placeholder="Enter street"
            value={shippingAddress?.Street1 || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                Street1: e.target.value,
              })
            }
          />
          {errors.Street1 && (
            <FormErrorMessage>Street 1 is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl flexBasis="75%">
          <FormLabel>Street 2</FormLabel>
          <Input
            placeholder="Enter address"
            value={shippingAddress?.Street2 || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                Street2: e.target.value,
              })
            }
          />
        </FormControl>
      </HStack>

      <Stack direction={["column", "row"]} spacing={6}>
        <FormControl isRequired isInvalid={errors.City}>
          <FormLabel>City</FormLabel>
          <Input
            placeholder="Enter city"
            value={shippingAddress?.City || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                City: e.target.value,
              })
            }
          />
          {errors.City && (
            <FormErrorMessage>City is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl isRequired isInvalid={errors.State}>
          <FormLabel>State</FormLabel>
          <Select
            placeholder="Select state/territory"
            value={shippingAddress?.State || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                State: e.target.value,
              })
            }
          >
            <option value="MN">Minnesota</option>
          </Select>
          {errors.State && (
            <FormErrorMessage>State is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl flexBasis="50%" isRequired isInvalid={errors.Zip}>
          <FormLabel>Zip</FormLabel>
          <Input
            placeholder="Enter zip"
            value={shippingAddress?.Zip || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                Zip: e.target.value,
              })
            }
          />
          {errors.Zip && <FormErrorMessage>Zip is required.</FormErrorMessage>}
        </FormControl>
      </Stack>

      <Button alignSelf="flex-end" onClick={handleFormSubmit} mt={6}>
        Continue to shipping
      </Button>
    </VStack>
  );
};