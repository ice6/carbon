import { Status } from "@carbon/react";
import { LuLock } from "react-icons/lu";
import type { procedureStatus } from "../../production.models";

type ProcedureStatusProps = {
  status?: (typeof procedureStatus)[number] | null;
};

const ProcedureStatus = ({ status }: ProcedureStatusProps) => {
  switch (status) {
    case "Draft":
      return <Status color="gray">{status}</Status>;
    case "Active":
      return (
        <Status color="green">
          <LuLock className="size-3 mr-1" />
          {status}
        </Status>
      );
    case "Archived":
      return (
        <Status color="red">
          <LuLock className="size-3 mr-1" />
          {status}
        </Status>
      );
    default:
      return null;
  }
};

export default ProcedureStatus;
