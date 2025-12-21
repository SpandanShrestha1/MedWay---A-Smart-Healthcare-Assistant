import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Dialog } from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { useState, useEffect } from "react";
import OrderDetailsView from "./order-details";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";

import {
  fetchAllFilteredOrders,
  fetchOrderDetails,
} from "../../store/pharmacist/orders-slice";
import { Badge } from "../ui/badge";
import { OrderFilter } from "./filter";

function createSearchParamsHelper(filterParams) {
  const queryParams = [];
  for (const [key, value] of Object.entries(filterParams)) {
    if (Array.isArray(value) && value.length > 0) {
      const paramValue = value.join(",");
      queryParams.push(`${key}=${encodeURIComponent(paramValue)}`);
    }
  }
  return queryParams.join("&");
}

function PharmacistOrdersView() {
  const [openDetailsDialog, setOpenDetailsDialog] = useState(false);
  const { pharmacistOrderList, pharmacistOrderDetails } = useSelector(
    (state) => state.pharmacistOrders
  );
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;
  const [filters, setFilters] = useState({
    status: null,
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const statusSearchParam = searchParams.get("status");

  function handleFilter(section, option) {
    setFilters((prev) => {
      const newFilters = {
        ...prev,
        [section]: prev[section] === option ? null : option,
      };

      sessionStorage.setItem("filters", JSON.stringify(newFilters));
      return newFilters;
    });
  }

  function handleFetchOrderDetails(getId) {
    dispatch(fetchOrderDetails(getId));
  }
  useEffect(() => {
    if (!userId) return;

    dispatch(
      fetchAllFilteredOrders({
        userId,
        filterParams: filters.status ? { status: filters.status } : {},
      })
    );
  }, [dispatch, userId, filters.status]);

  useEffect(() => {
    const storedFilters = sessionStorage.getItem("filters");

    if (storedFilters) {
      setFilters(JSON.parse(storedFilters));
    }
  }, []);

  useEffect(() => {
    if (pharmacistOrderDetails !== null) setOpenDetailsDialog(true);
  }, [pharmacistOrderDetails]);
  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters]);
  useEffect(() => {
    if (pharmacistOrderList && pharmacistOrderList.length > 0) {
      console.log("📦 All pharmacist orders:", pharmacistOrderList);

      pharmacistOrderList.forEach((order) => {
        console.log("Order ID:", order.orderId);
        console.log("Status:", order.status);
        console.log("Total Price:", order.totalPrice);
        console.log("Patient:", order.User);
        console.log("Pharmacy:", order.Pharmacy);
        console.log("Items:", order.OrderItems);
        console.log("---------------");
      });
    }
  }, [pharmacistOrderList]);

  return (
    <Card>
      <OrderFilter filters={filters} handleFilter={handleFilter} />
      <CardHeader>
        <CardTitle>All Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order ID</TableHead>
              <TableHead>Order Date</TableHead>
              <TableHead>Patient Username</TableHead>
              <TableHead>Patient Email</TableHead>
              <TableHead>Order Status</TableHead>
              <TableHead>Order Price</TableHead>
              <TableHead>
                <span className="sr-only">Details</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pharmacistOrderList && pharmacistOrderList.length > 0 ? (
              pharmacistOrderList.map((order) => (
                <TableRow key={order.orderId}>
                  <TableCell>{order.orderId}</TableCell>
                  <TableCell>
                    {new Date(order.orderDate).toLocaleString()}
                  </TableCell>
                  <TableCell>{order.User?.userName}</TableCell>
                  <TableCell>{order.User?.email}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        order.status === "cancelled"
                          ? "destructive"
                          : order.status === "completed"
                          ? "success"
                          : "secondary"
                      }
                    >
                      {order.status}
                    </Badge>
                  </TableCell>
                  <TableCell>{order.totalPrice}</TableCell>
                  <TableCell>
                    <Button
                      onClick={() => handleFetchOrderDetails(order.orderId)}
                    >
                      View Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center">
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

export default PharmacistOrdersView;
