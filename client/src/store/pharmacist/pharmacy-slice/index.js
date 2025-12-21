import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  pharmacyList: [],
};

export const addPharmacy = createAsyncThunk(
  "/pharmacy/addPharmacy",
  async (formData) => {
    const response = await axios.post(
      "http://localhost:5001/api/pharmacy/add/",
      formData
    );
    return response.data;
  }
);

export const fetchAllPharmaciesByUser = createAsyncThunk(
  "/pharmacy/fetchAllPharmaciesByUser",
  async (userId) => {
    const response = await axios.get(
      `http://localhost:5001/api/pharmacy/get/${userId}`
    );
    return response.data;
  }
);

export const editPharmacy = createAsyncThunk(
  "/pharmacy/editPharmacy",
  async ({ userId, pharmacyId, formData }) => {
    const response = await axios.put(
      `http://localhost:5001/api/pharmacy/update/${userId}/${pharmacyId}`,
      formData
    );
    return response.data;
  }
);

export const deletePharmacy = createAsyncThunk(
  "/pharmacy/deletePharmacy",
  async ({ userId, pharmacyId }) => {
    const response = await axios.delete(
      `http://localhost:5001/api/pharmacy/delete/${userId}/${pharmacyId}`
    );
    return response.data;
  }
);

const pharmacySlice = createSlice({
  name: "pharmacy",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(addPharmacy.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addPharmacy.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(addPharmacy.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(fetchAllPharmaciesByUser.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllPharmaciesByUser.fulfilled, (state, action) => {
        console.log("FETCH PHARMACY RESPONSE:", action.payload);
        state.isLoading = false;
        state.pharmacyList = action.payload.data;
      })
      .addCase(fetchAllPharmaciesByUser.rejected, (state) => {
        state.isLoading = false;
        state.pharmacyList = [];
      });
  },
});
export default pharmacySlice.reducer;
