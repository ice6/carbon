import { requirePermissions } from "@carbon/auth/auth.server";
import type { LoaderFunctionArgs } from "@vercel/remix";
import { json } from "@vercel/remix";
import { getOutstandingTrainingsForUser } from "~/modules/resources";
import { getCarbonServiceRole } from "@carbon/auth";

export async function loader({ request }: LoaderFunctionArgs) {
  const { companyId, userId } = await requirePermissions(request, {});

  return json(
    await getOutstandingTrainingsForUser(
      getCarbonServiceRole(),
      companyId,
      userId
    )
  );
}
