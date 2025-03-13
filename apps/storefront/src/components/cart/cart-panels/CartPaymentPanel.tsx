import { Button } from "@chakra-ui/react";
import { useMemo } from "react";
import { PAYMENT_PROVIDER } from "../../../constants";
import { BlueSnap } from "../payment/BlueSnap";
import { CardConnect } from "../payment/CardConnect";
import { PayPal } from "../payment/PayPal";
import { Stripe } from "../payment/Stripe";

type CartPaymentPanelProps = {
  submitOrder: () => void;
  submitting: boolean;
};

const PaymentMapper = (provider: string) => {
  switch (provider) {
    case "Stripe":
      return <Stripe />;
    case "CardConnect":
      return <CardConnect />;
    case "BlueSnap":
      return <BlueSnap />;
    case "PayPal":
      return <PayPal />;
    default:
      null;
  }
};

export const CartPaymentPanel = ({
  submitOrder,
  submitting,
}: CartPaymentPanelProps) => {
  const PaymentElement = useMemo(() => {
    return PaymentMapper(PAYMENT_PROVIDER);
  }, []);

  return (
    <>
      {PaymentElement}

      <Button
        alignSelf="flex-end"
        onClick={submitOrder}
        mt={6}
        isDisabled={submitting}
      >
        {submitting ? "Submitting" : "Submit Order"}
      </Button>
    </>
  );
};
