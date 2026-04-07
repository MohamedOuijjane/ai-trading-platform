import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import portfolioApi from "../../api/portfolio.api";

export const fetchPortfolio = createAsyncThunk(
  "portfolio/fetchPortfolio",
  async (_, { rejectWithValue }) => {
    try {
      const response = await portfolioApi.getPortfolio();
      return response;
    } catch (err) {
      return rejectWithValue(err.message);
    }
  },
);

const initialState = {
  balance: 0,
  positions: [],
  history: [],
  loading: false,
  error: null,
};

const portfolioSlice = createSlice({
  name: "portfolio",
  initialState,
  reducers: {
    updateBalance: (state, action) => {
      state.balance = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPortfolio.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPortfolio.fulfilled, (state, action) => {
        state.loading = false;
        state.balance = action.payload.portfolio.balance;
        state.positions = action.payload.portfolio.positions;
        state.history = action.payload.history;
      })
      .addCase(fetchPortfolio.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { updateBalance } = portfolioSlice.actions;
export default portfolioSlice.reducer;
