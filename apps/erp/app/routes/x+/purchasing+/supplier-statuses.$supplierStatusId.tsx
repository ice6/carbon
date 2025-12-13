import { assertIsPost, error, notFound, success } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { flash } from "@carbon/auth/session.server";
import { validationError, validator } from "@carbon/form";
import type { ActionFunctionArgs, LoaderFunctionArgs } from "react-router";
import { data, redirect, useLoaderData, useNavigate } from "react-router";
import {
  getSupplierStatus,
  supplierStatusValidator,
  upsertSupplierStatus
} from "~/modules/purchasing";
import { SupplierStatusForm } from "~/modules/purchasing/ui/SupplierStatuses";
import { getCustomFields, setCustomFields } from "~/utils/form";
import { getParams, path } from "~/utils/path";

export async function loader({ request, params }: LoaderFunctionArgs) {
  const { client } = await requirePermissions(request, {
    view: "purchasing",
    role: "employee"
  });

  const { supplierStatusId } = params;
  if (!supplierStatusId) throw notFound("supplierStatusId not found");

  const supplierStatus = await getSupplierStatus(client, supplierStatusId);

  if (supplierStatus.error) {
    throw redirect(
      path.to.supplierStatuses,
      await flash(
        request,
        error(supplierStatus.error, "Failed to get supplier status")
      )
    );
  }

  return {
    supplierStatus: supplierStatus.data
  };
}

export async function action({ request }: ActionFunctionArgs) {
  assertIsPost(request);
  const { client, userId } = await requirePermissions(request, {
    update: "purchasing"
  });

  const formData = await request.formData();
  const validation = await validator(supplierStatusValidator).validate(
    formData
  );

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id, ...d } = validation.data;
  if (!id) throw new Error("id not found");

  const updateSupplierStatus = await upsertSupplierStatus(client, {
    id,
    ...d,
    updatedBy: userId,
    customFields: setCustomFields(formData)
  });

  if (updateSupplierStatus.error) {
    return data(
      {},
      await flash(
        request,
        error(updateSupplierStatus.error, "Failed to update supplier status")
      )
    );
  }

  throw redirect(
    `${path.to.supplierStatuses}?${getParams(request)}`,
    await flash(request, success("Updated supplier status"))
  );
}

export default function EditSupplierStatusesRoute() {
  const { supplierStatus } = useLoaderData<typeof loader>();
  const navigate = useNavigate();

  const initialValues = {
    id: supplierStatus.id ?? undefined,
    name: supplierStatus.name ?? "",
    ...getCustomFields(supplierStatus.customFields)
  };

  return (
    <SupplierStatusForm
      key={initialValues.id}
      initialValues={initialValues}
      onClose={() => navigate(-1)}
    />
  );
}
