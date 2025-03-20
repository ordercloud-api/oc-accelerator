import { useState, useEffect, useCallback, useRef } from "react";
import {
  Address,
  IntegrationEvents,
  OrderWorksheet,
  RequiredDeep,
  ShipMethod,
} from "ordercloud-javascript-sdk";

interface useShippingMethodProps {
  orderWorksheet: OrderWorksheet;
  shippingAddress: Address | null;
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
  const formRef = useRef<HTMLFormElement>(null);
  const orderIdRef = useRef(orderWorksheet?.Order?.ID);
  const addressRef = useRef(shippingAddress);

  useEffect(() => {
    orderIdRef.current = orderWorksheet?.Order?.ID;
    addressRef.current = shippingAddress;
  }, [orderWorksheet?.Order?.ID, shippingAddress]);

  const fetchShippingMethods = useCallback(async () => {
    const orderID = orderIdRef.current;
    const address = addressRef.current;

    console.log("Order ID:", orderID);
    console.log("Shipping Address:", address);

    if (!orderID || !address) {
      console.log("Missing required data for shipping methods.");
      return;
    }

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
  }, []);

  useEffect(() => {
    if (shippingAddress && Object.keys(shippingAddress).length > 0) {
      fetchShippingMethods();
    }
  }, []);

  const selectShipMethod = (index: string) => {
    setSelectedMethodIndex(index);
  };
  return {
    availableMethods,
    selectedMethodIndex,
    selectShipMethod,
    error,
    loading,
    formRef,
    validateAndFetchShippingMethods: fetchShippingMethods,
  };
};
