import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import {
  fetchDashboardStats,
  fetchRecentOrders,
  fetchLowStock,
} from "../../store/pharmacist/dashboard-slice";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "../../components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { ShoppingCart } from "lucide-react";
import { TriangleAlert } from "lucide-react";
import { DollarSign } from "lucide-react";
import { Box } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { IndianRupee } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Progress } from "../../components/ui/progress";

export default function Dashboard() {
  const dispatch = useDispatch();
  const { stats, recentOrders, lowStock } = useSelector(
    (state) => state.dashboard
  );

  const recentOrders1 = [
    {
      id: "ORD-2024-001",
      customer: "John Doe",
      items: 3,
      total: "NPR 850",
      time: "10 mins ago",
      status: "pending",
    },
    {
      id: "ORD-2024-002",
      customer: "Sarah Smith",
      items: 2,
      total: "NPR 620",
      time: "25 mins ago",
      status: "processing",
    },
    {
      id: "ORD-2024-003",
      customer: "Mike Johnson",
      items: 5,
      total: "NPR 1240",
      time: "1 hour ago",
      status: "ready",
    },
  ];

  const lowStock1 = [
    { name: "Paracetamol 500mg", min: 100, qty: 45 },
    { name: "Amoxicillin 250mg", min: 80, qty: 30 },
    { name: "Ibuprofen 400mg", min: 120, qty: 60 },
  ];
  useEffect(() => {
    console.log(stats);
    dispatch(fetchDashboardStats());
    dispatch(fetchRecentOrders());
    dispatch(fetchLowStock());

    const interval = setInterval(() => {
      dispatch(fetchDashboardStats());
      dispatch(fetchRecentOrders());
      dispatch(fetchLowStock());
    }, 7000); // auto refresh every 7s

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <div className="p-6 space-y-6">
      {stats && (
        <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg shadow-sm">
            <CardHeader>
              <CardDescription className="text-gray-800 font-medium">
                Pending Orders
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stats.pendingOrders}
              </CardTitle>
              <CardAction>
                <ShoppingCart className="w-6 h-6 text-green-400" />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              {/*
      <div className="line-clamp-1 flex gap-2 font-medium">
        Trending up this month <IconTrendingUp className="size-4" />
      </div>
      */}
              <div className="text-muted-foreground">check your orders</div>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-r from-red-100 to-red-50 p-4 rounded-lg shadow-sm">
            <CardHeader>
              <CardDescription className="text-gray-800 font-medium">
                Low Stock Items
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stats.lowStockCount}
              </CardTitle>
              <CardAction>
                <TriangleAlert className="w-6 h-6 text-yellow-400" />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              {/*
      <div className="line-clamp-1 flex gap-2 font-medium">
        Down 20% this period <IconTrendingDown className="size-4" />
      </div>
      */}
              <div className="text-muted-foreground">Need restock soon</div>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg shadow-sm">
            <CardHeader>
              <CardDescription className="text-gray-800 font-medium">
                Today's Sales
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                {stats.todaySalesCount}
              </CardTitle>
              <CardAction>
                <IndianRupee className="w-6 h-6 text-green-400" />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              {/*
      <div className="line-clamp-1 flex gap-2 font-medium">
        Strong user retention <IconTrendingUp className="size-4" />
      </div>
       */}
              <div className="text-muted-foreground">
                {stats.salesChangePercent}% from yesterday
              </div>
            </CardFooter>
          </Card>

          <Card className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg shadow-sm">
            <CardHeader>
              <CardDescription className="text-gray-800 font-medium">
                Total Items
              </CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums">
                4.5%
              </CardTitle>
              <CardAction>
                <Box className="w-6 h-6 text-green-400" />
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              {/*
      <div className="line-clamp-1 flex gap-2 font-medium">
        Steady performance increase <IconTrendingUp className="size-4" />
      </div>
      */}
              <div className="text-muted-foreground">Across 7 catgeories</div>
            </CardFooter>
          </Card>
        </div>
      )}
      {/*
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>


      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard title="Pending Orders" value={stats.pendingOrders} />
          <StatCard title="Low Stock" value={stats.lowStockCount} />
          <StatCard title="Sales Today" value={stats.todaySalesCount} />
          <StatCard title="Total Medicines" value={stats.totalItemsCount} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">


        <div className="bg-white shadow-md rounded-xl p-4 md:col-span-2">
          <h3 className="text-lg font-semibold mb-3">Recent Orders</h3>

          {recentOrders?.length === 0 && (
            <p className="text-gray-500 text-sm">No recent orders</p>
          )}

          <div className="space-y-3">
            {recentOrders?.map(order => (
              <div key={order.orderId} className="border-b pb-2">
                <div className="flex justify-between">
                  <p className="font-medium">#{order.orderId}</p>
                  <span className="text-xs text-gray-500">
                    {moment(order.timeAgo).fromNow()}
                  </span>
                </div>

                <p className="text-sm">
                  Patient: <span className="ml-1 font-medium">{order.patientUserName}</span>
                </p>

                <p className="text-sm">
                  Status:
                  <span className="ml-1 font-medium text-blue-600">{order.status}</span>
                </p>
                <p className="text-sm">Items: {order.itemsCount}</p>
                <p className="text-sm font-semibold text-green-600">
                  Rs. {order.totalPrice}
                </p>
              </div>
            ))}
          </div>


        </div>

        <div className="bg-white shadow-md rounded-xl p-4">
          <h3 className="text-lg font-semibold text-red-600 mb-3">Low Stock Alerts</h3>

          {lowStock?.length === 0 && (
            <p className="text-gray-500 text-sm">No low stock medicines</p>
          )}

          <ul className="space-y-2">
            {Array.isArray(lowStock) && lowStock.map(item => (
              <li key={item.medicineId} className="flex justify-between text-sm">
                <span>{item.medicineName}</span>
                <span className="font-bold text-red-600">
                  {item.stockQuantity}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      */}

      {/* ==== Recent Orders & Low Stock Row ==== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        {/* Recent Orders */}
        <Card className="shadow-sm">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold">
              Recent Orders
            </CardTitle>
            <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">
              3 New
            </span>
          </CardHeader>

          <CardContent className="space-y-4">
            {recentOrders.map((order, index) => {
              const statusClass =
                order.status === "pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : order.status === "processing"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-green-100 text-green-700";

              return (
                <div
                  key={index}
                  className="border rounded-lg p-4 flex justify-between items-center hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{order.orderId}</p>
                    <div className="flex items-center space-x-2 text-gray-500 text-sm mt-1">
                      <span>{order.patientUserName}</span>
                      <span>•</span>
                      <span>{order.itemsCount} items</span>
                      <span>•</span>
                      <span>{order.totalPrice}</span>
                      <span>•</span>
                      <span>{moment(order.timeAgo).fromNow()}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize ${statusClass}`}
                    >
                      {order.status}
                    </span>
                    <Button size="sm">Process</Button>
                  </div>
                </div>
              );
            })}
            <Button variant="link" className="w-full text-center">
              View All Orders
            </Button>
          </CardContent>
        </Card>

        {/* Low Stock Alerts */}
        <Card className="shadow-sm">
          <CardHeader className="flex items-center gap-2">
            <AlertTriangle className="text-yellow-600" size={18} />
            <CardTitle className="text-lg font-semibold">
              Low Stock Alerts
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            {lowStock.map((item, index) => {
              const percentage = (item.stockQuantity / item.min) * 100;
              return (
                <div key={index}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span>{item.medicineName}</span>
                    <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
                      {item.stockQuantity} left
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum required: {item.min} units
                  </p>
                </div>
              );
            })}
            <Button className="w-full" variant="secondary">
              Manage Inventory
            </Button>
          </CardContent>
        </Card>
      </div>

      {/*navigating to other pages */}
      <div className="grid grid-cols-1 gap-4 px-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg shadow-sm">
          <CardHeader className="flex flex-col items-center text-center">
            <CardAction className="flex justify-center w-full mt-2">
              <ShoppingCart className="w-12 h-12 text-green-400" />
            </CardAction>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              <h1>Inventory</h1>
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col items-center gap-1.5 text-sm text-center">
            <div className="text-muted-foreground">Manage stock & pricing</div>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-r from-red-100 to-red-50 p-4 rounded-lg shadow-sm">
          <CardHeader className="flex flex-col items-center text-center">
            <CardAction className="flex justify-center w-full mt-2">
              <TriangleAlert className="w-12 h-12 text-yellow-400" />
            </CardAction>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              Orders
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col items-center gap-1.5 text-sm text-center">
            <div className="text-muted-foreground">Process & track orders</div>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg shadow-sm">
          <CardHeader className="flex flex-col items-center text-center">
            <CardAction className="flex justify-center w-full mt-2">
              <DollarSign className="w-12 h-12 text-green-400" />
            </CardAction>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              Sales Report
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col items-center gap-1.5 text-sm text-center">
            <div className="text-muted-foreground">View analytics & trends</div>
          </CardFooter>
        </Card>

        <Card className="bg-gradient-to-r from-green-100 to-green-50 p-4 rounded-lg shadow-sm">
          <CardHeader className="flex flex-col items-center text-center">
            <CardAction className="flex justify-center w-full mt-2">
              <Box className="w-12 h-12 text-green-400" />
            </CardAction>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              Revenue
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex flex-col items-center gap-1.5 text-sm text-center">
            <div className="text-muted-foreground">Track earnings</div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

// Small Stat Card Component
function StatCard({ title, value }) {
  return (
    <div className="bg-white shadow-md rounded-xl p-4 text-center">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="text-3xl font-bold mt-2">{value}</p>
    </div>
  );
}
