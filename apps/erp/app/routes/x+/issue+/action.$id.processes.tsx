import { requirePermissions } from "@carbon/auth/auth.server";
import { json, type ActionFunctionArgs } from "@vercel/remix";
import { z } from "zod/v3";
import { updateIssueActionProcesses } from "~/modules/quality/quality.service";

const updateProcessesSchema = z.object({
  id: z.string(),
  processIds: z.array(z.string()).optional()
});

export async function action({ request, params }: ActionFunctionArgs) {
  const { client, userId, companyId } = await requirePermissions(request, {
    update: "quality"
  });

  const { id } = params;
  if (!id) throw new Error("Could not find id");

  const body = await request.json();
  const validated = updateProcessesSchema.safeParse(body);

  if (!validated.success) {
    return json({ error: "Invalid request data" }, { status: 400 });
  }

  const { processIds = [] } = validated.data;

  const updateProcesses = await updateIssueActionProcesses(client, {
    actionTaskId: id,
    processIds,
    companyId,
    createdBy: userId
  });

  if (updateProcesses.error) {
    return json({ error: updateProcesses.error.message }, { status: 400 });
  }

  return json({ success: true });
}
