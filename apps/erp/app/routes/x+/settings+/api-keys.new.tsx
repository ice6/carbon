import { assertIsPost, error } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { flash } from "@carbon/auth/session.server";
import { validationError, validator } from "@carbon/form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, useNavigate } from "react-router";
import { ApiKeyForm, apiKeyValidator, upsertApiKey } from "~/modules/settings";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermissions(request, {
    update: "users"
  });

  return null;
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, companyId, userId } = await requirePermissions(request, {
    update: "users"
  });

  const formData = await request.formData();
  const validation = await validator(apiKeyValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  // biome-ignore lint/correctness/noUnusedVariables: suppressed due to migration
  const { id, ...d } = validation.data;

  const insertApiKey = await upsertApiKey(client, {
    ...d,
    companyId,
    createdBy: userId
  });
  if (insertApiKey.error) {
    return data(
      {},
      await flash(
        request,
        error(insertApiKey.error, "Failed to create API key")
      )
    );
  }

  const key = insertApiKey.data?.key;
  if (!key) {
    return data(
      {},
      await flash(request, error(insertApiKey, "Failed to create API key"))
    );
  }

  return data({ key }, { status: 201 });
}

export default function NewApiKeyRoute() {
  const navigate = useNavigate();
  const initialValues = {
    name: ""
  };

  return (
    <ApiKeyForm onClose={() => navigate(-1)} initialValues={initialValues} />
  );
}
