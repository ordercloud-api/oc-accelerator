import { useState, useEffect, useCallback } from "react";
import {
  Address,
  IntegrationEvents,
  OrderWorksheet,
  RequiredDeep,
  ShipMethod,
} from "ordercloud-javascript-sdk";

interface useShippingMethodProps {
  orderWorksheet: OrderWorksheet;
  shippingAddress: Address;
}

export const useShippingMethods = ({
  orderWorksheet,
  shippingAddress,
}: useShippingMethodProps) => {
  const [availableMethods, setAvailableMethods] = useState<
    RequiredDeep<ShipMethod<unknown>>[]
  >([]);
  const [selectedMethodIndex, setSelectedMethodIndex] = useState<string | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchShippingMethods = useCallback(async () => {
    const orderID = orderWorksheet?.Order?.ID;
    if (!orderID || !shippingAddress) return;

    setLoading(true);
    try {
      const worksheet = await IntegrationEvents.GetWorksheet(
        "Outgoing",
        orderID
      );
      const methods =
        worksheet?.ShipEstimateResponse?.ShipEstimates?.[0]?.ShipMethods || [];

      setAvailableMethods(methods);

      if (methods.length > 0) {
        setSelectedMethodIndex("0");
      }
    } catch (err) {
      const error = err as Error;
      console.error("Failed to fetch shipping estimates:", error);
      setError(error);
    } finally {
      setLoading(false);
    }
  }, [orderWorksheet, shippingAddress]);

  useEffect(() => {
    fetchShippingMethods();
  }, [fetchShippingMethods]);

  const selectShipMethod = (index: string) => {
    setSelectedMethodIndex(index);
  };

  return {
    availableMethods,
    selectedMethodIndex,
    selectShipMethod,
    error,
    loading,
  };
};
