import { pharmacyFormControls } from "../../config/index";
import CommonForm from "../common/form";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchAllPharmaciesByUser,
  addPharmacy,
  deletePharmacy,
  editPharmacy,
} from "../../store/pharmacist/pharmacy-slice";

import { PharmacyCard } from "./pharmacy-card";
import { toast } from "sonner";

const initialPharmacyFormData = {
  pharmacyName: "",
  address: "",
  licenseNumber: "",
  contactNumber: "",
  deliveryAvailable: false,
};

export const PharmacyInner = () => {
  const [formData, setFormData] = useState(initialPharmacyFormData);
  const [currentEditedId, setCurrentEditedId] = useState(null);
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { pharmacyList } = useSelector((state) => state.pharmacy);

  function handleManagePharmacy(event) {
    event.preventDefault();
    currentEditedId !== null
      ? dispatch(
          editPharmacy({
            userId: user?.id,
            pharmacyId: currentEditedId,
            formData,
          })
        ).then((data) => {
          if (data?.payload?.success) {
            dispatch(fetchAllPharmaciesByUser(user?.id));
            setFormData(initialPharmacyFormData);
            setCurrentEditedId(null);
            toast.success("Pharmacy updated successfully");
          }
        })
      : dispatch(
          addPharmacy({
            ...formData,
            userId: user?.id,
            deliveryAvailable: Boolean(formData.deliveryAvailable),
          })
        ).then((data) => {
          console.log(data);
          if (data?.payload?.success) {
            dispatch(fetchAllPharmaciesByUser(user?.id));
            setFormData(initialPharmacyFormData);
            toast.success("Pharmacy added successfully");
          }
        });
  }

  function handleDeletePharmacy(pharmacyInfo) {
    console.log(pharmacyInfo);
    dispatch(
      deletePharmacy({ userId: user?.id, pharmacyId: pharmacyInfo?.pharmacyId })
    ).then((data) => {
      if (data?.payload?.success) {
        dispatch(fetchAllPharmaciesByUser(user?.id));
        toast.success("Pharmacy deleted successfully");
      }
    });
  }

  function handleEditPharmacy(pharmacyInfo) {
    setCurrentEditedId(pharmacyInfo?.pharmacyId);
    setFormData({
      ...formData,
      pharmacyName: pharmacyInfo?.pharmacyName,
      address: pharmacyInfo?.address,
      licenseNumber: pharmacyInfo?.licenseNumber,
      contactNumber: pharmacyInfo?.contactNumber,
      deliveryAvailable: pharmacyInfo?.deliveryAvailable,
    });
  }

  function isFormValid() {
    return Object.keys(formData).every((key) => {
      const value = formData[key];

      // If value is boolean (checkbox), just return true
      if (typeof value === "boolean") return true;

      // For strings, check trimmed value
      return value.trim() !== "";
    });
  }

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchAllPharmaciesByUser(user.id));
    }
  }, [dispatch, user?.id]);
  console.log(`This is the pharmacy list${pharmacyList}`);

  return (
    <Card>
      <div className="mb-5 p-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
        {pharmacyList && pharmacyList.length > 0
          ? pharmacyList.map((pharmacyInfo) => (
              <PharmacyCard
                handleDeletePharmacy={handleDeletePharmacy}
                pharmacyInfo={pharmacyInfo}
                handleEditPharmacy={handleEditPharmacy}
              />
            ))
          : null}
      </div>
      <CardHeader>
        <CardTitle>
          {currentEditedId ? "Edit Pharmacy" : "Add Pharmacy"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <CommonForm
          formControls={pharmacyFormControls}
          formData={formData}
          setFormData={setFormData}
          buttonText={currentEditedId !== null ? "Update" : "Add"}
          onSubmit={handleManagePharmacy}
        />
      </CardContent>
    </Card>
  );
};
