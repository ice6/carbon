import { assertIsPost, error, notFound, success } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { flash } from "@carbon/auth/session.server";
import { validationError, validator } from "@carbon/form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, redirect, useLoaderData } from "react-router";
import {
  accountValidator,
  getAccount,
  upsertAccount
} from "~/modules/accounting";
import { ChartOfAccountForm } from "~/modules/accounting/ui/ChartOfAccounts";
import { getCustomFields, setCustomFields } from "~/utils/form";
import { path } from "~/utils/path";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "accounting",
    role: "employee"
  });

  const { accountId } = params;
  if (!accountId) throw notFound("accountId not found");

  const account = await getAccount(client, accountId);

  return {
    account: account?.data ?? null
  };
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "accounting"
  });

  const formData = await request.formData();
  const validation = await validator(accountValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...d } = validation.data;
  if (!id) throw new Error("id not found");

  const updateAccount = await upsertAccount(client, {
    id,
    ...d,
    customFields: setCustomFields(formData),
    updatedBy: userId
  });

  if (updateAccount.error) {
    return data(
      {},
      await flash(
        request,
        error(updateAccount.error, "Failed to update account")
      )
    );
  }

  throw redirect(
    path.to.chartOfAccounts,
    await flash(request, success("Updated account"))
  );
}

export default function EditChartOfAccountsRoute() {
  const { account } = useLoaderData<typeof loader>();

  const initialValues = {
    id: account?.id ?? undefined,
    number: account?.number ?? "",
    name: account?.name ?? "",
    type: account?.type ?? "Posting",
    accountCategoryId: account?.accountCategoryId ?? undefined,
    accountSubcategoryId: account?.accountSubcategoryId ?? undefined,
    class: account?.class ?? "Asset",
    incomeBalance: account?.incomeBalance ?? "Balance Sheet",
    consolidatedRate: account?.consolidatedRate ?? "Average",
    directPosting: account?.directPosting ?? false,
    ...getCustomFields(account?.customFields)
  };

  return (
    <ChartOfAccountForm key={initialValues.id} initialValues={initialValues} />
  );
}
