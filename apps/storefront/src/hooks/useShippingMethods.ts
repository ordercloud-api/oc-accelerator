import { useShopper } from "@ordercloud/react-sdk";
import {
  IntegrationEvents,
  OrderShipMethodSelection,
  ShipMethodSelection,
} from "ordercloud-javascript-sdk";
import { useState } from "react";

export const useShippingMethods = () => {
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const { orderWorksheet } = useShopper();

  const selectShipMethods = async (shipMethodID: string) => {
    setLoading(true);
    const ShipMethodSelection: ShipMethodSelection = {
      ShipEstimateID:
        orderWorksheet?.ShipEstimateResponse.ShipEstimates.at(0)?.ID,
      ShipMethodID: shipMethodID,
    };
    const shipMethodSelection: OrderShipMethodSelection = {
      ShipMethodSelections: [ShipMethodSelection],
    };
    if (!orderWorksheet) return;
    try {
      await IntegrationEvents.SelectShipmethods(
        "Outgoing",
        orderWorksheet?.Order.ID,
        shipMethodSelection
      );
      setLoading(false);
    } catch (err) {
      console.error("Failed to save shipping address:", err);
      setLoading(false);
      setError(err as Error);
    }
  };

  return {
    error,
    selectShipMethods,
    loading,
  };
};
