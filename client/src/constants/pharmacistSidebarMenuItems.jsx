import {
  ChartNoAxesCombined,
  LayoutDashboard,
  ShoppingBasket,
  Truck,
} from "lucide-react";
export const pharmacistSidebarMenuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "pharmacist/dashboard",
    icons: <LayoutDashboard />,
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    path: "pharmacist/pharmacy",
    icons: <ChartNoAxesCombined />,
  },
  {
    id: "medicines",
    label: "Medicines",
    path: "pharmacist/medicines",
    icons: <ChartNoAxesCombined />,
  },
  {
    id: "orders",
    label: "Orders",
    path: "pharmacist/orders",
    icons: <ChartNoAxesCombined />,
  },
];
