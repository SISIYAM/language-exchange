import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

// Define the base URL for API requests
const BASE_URL = "http://localhost:8080/api/members";

// Thunk to fetch all members from the API
export const fetchMembers = createAsyncThunk(
  "members/fetchMembers",
  async () => {
    const response = await axios.get(`${BASE_URL}/`);
    return response.data;
  }
);

// Thunk to fetch a single member by ID from the API
export const fetchMemberById = createAsyncThunk(
  "members/fetchMemberById",
  async (id) => {
    const response = await axios.get(`${BASE_URL}/${id}`);
    return response.data;
  }
);

// Thunk to add a new member
export const addMember = createAsyncThunk(
  "members/addMember",
  async (newMember, { getState }) => {
    const state = getState();
    const token = state.auth.token; // Assuming auth state holds the token
    const response = await axios.post(`${BASE_URL}/`, newMember, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  }
);

const membersSlice = createSlice({
  name: "members",
  initialState: {
    members: [],
    member: null,
    status: "idle",
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMembers.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMembers.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.members = action.payload;
      })
      .addCase(fetchMembers.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(fetchMemberById.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchMemberById.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.member = action.payload;
      })
      .addCase(fetchMemberById.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message;
      })
      .addCase(addMember.fulfilled, (state, action) => {
        state.members.push(action.payload);
      });
  },
});

export default membersSlice.reducer;
