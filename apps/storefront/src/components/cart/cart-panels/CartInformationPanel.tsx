import {
  Button,
  FormControl,
  FormErrorMessage,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { Address } from "ordercloud-javascript-sdk";
import { Dispatch, SetStateAction, useState } from "react";
import { DebouncedInput } from "../../shared/DebouncedInput";
import { US_STATES } from "../../../constants";

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
  const [formErrors, setFormErrors] = useState<Record<string, boolean>>({});

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, ""); // Remove all non-digit characters
    const trimmed = cleaned.slice(0, 10); // Limit to 10 digits
    const match = trimmed.match(/^(\d{0,3})(\d{0,3})(\d{0,4})$/); // Format for display

    if (!match) return trimmed;

    const [, area, prefix, line] = match;

    if (!area) return "";
    if (!prefix) return `(${area}`;
    if (!line) return `(${area}) ${prefix}`;

    return `(${area}) ${prefix}-${line}`;
  };

  const handlePhoneChange = (value: string | number) => {
    const rawValue = value.toString().replace(/\D/g, "").slice(0, 10);
    setShippingAddress({
      ...shippingAddress,
      Phone: rawValue,
    });
    setFormErrors((prev) => ({
      ...prev,
      Phone: rawValue.length !== 10,
    }));
  };

  const validateFields = () => {
    const newErrors: Record<string, boolean> = {};
    const requiredFields = ["Street1", "City", "State", "Zip"] as const;

    requiredFields.forEach((field) => {
      if (!shippingAddress?.[field]) {
        newErrors[field] = true;
      }
    });

    setFormErrors(newErrors);
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
        <DebouncedInput
          name="Phone"
          placeholder="Enter phone number"
          value={formatPhoneNumber(shippingAddress?.Phone || "")}
          onChange={handlePhoneChange}
        />
      </Stack>

      <Heading size="md" my={6}>
        Shipping address
      </Heading>

      <Stack direction={["column", "row"]} spacing={6}>
        <FormControl isInvalid={formErrors.FirstName}>
          <FormLabel>First Name</FormLabel>
          <Input
            name="FirstName"
            placeholder="Enter first name"
            value={shippingAddress?.FirstName || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                FirstName: e.target.value,
              })
            }
          />
          {formErrors.FirstName && (
            <FormErrorMessage>First Name is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl isInvalid={formErrors.LastName}>
          <FormLabel>Last Name</FormLabel>
          <Input
            name="LastName"
            placeholder="Enter last name"
            value={shippingAddress?.LastName || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                LastName: e.target.value,
              })
            }
          />
          {formErrors.LastName && (
            <FormErrorMessage>Last Name is required.</FormErrorMessage>
          )}
        </FormControl>
      </Stack>

      <FormControl>
        <FormLabel>Company (optional)</FormLabel>
        <Input
          name="CompanyName"
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
        <FormControl isRequired isInvalid={formErrors.Street1}>
          <FormLabel>Street 1</FormLabel>
          <Input
            name="Street1"
            placeholder="Enter street"
            value={shippingAddress?.Street1 || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                Street1: e.target.value,
              })
            }
          />
          {formErrors.Street1 && (
            <FormErrorMessage>Street 1 is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl flexBasis="75%">
          <FormLabel>Street 2</FormLabel>
          <Input
            name="Street2"
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
        <FormControl isRequired isInvalid={formErrors.City}>
          <FormLabel>City</FormLabel>
          <Input
            name="City"
            placeholder="Enter city"
            value={shippingAddress?.City || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                City: e.target.value,
              })
            }
          />
          {formErrors.City && (
            <FormErrorMessage>City is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl isRequired isInvalid={formErrors.State}>
          <FormLabel>State</FormLabel>
          <Select
            name="State"
            placeholder="Select state"
            value={shippingAddress?.State || ""}
            onChange={(e) =>
              setShippingAddress({
                ...shippingAddress,
                State: e.target.value,
              })
            }
          >
            {US_STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </Select>
          {formErrors.State && (
            <FormErrorMessage>State is required.</FormErrorMessage>
          )}
        </FormControl>

        <FormControl flexBasis="50%" isRequired isInvalid={formErrors.Zip}>
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
          {formErrors.Zip && (
            <FormErrorMessage>Zip is required.</FormErrorMessage>
          )}
        </FormControl>
      </Stack>

      <Button alignSelf="flex-end" onClick={handleFormSubmit} mt={6}>
        Continue to shipping
      </Button>
    </VStack>
  );
};
