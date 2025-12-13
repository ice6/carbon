import { assertIsPost, error } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { flash } from "@carbon/auth/session.server";
import { validationError, validator } from "@carbon/form";
import type { ActionFunctionArgs } from "react-router";
import { data, redirect, useNavigate, useParams } from "react-router";
import {
  accountSubcategoryValidator,
  upsertAccountSubcategory
} from "~/modules/accounting";
import { AccountSubcategoryForm } from "~/modules/accounting/ui/AccountCategories";
import { setCustomFields } from "~/utils/form";
import { getParams, path } from "~/utils/path";

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    create: "accounting"
  });

  const formData = await request.formData();

  const validation = await validator(accountSubcategoryValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  // biome-ignore lint/correctness/noUnusedVariables: suppressed due to migration
  const { id, ...d } = validation.data;

  const createSubcategory = await upsertAccountSubcategory(client, {
    ...d,
    customFields: setCustomFields(formData),
    createdBy: userId
  });
  if (createSubcategory.error) {
    return data(
      {},
      await flash(
        request,
        error(
          createSubcategory.error,
          "Failed to create G/L account subcategory"
        )
      )
    );
  }

  throw redirect(`${path.to.accountingCategories}?${getParams(request)}`);
}

export default function NewAccountSubcategoryRoute() {
  const { categoryId } = useParams();
  if (!categoryId) throw new Error("categoryId is not found");

  const navigate = useNavigate();
  const onClose = () => navigate(-1);

  const initialValues = {
    name: "",
    accountCategoryId: categoryId
  };

  return (
    <AccountSubcategoryForm initialValues={initialValues} onClose={onClose} />
  );
}
