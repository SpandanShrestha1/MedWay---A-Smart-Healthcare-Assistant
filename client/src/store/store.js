import authReducer from "./auth-slice";
import pharmacySlice from "./pharmacist/pharmacy-slice";
import pharmacistMedicineSlice from "./pharmacist/medicine-slice";
import pharmacistOrderSlice from "./pharmacist/orders-slice";

import { configureStore } from "@reduxjs/toolkit";

const store = configureStore({
  reducer: {
    auth: authReducer,
    pharmacy: pharmacySlice,
    pharmacistMedicines: pharmacistMedicineSlice,
    pharmacistOrders: pharmacistOrderSlice,
  },
});

export default store;
