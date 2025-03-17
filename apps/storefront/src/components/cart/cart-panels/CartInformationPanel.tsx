import {
  Button,
  FormControl,
  FormLabel,
  Heading,
  HStack,
  Input,
  Select,
  Stack,
  VStack,
} from "@chakra-ui/react";
import { Address } from "ordercloud-javascript-sdk";
import { Dispatch, SetStateAction } from "react";

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
  return (
    <VStack alignItems="stretch">
      <Stack direction={["column", "row"]} spacing={6}>
        <FormControl flexBasis="75%">
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
        </FormControl>
      </Stack>

      <Heading size="md" my={6}>
        Shipping address
      </Heading>

      <Stack direction={["column", "row"]} spacing={6}>
        <FormControl>
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
        </FormControl>
        <FormControl>
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
        <FormControl>
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
        </FormControl>
        <FormControl flexBasis={"75%"}>
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
        <FormControl>
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
        </FormControl>
        <FormControl>
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
        </FormControl>

        <FormControl flexBasis="50%">
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
        </FormControl>
      </Stack>

      <Button alignSelf="flex-end" onClick={handleSaveShippingAddress} mt={6}>
        Continue to shipping
      </Button>
    </VStack>
  );
};
