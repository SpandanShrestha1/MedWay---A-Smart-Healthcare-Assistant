import { Card, CardContent, CardFooter } from "../ui/card";
import { Button } from "../ui/button";
import { Edit, Trash2 } from "lucide-react";
import { Badge } from "../ui/badge";

export default function PharmacistMedicineTitle({
  medicine,
  setFormData,
  setOpenCreateProductsDialog,
  setCurrentEditedId,
  handleDelete,
}) {
  const isLowStock = medicine.stockQuantity < 100;

  return (
    <Card className="w-full p-4 mb-3">
      <div className="grid grid-cols-4 items-center gap-4">
        {/* Title & Price */}
        <div className="flex flex-col">
          <p className="font-semibold text-lg">{medicine.medicineName}</p>
          <p>Price</p>
          <p className="text-sm text-gray-600">Rs. {medicine.price}</p>
        </div>

        {/* Category & Stock */}
        <div className="flex flex-col text-center">
          {/*
                    <p className="text-sm capitalize text-gray-700 rounded-2xl bg-gray-100 px-3 py-1 inline-block">
                        {medicine.category}
                    </p>
                    */}
          <Badge variant="outline">{medicine.category}</Badge>
          <p
            className={`text-sm font-semibold ${
              medicine.stockQuantity < 10 ? "text-red-500" : "text-black-600"
            }`}
          >
            Stock: {medicine.stockQuantity} units
          </p>
          <p
            className={`text-sm font-semibold ${
              medicine.stockQuantity < 10 ? "text-red-500" : "text-black-600"
            }`}
          >
            <span>
              {medicine.stockQuantity > 10 ? "In stock" : "Out of stock"}
            </span>
          </p>
        </div>
        <div className="flex flex-col text-center">
          <p className="text-sm capitalize text-gray-700">Expiry</p>
          <p
            className={`text-sm font-semibold text-black-600
        }`}
          >
            Date: {medicine.expiryDate.split("T")[0]}
          </p>
        </div>

        {/* RIGHT COLUMN - Edit & Delete */}
        <div className="flex justify-end gap-2">
          <Button
            size="sm"
            className="flex items-center gap-1 bg-gray-100 text-black"
            onClick={() => {
              setCurrentEditedId(medicine.medicineId);
              setOpenCreateProductsDialog(true);
              setFormData(medicine);
            }}
          >
            <Edit className="w-4 h-4" />
            Edit
          </Button>

          <Button
            size="sm"
            className="flex items-center gap-1 bg-gray-100 text-black"
            onClick={() => handleDelete(medicine.medicineId)}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
