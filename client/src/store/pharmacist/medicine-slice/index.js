import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  medicineList: [],
};

export const addNewMedicine = createAsyncThunk(
  "/medicine/addnewmedicine",
  async (formData) => {
    const result = await axios.post(
      "http://localhost:5001/api/pharmacymedicine/add/",
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return result?.data;
  }
);

export const fetchAllMedicines = createAsyncThunk(
  "/medicine/fetchAllMedicines",
  async () => {
    const result = await axios.get(
      "http://localhost:5001/api/pharmacymedicine/all/"
    );
    return result?.data;
  }
);

export const fetchAllMedicinesByPharmacist = createAsyncThunk(
  "/medicine/fetchAllMedicinesByPharmacist",
  async (pharmacistId) => {
    const result = await axios.get(
      `http://localhost:5001/api/pharmacymedicine/pharmacy/${pharmacistId}`
    );
    return result?.data;
  }
);

export const editMedicine = createAsyncThunk(
  "/medicine/editMedicine",
  async ({ medicineId, formData }) => {
    const result = await axios.put(
      `http://localhost:5001/api/pharmacymedicine/edit/${medicineId}/`,
      formData,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return result?.data;
  }
);

export const deleteMedicine = createAsyncThunk(
  "/medicine/deleteMedicine",
  async ({ userId, medicineId }) => {
    const result = await axios.delete(
      `http://localhost:5001/api/pharmacymedicine/delete/${medicineId}/`,
      {
        data: { userId },
      }
    );
    return result?.data;
  }
);

export const fetchAllFilteredMedicines = createAsyncThunk(
  "/medicine/fetchFilteredMedicines",
  async ({ userId, filterParams }) => {
    const query = new URLSearchParams(filterParams).toString();
    const result = await axios.get(
      `http://localhost:5001/api/pharmacymedicine/pharmacy/${userId}/filter?${query}`
    );
    return result?.data;
  }
);

const PharmacistMedicineSlice = createSlice({
  name: "pharmacistMedicines",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredMedicines.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredMedicines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medicineList = action.payload.data;
      })
      .addCase(fetchAllFilteredMedicines.rejected, (state, action) => {
        state.isLoading = false;
        state.medicineList = [];
      })
      .addCase(fetchAllMedicinesByPharmacist.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllMedicinesByPharmacist.fulfilled, (state, action) => {
        state.isLoading = false;
        state.medicineList = action.payload.data;
      })
      .addCase(fetchAllMedicinesByPharmacist.rejected, (state) => {
        state.isLoading = false;
        state.medicineList = [];
      });
  },
});

export default PharmacistMedicineSlice.reducer;
