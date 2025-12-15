import { getCarbonServiceRole } from "@carbon/auth";
import { requirePermissions } from "@carbon/auth/auth.server";
import { onShapeDataValidator } from "@carbon/ee/onshape";
import { FunctionRegion } from "@supabase/supabase-js";
import { type ActionFunctionArgs, data } from "react-router";

export async function action({ request }: ActionFunctionArgs) {
  const { client, companyId, userId } = await requirePermissions(request, {
    update: "parts"
  });

  const formData = await request.formData();
  const documentId = formData.get("documentId");
  const versionId = formData.get("versionId");
  const elementId = formData.get("elementId");

  const makeMethodId = formData.get("makeMethodId");
  const rows = formData.get("rows");

  if (!makeMethodId || !rows) {
    return data(
      { success: false, message: "Missing required fields" },
      { status: 400 }
    );
  }

  const record = await client
    .from("makeMethod")
    .select("itemId, companyId")
    .eq("id", makeMethodId as string)
    .single();

  if (record.data?.companyId !== companyId) {
    return data(
      { success: false, message: "Invalid make method id" },
      { status: 400 }
    );
  }

  try {
    const parsed = onShapeDataValidator.parse(JSON.parse(rows as string));
    const serviceRole = await getCarbonServiceRole();

    const [sync, item] = await Promise.all([
      serviceRole.functions.invoke("sync", {
        body: {
          type: "onshape",
          makeMethodId,
          data: parsed,
          companyId,
          userId
        },
        region: FunctionRegion.UsEast1
      }),
      serviceRole
        .from("item")
        .select("externalId")
        .eq("id", record.data?.itemId as string)
        .single()
    ]);

    if (sync.error) {
      return data(
        { success: false, message: "Failed to sync onshape data" },
        { status: 400 }
      );
    }

    if (item.error) {
      return data(
        { success: false, message: "Failed to get item" },
        { status: 400 }
      );
    }

    const currentExternalId =
      (item.data?.externalId as Record<string, any>) ?? {};

    // biome-ignore lint/complexity/useLiteralKeys: suppressed due to migration
    currentExternalId["onshape"] = {
      documentId,
      versionId,
      elementId,
      lastSyncedAt: new Date().toISOString()
    };

    await client
      .from("item")
      .update({
        externalId: currentExternalId
      })
      .eq("id", record.data?.itemId as string);
    // biome-ignore lint/correctness/noUnusedVariables: suppressed due to migration
  } catch (error) {
    console.error("Failed to sync onshape data");
    return data(
      { success: false, message: "Invalid rows data" },
      { status: 400 }
    );
  }

  return { success: true, message: "Synced successfully" };
}
