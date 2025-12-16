import { requirePermissions } from "@carbon/auth/auth.server";
import { data, type LoaderFunctionArgs, useParams } from "react-router";
import CustomerRiskRegister from "~/modules/sales/ui/Customer/CustomerRiskRegister";

export async function loader({ request }: LoaderFunctionArgs) {
  await requirePermissions(request, {
    view: "sales"
  });

  return data({});
}

export default function CustomerRisksRoute() {
  const { customerId } = useParams();
  if (!customerId) throw new Error("Could not find customerId");

  return <CustomerRiskRegister customerId={customerId} />;
}
