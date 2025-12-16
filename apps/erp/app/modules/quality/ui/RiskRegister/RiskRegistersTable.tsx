import { MenuIcon, MenuItem, useDisclosure } from "@carbon/react";
import type { ColumnDef } from "@tanstack/react-table";
import { memo, useCallback, useMemo, useState } from "react";
import {
  LuAlignLeft,
  LuPencil,
  LuShapes,
  LuTrash,
  LuTriangleAlert,
  LuUser
} from "react-icons/lu";
import { useNavigate } from "react-router";
import { EmployeeAvatar, Hyperlink, New, Table } from "~/components";
import { Enumerable } from "~/components/Enumerable";
import { Confirm } from "~/components/Modals";
import { usePermissions, useUrlParams } from "~/hooks";
import { riskSource, riskStatus } from "~/modules/quality/quality.models";
import type { Risk } from "~/modules/quality/types";
import { usePeople } from "~/stores";
import { path } from "~/utils/path";

type RiskRegistersTableProps = {
  data: Risk[];
  count: number;
};

const defaultColumnVisibility = {
  description: false,
  createdAt: true,
  updatedAt: false
};

const RiskRegistersTable = memo(({ data, count }: RiskRegistersTableProps) => {
  const navigate = useNavigate();
  const [params] = useUrlParams();
  const [people] = usePeople();

  const permissions = usePermissions();
  const deleteModal = useDisclosure();
  const [selectedRisk, setSelectedRisk] = useState<Risk | null>(null);

  const onDelete = useCallback(
    (risk: Risk) => {
      setSelectedRisk(risk);
      deleteModal.onOpen();
    },
    [deleteModal]
  );

  const onCancel = useCallback(() => {
    setSelectedRisk(null);
    deleteModal.onClose();
  }, [deleteModal]);

  const columns = useMemo<ColumnDef<Risk>[]>(() => {
    const defaultColumns: ColumnDef<Risk>[] = [
      {
        accessorKey: "title",
        header: "Title",
        cell: ({ row }) => (
          <Hyperlink to={row.original.id!} className="font-medium">
            {row.original.title}
          </Hyperlink>
        ),
        meta: {
          icon: <LuAlignLeft />
        }
      },
      {
        accessorKey: "source",
        header: "Source",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
        meta: {
          icon: <LuShapes />,
          filter: {
            type: "static",
            options: riskSource.map((c) => ({ value: c, label: c }))
          }
        }
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: (item) => <Enumerable value={item.getValue<string>()} />,
        meta: {
          icon: <LuTriangleAlert />,
          filter: {
            type: "static",
            options: riskStatus.map((s) => ({ value: s, label: s }))
          }
        }
      },
      {
        accessorKey: "severity",
        header: "Severity",
        cell: (item) => item.getValue<number>()
      },
      {
        accessorKey: "likelihood",
        header: "Likelihood",
        cell: (item) => item.getValue<number>()
      },
      {
        id: "assigneeUserId",
        header: "Assignee",
        cell: ({ row }) => (
          <EmployeeAvatar employeeId={row.original.assigneeUserId} />
        ),
        meta: {
          icon: <LuUser />,
          filter: {
            type: "static",
            options: people.map((employee) => ({
              value: employee.id,
              label: employee.name
            }))
          }
        }
      }
    ];
    return defaultColumns;
  }, [people]);

  const renderContextMenu = useCallback<(row: Risk) => JSX.Element>(
    (row) => (
      <>
        <MenuItem
          onClick={() => {
            navigate(`${path.to.risk(row.id!)}?${params?.toString()}`);
          }}
        >
          <MenuIcon icon={<LuPencil />} />
          Edit Risk
        </MenuItem>
        <MenuItem
          destructive
          disabled={!permissions.can("delete", "quality")}
          onClick={() => onDelete(row)}
        >
          <MenuIcon icon={<LuTrash />} />
          Delete Risk
        </MenuItem>
      </>
    ),
    [permissions, navigate, params, onDelete]
  );

  return (
    <>
      <Table<Risk>
        data={data}
        defaultColumnVisibility={defaultColumnVisibility}
        columns={columns}
        count={count ?? 0}
        primaryAction={
          permissions.can("create", "quality") && (
            <New label="Risk" to={`new?${params.toString()}`} />
          )
        }
        renderContextMenu={renderContextMenu}
        title="Risks"
        table="riskRegister"
        withSavedView
      />

      {selectedRisk && selectedRisk.id && (
        <Confirm
          action={path.to.deleteRisk(selectedRisk.id)}
          title={`Delete ${selectedRisk?.title} Risk`}
          text={`Are you sure you want to delete this risk? This cannot be undone.`}
          confirmText="Delete"
          isOpen={deleteModal.isOpen}
          onCancel={onCancel}
          onSubmit={onCancel}
        />
      )}
    </>
  );
});

RiskRegistersTable.displayName = "RiskRegistersTable";
export default RiskRegistersTable;
