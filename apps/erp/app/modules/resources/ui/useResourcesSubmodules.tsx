import {
  LuClipboardCheck,
  LuCog,
  LuGraduationCap,
  LuMapPin,
  LuWrench
} from "react-icons/lu";
import { useSavedViews } from "~/hooks/useSavedViews";
import type { RouteGroup } from "~/types";
import { path } from "~/utils/path";

const resourcesRoutes: RouteGroup[] = [
  {
    name: "Manage",
    routes: [
      {
        name: "Locations",
        to: path.to.locations,
        icon: <LuMapPin />,
        table: "location"
      },
      {
        name: "Processes",
        to: path.to.processes,
        icon: <LuCog />,
        table: "process"
      },
      {
        name: "Work Centers",
        to: path.to.workCenters,
        icon: <LuWrench />,
        table: "workCenter"
      }
    ]
  },
  {
    name: "Training",
    routes: [
      {
        name: "Training",
        to: path.to.trainings,
        icon: <LuGraduationCap />,
        table: "training"
      },
      {
        name: "Assignments",
        to: path.to.trainingAssignments,
        icon: <LuClipboardCheck />
      }
    ]
  }
];

export default function useResourcesSubmodules() {
  const { addSavedViewsToRoutes } = useSavedViews();

  return {
    groups: resourcesRoutes.map((group) => ({
      ...group,
      routes: group.routes.map(addSavedViewsToRoutes)
    }))
  };
}
