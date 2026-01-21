import { useEffect, useState } from "react";
import { DialogContent, DialogTitle } from "../ui/dialog";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import CommonForm from "../common/form";
import {
  fetchOrderDetails,
  fetchAllFilteredOrders,
  updatePharmacistOrderStatus,
} from "../../store/pharmacist/orders-slice";
import { Badge } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";

const initialFormData = {
  status: "",
};
function OrderDetailsView({ orderDetails }) {
  const [formData, setFormData] = useState(initialFormData);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  function handleUpdateStatus(event) {
    event.preventDefault();
    const { status } = formData;

    dispatch(
      updatePharmacistOrderStatus({ id: orderDetails?.orderId, status })
    ).then((data) => {
      if (data?.payload?.success) {
        // 1️⃣ Refetch the updated order details
        dispatch(fetchOrderDetails(orderDetails?.orderId));

        // 2️⃣ Refetch all orders with saved filters
        const savedFilters = JSON.parse(sessionStorage.getItem("filters"));
        dispatch(
          fetchAllFilteredOrders({
            userId: user?.id,
            filterParams: savedFilters?.status
              ? { status: savedFilters.status }
              : {},
          })
        );

        setFormData(initialFormData);
        toast.success(data?.payload?.message);
      }
    });
  }

  return (
    <DialogContent className="sm:max-w-[600px] bg-white">
      <DialogTitle className="sr-only">Order Details</DialogTitle>
      <div className="grid gap-6">
        <div className="grid gap-2">
          <div className="flex mt-6 items-center justify-between">
            <p className="font-medium">Order Id</p>
            <Label>{orderDetails?.orderId}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Date</p>
            <Label>{orderDetails?.createdAt.split("T")[0]}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Price</p>
            <Label>Rs.{orderDetails?.totalPrice}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Payment method</p>
            <Label>{orderDetails?.paymentMethod}</Label>
          </div>
          <div className="flex mt-2 items-center justify-between">
            <p className="font-medium">Order Status</p>
            <Label>{orderDetails?.status}</Label>
          </div>
        </div>
        <Separator />
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">Order Details</div>
            <ul className="grid gap-3">
              {orderDetails?.OrderItems && orderDetails?.OrderItems.length > 0
                ? orderDetails?.OrderItems.map((item) => (
                    <li className="flex items-center justify-between">
                      <span>Title: {item.medicineName}</span>
                      <span>Quantity: {item.quantity}</span>
                      <span>Price: Rs.{item.price}</span>
                    </li>
                  ))
                : null}
            </ul>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <div className="font-medium">{/*adding shipping info*/}</div>
          </div>
        </div>
      </div>
      <div>
        <CommonForm
          formControls={[
            {
              label: "Order Status",
              name: "status",
              componentType: "select",
              options: [
                { id: "pending", label: "Pending" },
                { id: "accepted", label: "Accepted" },
                { id: "preparing", label: "Preparing" },
                { id: "out_for_delivery", label: "Out for delivery" },
                { id: "completed", label: "Completed" },
                { id: "cancelled", label: "Cancelled" },
              ],
            },
          ]}
          formData={formData}
          setFormData={setFormData}
          buttonText={"Update Order Status"}
          onSubmit={handleUpdateStatus}
        />
      </div>
    </DialogContent>
  );
}

export default OrderDetailsView;
