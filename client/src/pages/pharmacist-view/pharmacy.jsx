import { PharmacyInner } from "../../components/pharmacist-view/pharmacy-Inner";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "../../components/ui/button";
import { useState } from "react";
import { toast } from "sonner";
import { Navigate } from "react-router-dom";

function Pharmacy() {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  return (
    <div>
      <PharmacyInner />
    </div>
  );
}

export default Pharmacy;
