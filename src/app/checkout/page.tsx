"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Banknote, Clock, FileText } from "lucide-react";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ROUTES } from "@/constants/routes";
import { AddressPicker } from "@/features/addresses/components/address-picker";
import { useCart } from "@/features/cart/hooks";
import {
  PrescriptionUpload,
  type UploadedPrescription,
} from "@/features/orders/components/prescription-upload";
import { useCreateOrder } from "@/features/orders/hooks";
import {
  allowsDelivery,
  allowsPickup,
  effectiveDeliveryType,
} from "@/features/products/delivery";
import { useStore } from "@/features/stores/hooks";
import { useHasMounted } from "@/hooks/use-has-mounted";
import { useAuthStore } from "@/store/auth-store";
import type { FulfillmentType } from "@/types/order";

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const storeId = searchParams.get("storeId") ?? "";
  const hasMounted = useHasMounted();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [fulfillmentType, setFulfillmentType] = useState<FulfillmentType>("delivery");
  const [addressId, setAddressId] = useState<string | undefined>(undefined);
  const [note, setNote] = useState("");
  const [prescriptions, setPrescriptions] = useState<UploadedPrescription[]>([]);

  const cartQuery = useCart();
  const storeQuery = useStore(storeId);
  const createOrder = useCreateOrder();

  useEffect(() => {
    if (hasMounted && !isAuthenticated) {
      router.replace(
        `${ROUTES.login}?redirect=${encodeURIComponent(`${ROUTES.checkout}?storeId=${storeId}`)}`
      );
    }
  }, [hasMounted, isAuthenticated, router, storeId]);

  const storeItems = useMemo(
    () => (cartQuery.data?.items ?? []).filter((item) => item.product.storeId === storeId),
    [cartQuery.data, storeId]
  );

  const deliverySettings = storeQuery.data?.deliverySettings;
  const storeSupportsDelivery = deliverySettings?.mode === "delivery" || deliverySettings?.mode === "both";
  const storeSupportsPickup = deliverySettings?.mode === "pickup_only" || deliverySettings?.mode === "both";
  // A store offering both still lets each product be pickup- or delivery-only,
  // so the order can only use a method every item allows.
  const pickupOnlyItems = storeItems.filter(
    (item) => !allowsDelivery(effectiveDeliveryType(deliverySettings?.mode, item.product.deliveryType))
  );
  const deliveryOnlyItems = storeItems.filter(
    (item) => !allowsPickup(effectiveDeliveryType(deliverySettings?.mode, item.product.deliveryType))
  );
  const supportsDelivery = storeSupportsDelivery && pickupOnlyItems.length === 0;
  const supportsPickup = storeSupportsPickup && deliveryOnlyItems.length === 0;
  const noCommonMethod = Boolean(deliverySettings) && !supportsDelivery && !supportsPickup;

  // Derived rather than synced via an effect: if the store only supports one
  // fulfillment type, that's what's actually in effect regardless of the
  // (irrelevant, hidden) radio state — the radio group only ever renders the
  // option(s) the store actually supports anyway.
  const effectiveFulfillmentType: FulfillmentType = !deliverySettings
    ? fulfillmentType
    : !supportsDelivery
      ? "pickup"
      : !supportsPickup
        ? "delivery"
        : fulfillmentType;

  if (!hasMounted || !isAuthenticated || !storeId) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (cartQuery.isLoading || storeQuery.isLoading) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-10">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (storeItems.length === 0) {
    return (
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-3 px-4 py-16 text-center">
        <h1 className="text-xl font-semibold text-foreground">Nothing to check out</h1>
        <p className="text-sm text-muted-foreground">
          There are no items from this store in your cart.
        </p>
        <Button onClick={() => router.push(ROUTES.cart)}>Back to cart</Button>
      </div>
    );
  }

  const subtotal = storeItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee =
    effectiveFulfillmentType === "delivery" && deliverySettings
      ? (deliverySettings.freeDeliveryThreshold != null &&
        subtotal >= deliverySettings.freeDeliveryThreshold
          ? 0
          : deliverySettings.deliveryFee ?? 0)
      : 0;
  const estimatedTotal = subtotal + deliveryFee;
  const isStoreClosed = storeQuery.data?.isOpenNow === false;
  const unavailableItems = storeItems.filter((item) => item.unavailableReason);
  const rxItems = storeItems.filter((item) => item.product.requiresPrescription);
  const needsPrescription = rxItems.length > 0;
  const canSubmit =
    !isStoreClosed &&
    !noCommonMethod &&
    unavailableItems.length === 0 &&
    storeItems.every((item) => !item.insufficientStock) &&
    (!needsPrescription || prescriptions.length > 0) &&
    (effectiveFulfillmentType === "pickup" || Boolean(addressId));

  function handlePlaceOrder() {
    createOrder.mutate(
      {
        storeId,
        fulfillmentType: effectiveFulfillmentType,
        deliveryAddressId: effectiveFulfillmentType === "delivery" ? addressId : undefined,
        customerNote: note || undefined,
        prescriptionKeys: needsPrescription ? prescriptions.map((file) => file.key) : undefined,
      },
      {
        onSuccess: (order) => {
          router.push(ROUTES.orderDetail(order.id));
        },
      }
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3 lg:px-8">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Checkout</h1>
          <p className="text-sm text-muted-foreground">{storeQuery.data?.name}</p>
        </div>

        {isStoreClosed && (
          <Alert variant="destructive">
            <Clock className="size-4" />
            <AlertTitle>{storeQuery.data?.name} is closed right now</AlertTitle>
            <AlertDescription>
              You can place this order once the store opens again. Your cart is saved.
            </AlertDescription>
          </Alert>
        )}

        {unavailableItems.length > 0 && (
          <Alert variant="destructive">
            <AlertTitle>Some items can&apos;t be ordered</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                {unavailableItems.map((item) => (
                  <li key={item.id}>{item.unavailableReason}</li>
                ))}
              </ul>
              Remove them from your cart to continue.
            </AlertDescription>
          </Alert>
        )}

        {needsPrescription && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <FileText className="size-4" />
                Prescription
              </CardTitle>
              <CardDescription>
                Needed for {rxItems.map((item) => item.product.name).join(", ")}. The pharmacy
                checks it before accepting your order.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PrescriptionUpload value={prescriptions} onChange={setPrescriptions} />
            </CardContent>
          </Card>
        )}

        {noCommonMethod && (
          <Alert variant="destructive">
            <AlertTitle>These items can&apos;t go in one order</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-4">
                <li>Pickup only: {pickupOnlyItems.map((item) => item.product.name).join(", ")}</li>
                <li>Delivery only: {deliveryOnlyItems.map((item) => item.product.name).join(", ")}</li>
              </ul>
              Remove one group from your cart, order the rest, then add them back for a second order.
            </AlertDescription>
          </Alert>
        )}

        {!noCommonMethod && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Fulfillment</CardTitle>
              {storeSupportsDelivery && storeSupportsPickup && !supportsDelivery && (
                <CardDescription>
                  Only pickup is available: {pickupOnlyItems.map((item) => item.product.name).join(", ")}{" "}
                  {pickupOnlyItems.length === 1 ? "is" : "are"} pickup only.
                </CardDescription>
              )}
              {storeSupportsDelivery && storeSupportsPickup && !supportsPickup && (
                <CardDescription>
                  Only delivery is available: {deliveryOnlyItems.map((item) => item.product.name).join(", ")}{" "}
                  {deliveryOnlyItems.length === 1 ? "is" : "are"} delivery only.
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={effectiveFulfillmentType}
                onValueChange={(value) => setFulfillmentType(value as FulfillmentType)}
                className="flex flex-col gap-2"
              >
                {supportsDelivery && (
                  <Label
                    htmlFor="fulfillment-delivery"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem id="fulfillment-delivery" value="delivery" />
                    Home delivery
                  </Label>
                )}
                {supportsPickup && (
                  <Label
                    htmlFor="fulfillment-pickup"
                    className="flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-normal has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5"
                  >
                    <RadioGroupItem id="fulfillment-pickup" value="pickup" />
                    Pickup from store
                  </Label>
                )}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {effectiveFulfillmentType === "delivery" && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery address</CardTitle>
            </CardHeader>
            <CardContent>
              <AddressPicker value={addressId} onChange={setAddressId} />
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order note (optional)</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              placeholder="Any special instructions for the seller..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </CardContent>
        </Card>

        <Alert>
          <Banknote className="size-4" />
          <AlertTitle>Payment: Cash on Delivery</AlertTitle>
          <AlertDescription>
            Pay in cash or via UPI directly to the delivery person, or at the store when you pick
            up your order. Online payments will be supported in a future update.
          </AlertDescription>
        </Alert>
      </div>

      <div className="lg:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Order summary</CardTitle>
            <CardDescription>{storeItems.length} item(s) from {storeQuery.data?.name}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {storeItems.map((item) => (
              <div key={item.id} className="flex justify-between gap-2 text-muted-foreground">
                <span>
                  {item.product.name} &times; {item.quantity}
                  {item.addons?.length > 0 && (
                    <span className="block text-xs">
                      {item.addons.map((addon) => addon.name).join(", ")}
                    </span>
                  )}
                </span>
                <span className="text-foreground">&#8377;{item.lineTotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="mt-2 border-t pt-2">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span className="text-foreground">&#8377;{subtotal.toFixed(2)}</span>
              </div>
              {effectiveFulfillmentType === "delivery" && (
                <div className="flex justify-between text-muted-foreground">
                  <span>Delivery fee</span>
                  <span className="text-foreground">
                    {deliveryFee === 0 ? "Free" : `₹${deliveryFee.toFixed(2)}`}
                  </span>
                </div>
              )}
              <div className="mt-1 flex justify-between font-semibold text-foreground">
                <span>Estimated total</span>
                <span>&#8377;{estimatedTotal.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              size="lg"
              disabled={!canSubmit || createOrder.isPending}
              onClick={handlePlaceOrder}
            >
              {createOrder.isPending ? "Placing order..." : "Place order"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense>
      <CheckoutContent />
    </Suspense>
  );
}
