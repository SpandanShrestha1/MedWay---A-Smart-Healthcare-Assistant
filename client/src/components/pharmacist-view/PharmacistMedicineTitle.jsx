import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";

function PharmacistMedicineTitle({
  medicine,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const isLowStock = medicine.stockQuantity < 100;

  return (
    <Card className="w-full max-w-md mx-auto mb-4">
      <div>
        <div className="relative">
          <img
            src={medicine?.image}
            alt={medicine?.medicineName}
            className="w-full h-[250px] object-cover rounded-t-lg"
          />
        </div>

        <CardContent>
          <h2 className="text-xl font-bold mb-2">{medicine?.medicineName}</h2>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              {medicine?.brand}
            </span>
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
              {medicine?.category}
            </span>
            {medicine.isPrescriptionRequired && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                Prescription Required
              </span>
            )}
            <span
              className={`px-2 py-1 rounded-full text-sm ${
                isLowStock
                  ? "bg-orange-100 text-orange-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {isLowStock ? "Low Stock" : "In Stock"}
            </span>
          </div>
          <p className="text-gray-600 mb-2">{medicine?.description}</p>
          <div className="flex flex-wrap justify-between mb-2 text-sm text-gray-700">
            <div>Stock: {medicine?.stockQuantity} units</div>
            <div>Min Stock: 100 units</div>
            <div>
              Expiry: {new Date(medicine?.expiryDate).toLocaleDateString()}
            </div>
            <div>Status: {medicine?.status}</div>
          </div>
          <div className="text-lg font-semibold text-primary mb-2">
            Rs.{medicine?.price}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button
            onClick={() => {
              setOpenCreateProductsDialog(true);
              setCurrentEditedId(medicine?.medicineId);
              setFormData(medicine);
            }}
          >
            Edit
          </Button>

          <Button
            variant="destructive"
            onClick={() => handleDelete(medicine?.medicineId)}
          >
            Delete
          </Button>
        </CardFooter>
      </div>
    </Card>
  );
}

export default PharmacistMedicineTitle;
