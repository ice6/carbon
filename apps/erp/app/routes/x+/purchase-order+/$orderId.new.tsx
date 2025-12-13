import { assertIsPost, error } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { flash } from "@carbon/auth/session.server";
import { validationError, validator } from "@carbon/form";
import type { ActionFunctionArgs } from "react-router";
import { redirect, useParams } from "react-router";
import {
  purchaseOrderLineValidator,
  upsertPurchaseOrderLine
} from "~/modules/purchasing";
import { PurchaseOrderLineForm } from "~/modules/purchasing/ui/PurchaseOrder";
import type { MethodItemType } from "~/modules/shared";
import { setCustomFields } from "~/utils/form";
import { path } from "~/utils/path";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, companyId, userId } = await requirePermissions(request, {
    create: "purchasing"
  });

  const { orderId } = params;
  if (!orderId) throw new Error("Could not find orderId");

  const formData = await request.formData();
  const validation = await validator(purchaseOrderLineValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  // biome-ignore lint/correctness/noUnusedVariables: suppressed due to migration
  const { id, ...d } = validation.data;

  const createPurchaseOrderLine = await upsertPurchaseOrderLine(client, {
    ...d,
    companyId,
    createdBy: userId,
    customFields: setCustomFields(formData)
  });

  if (createPurchaseOrderLine.error) {
    throw redirect(
      path.to.purchaseOrderDetails(orderId),
      await flash(
        request,
        error(
          createPurchaseOrderLine.error,
          "Failed to create purchase order line."
        )
      )
    );
  }

  throw redirect(path.to.purchaseOrderDetails(orderId));
}

export default function NewPurchaseOrderLineRoute() {
  const { orderId } = useParams();

  if (!orderId) throw new Error("Could not find purchase order id");

  const initialValues = {
    purchaseOrderId: orderId,
    purchaseOrderLineType: "Item" as MethodItemType,
    itemId: "",
    purchaseQuantity: 1,
    supplierUnitPrice: 0,
    supplierShippingCost: 0,
    supplierTaxAmount: 0,
    exchangeRate: 1,
    setupPrice: 0,
    purchaseUnitOfMeasureCode: "",
    inventoryUnitOfMeasureCode: "",
    conversionFactor: 1,
    shelfId: ""
  };

  return <PurchaseOrderLineForm initialValues={initialValues} />;
}
