import { Card, CardBody, Text, VStack } from "@chakra-ui/react";
import { LineItem } from "ordercloud-javascript-sdk";
import { FunctionComponent } from "react";
import OcLineItemCard from "./OcLineItemCard";

interface OcLineItemListProps {
  emptyMessage?: string;
  editable?: boolean;
  lineItems?: LineItem[];
  onChange: (newLineItem: LineItem) => void;
}

const OcLineItemList: FunctionComponent<OcLineItemListProps> = ({
  emptyMessage,
  editable,
  lineItems,
  onChange,
}) => {
  return lineItems && lineItems.length ? (
    <VStack gap={6} alignItems="flex-start" w="full">
      <Card
        variant="outline"
        w="full"
        mt={-4}
        rounded="none"
        bgColor="blackAlpha.100"
        borderColor="transparent"
      >
        <CardBody display="flex" flexDirection="column" gap={2}>
          {lineItems.map((li, idx) => (
            <OcLineItemCard
              key={idx}
              lineItem={li}
              editable={editable}
              onChange={onChange}
            />
          ))}
        </CardBody>
      </Card>
    </VStack>
  ) : (
    <Text alignSelf="flex-start">{emptyMessage}</Text>
  );
};

export default OcLineItemList;
