import { assertIsPost, error, success } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { flash } from "@carbon/auth/session.server";
import { validationError, validator } from "@carbon/form";
import type { ActionFunctionArgs } from "react-router";
import { redirect } from "react-router";
import {
  accountSubcategoryValidator,
  upsertAccountSubcategory
} from "~/modules/accounting";
import { setCustomFields } from "~/utils/form";
import { getParams, path } from "~/utils/path";

export async function action({ request, params }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "accounting"
  });

  const { subcategoryId } = params;
  if (!subcategoryId) throw new Error("subcategoryId not found");

  const formData = await request.formData();
  const validation = await validator(accountSubcategoryValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  // biome-ignore lint/correctness/noUnusedVariables: suppressed due to migration
  const { id, ...d } = validation.data;

  const update = await upsertAccountSubcategory(client, {
    id: subcategoryId,
    ...d,
    customFields: setCustomFields(formData),
    updatedBy: userId
  });
  if (update.error)
    redirect(
      `${path.to.accountingCategories}?${getParams(request)}`,
      await flash(
        request,
        error(update.error, "Failed to update G/L subcategory")
      )
    );

  throw redirect(
    `${path.to.accountingCategories}?${getParams(request)}`,
    await flash(request, success("Successfully updated G/L subcategory"))
  );
}
