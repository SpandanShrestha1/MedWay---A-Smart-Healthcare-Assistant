import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isLoading: false,
  revenuestats: null,
  revenuetrend: null,
  topcategory: null,
  topMedicines: [],
  recentTransactions: [],
};
// fetch pharmacy-revenue-slice data
export const fetchRevenueStats = createAsyncThunk(
  "/pharmacy/fetchallrevenue",
  async () => {
    try {
      const result = await axios.get(
        "http://localhost:5001/api/pharmacy/revenue/revenue-stats",
        { withCredentials: true }
      );
      return result?.data;
    } catch (e) {
      console.log("error to fetch revenue stats");
    }
  }
);

export const fetchRevenueTrend = createAsyncThunk(
  "/pharmacy/fetchRevenueTrend",
  async () => {
    try {
      const result = await axios.get(
        "http://localhost:5001/api/pharmacy/revenue/revenue-trend",
        { withCredentials: true }
      );
      return result?.data;
    } catch (e) {
      console.log("error to fetch revenue trend");
    }
  }
);

export const fetchRevenueForTopSellingCategory = createAsyncThunk(
  "/pharmacy/fetchTopSellingCategory",
  async () => {
    try {
      const result = await axios.get(
        "http://localhost:5001/api/pharmacy/revenue/revenue-topSelling-cat",
        { withCredentials: true }
      );
      return result?.data;
    } catch (e) {
      console.log("error to fetch revenue trend");
    }
  }
);

export const fetchTopMedicines = createAsyncThunk(
  "/pharmacy/fetchTopMedicines",
  async () => {
    try {
      const result = await axios.get(
        "http://localhost:5001/api/pharmacy/revenue/revenue-topSelling-med",
        { withCredentials: true }
      );
      return result?.data;
    } catch (e) {
      console.log("error to fetch revenue trend");
    }
  }
);

export const fetchRecentTransactions = createAsyncThunk(
  "/pharmacy/fetchRecentTransactions",
  async () => {
    try {
      const result = await axios.get(
        "http://localhost:5001/api/pharmacy/revenue/revenue-recent-transactions",
        { withCredentials: true }
      );
      return result?.data;
    } catch (e) {
      console.log("error to fetch revenue trend");
    }
  }
);

const revenueSlice = createSlice({
  name: "revenueslice",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRevenueStats.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRevenueStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenuestats = action.payload;
      })
      .addCase(fetchRevenueStats.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(fetchRevenueTrend.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRevenueTrend.fulfilled, (state, action) => {
        state.isLoading = false;
        state.revenuetrend = action.payload;
      })
      .addCase(fetchRevenueForTopSellingCategory.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRevenueForTopSellingCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topcategory = action.payload;
      })
      .addCase(fetchRevenueForTopSellingCategory.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(fetchTopMedicines.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchTopMedicines.fulfilled, (state, action) => {
        state.isLoading = false;
        state.topMedicines = action.payload;
      })
      .addCase(fetchTopMedicines.rejected, (state, action) => {
        state.isLoading = false;
      })
      .addCase(fetchRecentTransactions.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchRecentTransactions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.recentTransactions = action.payload;
      })
      .addCase(fetchRecentTransactions.rejected, (state, action) => {
        state.isLoading = false;
      });
  },
});

export default revenueSlice.reducer;
