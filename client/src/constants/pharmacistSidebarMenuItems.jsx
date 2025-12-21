import {
  LayoutDashboard,
  Building2,
  Pill,
  ShoppingCart,
  ChartNoAxesCombined,
} from "lucide-react";
export const pharmacistSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/pharmacist/dashboard",
    icons: <LayoutDashboard />,
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    path: "/pharmacist/pharmacy",
    icons: <Building2 />,
  },
  {
    id: "medicines",
    label: "Medicines",
    path: "/pharmacist/medicines",
    icons: <Pill />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "/pharmacist/orders",
    icons: <ShoppingCart />,
  },
];
