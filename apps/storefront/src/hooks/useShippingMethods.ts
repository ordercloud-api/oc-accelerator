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

const hasRequiredFields = (
  address: Address | null,
  formElements: HTMLFormElement | null
): boolean => {
  if (!address || !formElements) return false;

  const requiredFields = Array.from(formElements.elements).filter(
    (el) => el instanceof HTMLInputElement && el.required
  );

  return requiredFields.every((field) => {
    const key = (field as HTMLInputElement).name;
    return address[key as keyof Address];
  });
};

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

  const fetchShippingMethods = useCallback(async () => {
    const orderID = orderWorksheet?.Order?.ID;

    if (!orderID || !shippingAddress || !hasRequiredFields(shippingAddress, formRef.current)) {
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
    formRef,
  };
};
