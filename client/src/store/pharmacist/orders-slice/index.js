import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  approvalURL: null,
  isLoading: false,
  orderId: null,
  pharmacistOrderList: [],
  pharmacistOrderDetails: null,
};

export const fetchAllFilteredOrders = createAsyncThunk(
  "orders/fetchPharmacyOrders",
  async ({ userId, filterParams }) => {
    const query = new URLSearchParams(filterParams).toString();

    const result = await axios.get(
      `http://localhost:5001/api/order/pharmacy/orders/${userId}?${query}`
    );

    return result.data;
  }
);

export const fetchOrderDetails = createAsyncThunk(
  "/orders/fetchPharmacyOrderDetails",
  async (id) => {
    const result = await axios.get(
      `http://localhost:5001/api/order/pharmacy/orderdetail/${id}`
    );
    return result?.data;
  }
);

const PharmacistOrderSlice = createSlice({
  name: "pharmacistOrders",
  initialState,
  reducers: {
    setPharmacistOrderDetails: (state) => {
      state.pharmacistOrderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredOrders.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pharmacistOrderList = action.payload.data;
      })
      .addCase(fetchAllFilteredOrders.rejected, (state) => {
        state.isLoading = false;
        state.pharmacistOrderList = [];
      })
      .addCase(fetchOrderDetails.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pharmacistOrderDetails = action.payload.data;
      })
      .addCase(fetchOrderDetails.rejected, (state) => {
        state.isLoading = false;
        state.pharmacistOrderDetails = null;
      });
  },
});

export default PharmacistOrderSlice.reducer;
