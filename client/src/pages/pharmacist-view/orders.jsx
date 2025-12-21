import PharmacistOrdersView from "../../components/pharmacist-view/orders";

function PharmacistOrders() {
  return (
    <div>
      <div className="mb-5 p-2 border-b border-gray-300 text-2xl font-semibold">
        <h1>Order Management</h1>
      </div>
      <PharmacistOrdersView />
    </div>
  );
}

export default PharmacistOrders;
