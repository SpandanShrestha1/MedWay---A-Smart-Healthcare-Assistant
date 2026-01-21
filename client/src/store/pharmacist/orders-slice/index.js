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

export const updatePharmacistOrderStatus = createAsyncThunk(
  "/orders/updateOrderStatus",
  async ({ id, status }) => {
    const response = await axios.patch(
      `http://localhost:5001/api/order/pharmacy/orders/${id}/status`,
      {
        status,
      }
    );
    return response.data;
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
    resetPharmacistOrderDetails: (state) => {
      state.pharmacistOrderDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllFilteredOrders.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchAllFilteredOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pharmacistOrderList = action.payload.data;
      })
      .addCase(fetchAllFilteredOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.pharmacistOrderList = [];
      })
      .addCase(fetchOrderDetails.pending, (state, action) => {
        state.isLoading = true;
      })
      .addCase(fetchOrderDetails.fulfilled, (state, action) => {
        state.isLoading = false;
        state.pharmacistOrderDetails = action.payload.data;
      })
      .addCase(fetchOrderDetails.rejected, (state, action) => {
        state.isLoading = false;
        state.pharmacistOrderDetails = null;
      });
  },
});

export const { resetPharmacistOrderDetails } = PharmacistOrderSlice.actions;
export default PharmacistOrderSlice.reducer;
