import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Fetch dashboard data
export const fetchDashboardStats = createAsyncThunk(
  "dashboard/fetchDashboardStats",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        "http://localhost:5001/api/pharmacy/dashboard/stats",
        { withCredentials: true }
      );
      console.log("LowStock dashboard data:", data);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Error loading dashboard"
      );
    }
  }
);

// Fetch recent orders
export const fetchRecentOrders = createAsyncThunk(
  "dashboard/fetchRecentOrders",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        "http://localhost:5001/api/pharmacy/dashboard/recent-orders",
        { withCredentials: true }
      );
      console.log("fetch recent orders:", data);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error loading recent orders"
      );
    }
  }
);

//  Fetch low stock alerts
export const fetchLowStock = createAsyncThunk(
  "dashboard/fetchLowStock",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await axios.get(
        "http://localhost:5001/api/pharmacy/dashboard/low-stock",
        { withCredentials: true }
      );
      console.log("LowStock API response:", data);
      return data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || "Error loading low stock"
      );
    }
  }
);

const dashboardSlice = createSlice({
  name: "dashboard",
  initialState: {
    stats: null,
    recentOrders: [],
    lowStock: [],
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    // Stats
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Recent Orders
    builder
      .addCase(fetchRecentOrders.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRecentOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.recentOrders = action.payload;
      })
      .addCase(fetchRecentOrders.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Low Stock
    builder
      .addCase(fetchLowStock.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchLowStock.fulfilled, (state, action) => {
        state.loading = false;
        state.lowStock = action.payload;
      })
      .addCase(fetchLowStock.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default dashboardSlice.reducer;
