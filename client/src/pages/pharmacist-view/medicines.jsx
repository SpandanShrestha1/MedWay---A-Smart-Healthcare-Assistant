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
import { Input } from "../../components/ui/input";
import { addMedicineFormElements } from "../../config/index";

import MedicineImageUpload from "../../components/pharmacist-view/image-upload";
import { useDispatch, useSelector } from "react-redux";
import {
  addNewMedicine,
  deleteMedicine,
  editMedicine,
  fetchAllFilteredMedicines,
  fetchAllMedicines,
  fetchAllMedicinesByPharmacist,
  pharamacistSearchMedicine,
} from "../../store/pharmacist/medicine-slice/index";
import { toast } from "sonner";
import PharmacistMedicineTitle from "../../components/pharmacist-view/PharmacistMedicineTitle";
import { current } from "@reduxjs/toolkit";
import { fetchAllPharmaciesByUser } from "../../store/pharmacist/pharmacy-slice";
import { PharmacistMedicineFilter } from "../../components/pharmacist-view/medicineFilter";
import { useSearchParams } from "react-router-dom";

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
  const [filters, setFilters] = useState({});
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
  const [searchParams, setSearchParams] = useSearchParams();
  const categorySearchParam = searchParams.get("category");
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useDispatch();
  function handleFilter(section, optionId) {
    const currentValue = filters[section];

    const newFilters = {
      ...filters,
      [section]: currentValue === optionId ? null : optionId,
    };

    if (newFilters[section] === null) {
      delete newFilters[section];
    }

    setFilters(newFilters);
    sessionStorage.setItem("filters", JSON.stringify(newFilters));
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAllFilteredMedicines({ userId, filterParams: filters }));
    }
  }, [filters, dispatch, user?.id]);

  useEffect(() => {
    setFilters(JSON.parse(sessionStorage.getItem("filters")) || {});
  }, [categorySearchParam]);

  useEffect(() => {
    if (filters && Object.keys(filters).length > 0) {
      const createQueryString = createSearchParamsHelper(filters);
      setSearchParams(new URLSearchParams(createQueryString));
    }
  }, [filters]);

  useEffect(() => {
    if (filters !== null)
      dispatch(fetchAllFilteredMedicines({ filterParams: filters }));
  }, [dispatch, filters]);

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
            if (searchTerm.length > 0) {
              dispatch(
                pharamacistSearchMedicine({
                  pharmacistId: user.id,
                  name: searchTerm,
                })
              );
            } else {
              dispatch(
                fetchAllFilteredMedicines({ userId, filterParams: filters })
              );
            }

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
            dispatch(
              fetchAllFilteredMedicines({ userId, filterParams: filters })
            );
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
        if (searchTerm.length > 0) {
          dispatch(
            pharamacistSearchMedicine({
              pharmacistId: user.id,
              name: searchTerm,
            })
          );
        } else {
          dispatch(
            fetchAllFilteredMedicines({ userId, filterParams: filters })
          );
        }
      }
    });
  }

  function isFormValid() {
    return Object.keys(formData)
      .map((key) => formData[key] !== "")
      .every((item) => item);
  }
  useEffect(() => {
    dispatch(fetchAllPharmaciesByUser(userId));
    console.log("pharmacyList", pharmacyList);
    dispatch(fetchAllMedicinesByPharmacist(userId));
    console.log("medicineList", medicineList);
  }, [dispatch, user?.id]);
  return (
    <Fragment>
      <div className="mb-5 w-full flex justify-end">
        <Button onClick={() => setOpenCreateProductsDialog(true)}>
          Add New Medicines
        </Button>
      </div>
      <div className="bg-background rounded-lg shadow-md mb-4 p-4 border-b">
        <Input
          className="bg-gray-100"
          type="search"
          placeholder="Search medicines by name"
          onChange={(e) => {
            const searchValue = e.target.value.trim();
            setSearchTerm(searchValue);

            if (searchValue.length > 0) {
              dispatch(
                pharamacistSearchMedicine({
                  pharmacistId: user.id,
                  name: searchValue,
                })
              );
            } else {
              dispatch(
                fetchAllFilteredMedicines({ userId, filterParams: filters })
              );
            }
          }}
        />
      </div>
      <PharmacistMedicineFilter filters={filters} handleFilter={handleFilter} />
      <div className="flex flex-col gap-4">
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
