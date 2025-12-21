import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Heart,
  Pill,
  Package,
  TrendingUp,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Clock,
  DollarSign,
  AlertCircle,
  Plus,
  CheckCircle2,
} from "lucide-react";

export default function PharmacistDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="flex">
        <main className="flex-1 p-4 md:p-8">
          <section className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Welcome to MediWay Pharmacy
            </h1>
            <p className="text-foreground/60">
              Manage inventory, orders, and maximize your pharmacy operations
            </p>
          </section>

          <div className="grid md:grid-cols-4 gap-4 mb-8">
            {[
              {
                label: "Total Medicines",
                value: "1,247",
                icon: <Pill className="w-8 h-8" />,
              },
              {
                label: "Pending Orders",
                value: "12",
                icon: <Package className="w-8 h-8" />,
              },
              {
                label: "Today's Revenue",
                value: "Rs 8,450",
                icon: <DollarSign className="w-8 h-8" />,
              },
              {
                label: "Low Stock Items",
                value: "8",
                icon: <AlertCircle className="w-8 h-8" />,
              },
            ].map((stat, idx) => (
              <div
                key={idx}
                className="bg-card p-6 rounded-lg border border-border hover:border-primary/50 transition"
              >
                <div
                  className={`mb-2 ${
                    idx === 3 ? "text-destructive" : "text-primary"
                  }`}
                >
                  {stat.icon}
                </div>
                <p className="text-sm text-foreground/60 mb-1">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>

          <section className="bg-card rounded-lg border border-border p-6 mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
              <Package className="w-6 h-6 text-primary" />
              Pending Orders
            </h2>
            <div className="space-y-4">
              {[
                {
                  id: "ORD-001",
                  patient: "Sarah Johnson",
                  medicines: "3 items",
                  amount: "Rs 2,450",
                  time: "2 hours ago",
                  status: "pending",
                },
                {
                  id: "ORD-002",
                  patient: "Michael Chen",
                  medicines: "2 items",
                  amount: "Rs 1,820",
                  time: "4 hours ago",
                  status: "processing",
                },
                {
                  id: "ORD-003",
                  patient: "Emily Rodriguez",
                  medicines: "5 items",
                  amount: "Rs 3,900",
                  time: "6 hours ago",
                  status: "ready",
                },
                {
                  id: "ORD-004",
                  patient: "James Wilson",
                  medicines: "2 items",
                  amount: "Rs 1,280",
                  time: "1 day ago",
                  status: "pending",
                },
              ].map((order, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-4 bg-background rounded-lg border border-border hover:border-primary/50 transition"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {order.id} - {order.patient}
                    </p>
                    <p className="text-sm text-foreground/60 flex gap-4 mt-1">
                      <span>{order.medicines}</span>
                      <span>{order.amount}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-4 h-4" /> {order.time}
                      </span>
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        order.status === "ready"
                          ? "bg-secondary/20 text-secondary"
                          : order.status === "processing"
                          ? "bg-primary/20 text-primary"
                          : "bg-muted text-foreground/60"
                      }`}
                    >
                      {order.status}
                    </span>
                    <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition text-sm">
                      Update
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-card rounded-lg border border-border p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <AlertCircle className="w-6 h-6 text-destructive" />
                Low Stock Medicines
              </h2>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium hover:bg-primary/90 transition text-sm flex items-center gap-2">
                <Plus className="w-4 h-4" /> Reorder
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background">
                  <tr className="border-b border-border">
                    <th className="px-4 py-3 text-left text-foreground/60 font-medium">
                      Medicine Name
                    </th>
                    <th className="px-4 py-3 text-left text-foreground/60 font-medium">
                      Current Stock
                    </th>
                    <th className="px-4 py-3 text-left text-foreground/60 font-medium">
                      Min. Required
                    </th>
                    <th className="px-4 py-3 text-left text-foreground/60 font-medium">
                      Unit Price
                    </th>
                    <th className="px-4 py-3 text-left text-foreground/60 font-medium">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    {
                      name: "Aspirin 500mg",
                      stock: "15",
                      min: "50",
                      price: "Rs 5",
                    },
                    {
                      name: "Amoxicillin 250mg",
                      stock: "22",
                      min: "100",
                      price: "Rs 12",
                    },
                    {
                      name: "Metformin 1000mg",
                      stock: "8",
                      min: "75",
                      price: "Rs 8",
                    },
                    {
                      name: "Omeprazole 20mg",
                      stock: "30",
                      min: "80",
                      price: "Rs 15",
                    },
                    {
                      name: "Paracetamol 650mg",
                      stock: "5",
                      min: "200",
                      price: "Rs 3",
                    },
                    {
                      name: "Ibuprofen 400mg",
                      stock: "18",
                      min: "60",
                      price: "Rs 6",
                    },
                    {
                      name: "Cetirizine 10mg",
                      stock: "25",
                      min: "90",
                      price: "Rs 4",
                    },
                    {
                      name: "Atorvastatin 20mg",
                      stock: "12",
                      min: "55",
                      price: "Rs 14",
                    },
                  ].map((med, idx) => (
                    <tr
                      key={idx}
                      className="border-b border-border hover:bg-background/50 transition"
                    >
                      <td className="px-4 py-4 text-foreground">{med.name}</td>
                      <td className="px-4 py-4">
                        <span className="text-destructive font-medium">
                          {med.stock} units
                        </span>
                      </td>
                      <td className="px-4 py-4 text-foreground/60">
                        {med.min} units
                      </td>
                      <td className="px-4 py-4 text-foreground/60">
                        {med.price}
                      </td>
                      <td className="px-4 py-4">
                        <button className="text-primary hover:text-primary/80 font-medium transition">
                          Reorder
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
