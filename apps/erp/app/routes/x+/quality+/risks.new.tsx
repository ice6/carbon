import { requirePermissions } from "@carbon/auth/auth.server";
import { validationError, validator } from "@carbon/form";
import { type ActionFunctionArgs, data, useNavigate } from "react-router";
import { riskRegisterValidator } from "~/modules/quality/quality.models";
import { upsertRisk } from "~/modules/quality/quality.service";
import RiskRegisterForm from "~/modules/quality/ui/RiskRegister/RiskRegisterForm";
import { path } from "~/utils/path";

export const action = async ({ request }: ActionFunctionArgs) => {
  const { client, userId, companyId } = await requirePermissions(request, {
    create: "quality",
    role: "employee"
  });

  const formData = await request.formData();
  const validation = await validator(riskRegisterValidator).validate(formData);

  if (validation.error) {
    return validationError(validation.error);
  }

  const { id: _, ...d } = validation.data;

  const result = await upsertRisk(client, {
    ...d,
    companyId,
    createdByUserId: userId
  });

  if (result.error) {
    return data(
      {
        data: null,
        error: result.error.message
      },
      { status: 500 }
    );
  }

  return data({
    data: result.data,
    error: null
  });
};

export default function NewRiskRoute() {
  const navigate = useNavigate();
  const onClose = () => navigate(path.to.risks);

  return (
    <RiskRegisterForm
      initialValues={{
        title: "",
        description: "",
        source: "General",
        status: "Open"
      }}
      onClose={onClose}
    />
  );
}
