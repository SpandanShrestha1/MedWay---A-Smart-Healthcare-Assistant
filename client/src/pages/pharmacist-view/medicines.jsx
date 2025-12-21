import { Fragment, useEffect } from "react";
import { Button } from "../../components/ui/button";
import {
  Sheet,
  SheetTitle,
  SheetContent,
  SheetHeader,
} from "../../components/ui/sheet";
import { useState } from "react";
import CommonForm from "../../components/common/form";
import { addMedicineFormElements } from "../../config/index";
import MedicineImageUpload from "../../components/pharmacist-view/image-upload";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewMedicine,
  deleteMedicine,
  editMedicine,
  fetchAllMedicines,
  fetchAllMedicinesByPharmacist,
} from "../../store/pharmacist/medicine-slice/";
import { toast } from "sonner";
import PharmacistMedicineTitle from "../../components/pharmacist-view/PharmacistMedicineTitle";
import { current } from "@reduxjs/toolkit";
import { fetchAllPharmaciesByUser } from "../../store/pharmacist/pharmacy-slice";

const initialFormData = {
  pharmacyId: "",
  image: null,
  medicineName: "",
  description: "",
  category: "",
  brand: "",
  stockQuantity: "",
  price: "",
  expiryDate: "",
  isPrescriptionRequired: false,
  status: "active",
};
function PharmacistMedicines() {
  const [openCreateProductsDialog, setOpenCreateProductsDialog] =
    useState(false);
  const [formData, setFormData] = useState(initialFormData);
  const [imageFile, setImageFile] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState("");
  const [imageLoadingState, setImageLoadingState] = useState(false);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const { user } = useSelector((state) => state.auth);
  const userId = user?.id;

  const { medicineList } = useSelector((state) => state.pharmacistMedicines);
  const { pharmacyList } = useSelector((state) => state.pharmacy);

  const dispatch = useDispatch();

  function onSubmit(event) {
    event.preventDefault();
    currentEditedId !== null
      ? dispatch(
          editMedicine({
            medicineId: currentEditedId,
            formData: {
              ...formData,
              userId: user.id,
              image: uploadedImageUrl || formData.image,
            },
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllMedicinesByPharmacist(userId));
            toast.success("Medicine updated successfully");
            setFormData(initialFormData);
            setCurrentEditedId(null);
          }
        })
      : dispatch(
          addNewMedicine({
            ...formData,
            pharmacyId: formData.pharmacyId,
            userId: user?.id,
            image: uploadedImageUrl,
          })
        ).then((data) => {
          console.log(data);
          if (data?.payload?.success) {
            dispatch(fetchAllMedicinesByPharmacist(userId));
            setImageFile(null);
            setFormData(initialFormData);
            toast.success("Medicine add successfully");
          }
        });
  }

  function handleDelete(getCurrentMedicineId) {
    dispatch(
      deleteMedicine({
        userId: userId,
        medicineId: getCurrentMedicineId,
      })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllMedicinesByPharmacist(userId));
        toast.success("Medicine deleted successfully");
      }
    });
  }
  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }
  useEffect(() => {
    dispatch(fetchAllPharmaciesByUser(user.id));
    console.log("pharmacyList", pharmacyList);
    dispatch(fetchAllMedicinesByPharmacist(user?.id));
    console.log("medicineList", medicineList);
  }, [dispatch, user?.id]);
  return (
    <Fragment>
      <div className="mb-5 p-2 border-b border-gray-300 text-2xl font-semibold">
        <h1>Inventory Management</h1>
      </div>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Medicines
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-4">
        {medicineList && medicineList.length > 0
          ? medicineList.map((medicineItem) => (
              <PharmacistMedicineTitle
                setFormData={setFormData}
                setOpenCreateProductsDialog={setOpenCreateProductsDialog}
                setCurrentEditedId={setCurrentEditedId}
                medicine={medicineItem}
                handleDelete={handleDelete}
              />
            ))
          : null}
      </div>
      <Sheet
        open={openCreateProductsDialog}
        onOpenChange={() => {
          setOpenCreateProductsDialog(false);
          setCurrentEditedId(null);
          setFormData(initialFormData);
        }}
      >
        <SheetContent
          side="right"
          className="overflow-auto bg-white text-black px-4"
        >
          <SheetHeader>
            <SheetTitle>
              {currentEditedId !== null ? "Edit Medicine" : "Add New Medicine"}
            </SheetTitle>
          </SheetHeader>
          <MedicineImageUpload
            imageFile={imageFile}
            setImageFile={setImageFile}
            uploadedImageUrl={uploadedImageUrl}
            setUploadedImageUrl={setUploadedImageUrl}
            setImageLoadingState={setImageLoadingState}
            imageLoadingState={imageLoadingState}
            isEditMode={currentEditedId !== null}
          />
          <div className="py-6">
            <select
              value={formData.pharmacyId}
              onChange={(e) =>
                setFormData({ ...formData, pharmacyId: e.target.value })
              }
              className="w-full border p-2 rounded"
            >
              <option value="">Select Pharmacy</option>
              {pharmacyList?.map((pharmacy) => (
                <option key={pharmacy.pharmacyId} value={pharmacy.pharmacyId}>
                  {pharmacy.pharmacyName}
                </option>
              ))}
            </select>

            <CommonForm
              onSubmit={onSubmit}
              formData={formData}
              setFormData={setFormData}
              buttonText={currentEditedId !== null ? "Edit" : "Add"}
              formControls={addMedicineFormElements}
              isBtnDisabled={!isFormValid()}
            />
          </div>
        </SheetContent>
      </Sheet>
    </Fragment>
  );
}

export default PharmacistMedicines;
