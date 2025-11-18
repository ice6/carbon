import type { Database } from "@carbon/database";
import { Text, View } from "@react-pdf/renderer";
import { createTw } from "react-pdf-tailwind";

import type { JSONContent } from "@carbon/react";
import type { PDF } from "../types";
import { Header, Note, Summary, Template } from "./components";

type ListItem = {
  id: string;
  name: string;
};

type IssueItem = Database["public"]["Tables"]["nonConformanceItem"]["Row"] & {
  name: string | null;
};

type InvestigationTask =
  Database["public"]["Tables"]["nonConformanceInvestigationTask"]["Row"] & {
    supplier: { name: string } | null;
  };

type ActionTask =
  Database["public"]["Tables"]["nonConformanceActionTask"]["Row"] & {
    supplier: { name: string } | null;
  };

interface IssuePDFProps extends PDF {
  nonConformance: Database["public"]["Tables"]["nonConformance"]["Row"];
  nonConformanceTypes: Database["public"]["Tables"]["nonConformanceType"]["Row"][];
  investigationTasks: InvestigationTask[];
  investigationTypes: ListItem[];
  actionTasks: ActionTask[];
  actionTypes: ListItem[];
  reviewers: Database["public"]["Tables"]["nonConformanceReviewer"]["Row"][];
  items: IssueItem[];
}

// Initialize tailwind-styled-components
const tw = createTw({
  theme: {
    fontFamily: {
      sans: ["Helvetica", "Arial", "sans-serif"],
    },
    extend: {
      colors: {
        gray: {
          500: "#7d7d7d",
        },
      },
    },
  },
});

const IssuePDF = ({
  company,
  locale,
  meta,
  nonConformance,
  nonConformanceTypes,
  investigationTasks,
  investigationTypes,
  actionTasks,
  actionTypes,
  reviewers,
  items,
  title = "Issue Report",
}: IssuePDFProps) => {
  return (
    <Template
      title={title}
      meta={{
        author: meta?.author ?? "Carbon",
        keywords: meta?.keywords ?? "issue report",
        subject: meta?.subject ?? "Issue Report",
      }}
    >
      <View>
        <Header title={title} company={company} />
        <Summary
          company={company}
          items={[
            {
              label: "Issue #",
              value: nonConformance.nonConformanceId,
            },
            {
              label: "Type",
              value: nonConformanceTypes.find(
                (type) => type.id === nonConformance.nonConformanceTypeId
              )?.name,
            },
            {
              label: "Status",
              value: nonConformance.status,
            },
            {
              label: "Started",
              value: nonConformance.openDate,
            },
            {
              label: "Completed",
              value: nonConformance.closeDate,
            },
          ]}
        />
        <View style={tw("flex flex-col gap-2 mb-10")}>
          <View style={tw("flex flex-row justify-between")}>
            <Text style={tw("font-bold")}>{nonConformance.name}</Text>
          </View>
        </View>
        {Object.keys(nonConformance.content ?? {}).length > 0 && (
          <View
            style={tw("flex flex-col gap-2 border-b border-gray-300 mb-10")}
          >
            <View style={tw("flex flex-row justify-between")}>
              <Text style={tw("font-bold")}>Overview</Text>
            </View>

            <Note content={nonConformance.content as JSONContent} />
          </View>
        )}
        {items.length > 0 && (
          <View style={tw("mb-10")} wrap={false}>
            <Text style={tw("font-bold mb-2")}>Dispositions</Text>
            {items.map((item) => (
              <View
                key={item.id}
                style={tw("flex flex-col gap-1 py-2 border-b border-gray-300")}
              >
                <View style={tw("flex flex-row justify-between")}>
                  <Text style={tw("font-bold text-sm")}>{item.name}</Text>
                  <Badge>{item.disposition ?? "Pending"}</Badge>
                </View>
                {item.quantity > 0 && (
                  <Text style={tw("text-sm text-gray-500")}>
                    Quantity: {item.quantity}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}
        {investigationTasks.length > 0 && (
          <View style={tw("mb-10")} wrap={false}>
            {investigationTasks.map((task) => (
              <View
                key={task.id}
                style={tw("flex flex-col gap-2 border-b border-gray-300 mb-10")}
              >
                <View style={tw("flex flex-row justify-between")}>
                  <Text style={tw("font-bold")}>
                    {
                      investigationTypes.find(
                        (type) => type.id === task.investigationTypeId
                      )?.name
                    }
                  </Text>
                </View>
                {task.supplier?.name && (
                  <View style={tw("flex flex-row items-center gap-2")}>
                    <Badge>{task.supplier.name}</Badge>
                  </View>
                )}
                {task.completedDate && (
                  <Text style={tw("text-sm")}>
                    Completed: {task.completedDate}
                  </Text>
                )}
                {Object.keys(task.notes ?? {}).length > 0 && (
                  <Note content={task.notes as JSONContent} />
                )}
              </View>
            ))}
          </View>
        )}

        {actionTasks.length > 0 && (
          <View style={tw("mb-10")} wrap={false}>
            {actionTasks.map((task) => (
              <View
                key={task.id}
                style={tw("flex flex-col gap-2 border-b border-gray-300 mb-10")}
              >
                <View style={tw("flex flex-row justify-between")}>
                  <Text style={tw("font-bold")}>
                    {
                      actionTypes.find((type) => type.id === task.actionTypeId)
                        ?.name
                    }
                  </Text>
                </View>
                {task.supplier?.name && (
                  <View style={tw("flex flex-row items-center gap-2")}>
                    <Badge>{task.supplier.name}</Badge>
                  </View>
                )}
                {task.completedDate && (
                  <Text style={tw("text-sm")}>
                    Completed: {task.completedDate}
                  </Text>
                )}
                {Object.keys(task.notes ?? {}).length > 0 && (
                  <Note content={task.notes as JSONContent} />
                )}
              </View>
            ))}
          </View>
        )}

        {reviewers.length > 0 && (
          <View style={tw("mb-5")} wrap={false}>
            <Text style={tw("font-bold mb-2")}>Reviewers</Text>
            {reviewers.map((reviewer) => (
              <View
                key={reviewer.id}
                style={tw("flex flex-col gap-2 py-2 border-b border-gray-300")}
              >
                <View style={tw("flex flex-row justify-between")}>
                  <Text style={tw("font-bold text-sm")}>{reviewer.title}</Text>
                  <Text style={tw("text-gray-500 text-sm")}>
                    {reviewer.status}
                  </Text>
                </View>

                {Object.keys(reviewer.notes ?? {}).length > 0 && (
                  <Note content={reviewer.notes as JSONContent} />
                )}
              </View>
            ))}
          </View>
        )}
      </View>
    </Template>
  );
};

export default IssuePDF;

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <Text
      style={tw("text-xs bg-gray-100 px-2 py-1 rounded border border-gray-300")}
    >
      {children}
    </Text>
  );
}
