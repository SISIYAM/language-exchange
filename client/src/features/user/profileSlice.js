import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import Cookies from "js-cookie"; // Import Cookies for handling JWT tokens

// Define API URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.interceptors.request.use((config) => {
  const token = Cookies.get("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Helper function to validate token
const validateToken = () => {
  const token = Cookies.get("token");
  if (!token) {
    throw new Error("No token found. Please log in again.");
  }
  return token;
};

// Create profile
export const createProfile = createAsyncThunk(
  "profile/createProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const token = validateToken();
      const response = await axios.post(`/profile/create`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response ? error.response.data : error.message
      );
    }
  }
);

// Fetch profile data for the current user
export const fetchProfile = createAsyncThunk(
  "profile/fetchProfile",
  async (_, { rejectWithValue }) => {
    try {
      const token = validateToken();
      const response = await axios.get("/profile/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to fetch profile"
      );
    }
  }
);

// Update profile data for the current user
export const updateProfile = createAsyncThunk(
  "profile/updateProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const token = validateToken();
      const response = await axios.put("/profile/me", profileData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to update profile"
      );
    }
  }
);

// Delete profile
export const deleteProfile = createAsyncThunk(
  "profile/deleteProfile",
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.delete("/api/profile");
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.message || "Failed to delete profile"
      );
    }
  }
);

// Profile Slice
const profileSlice = createSlice({
  name: "profile",
  initialState: {
    profile: null,
    status: "idle", // idle | loading | succeeded | failed
    error: null,
  },
  reducers: {
    // Reset profile state
    resetProfile: (state) => {
      state.profile = null;
      state.status = "idle";
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch profile
      .addCase(fetchProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(fetchProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
        state.error = null;
      })
      .addCase(fetchProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Update profile
      .addCase(updateProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload.profile;
        state.error = null;
      })
      .addCase(updateProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Create profile
      .addCase(createProfile.pending, (state) => {
        state.status = "loading";
      })
      .addCase(createProfile.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.profile = action.payload;
      })
      .addCase(createProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })

      // Delete profile
      .addCase(deleteProfile.pending, (state) => {
        state.status = "loading";
        state.error = null;
      })
      .addCase(deleteProfile.fulfilled, (state) => {
        state.status = "succeeded";
        state.profile = null;
      })
      .addCase(deleteProfile.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      });
  },
});

// Export actions
export const { resetProfile } = profileSlice.actions;

// Export reducer
export default profileSlice.reducer;
