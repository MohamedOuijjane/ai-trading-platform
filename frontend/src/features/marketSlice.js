import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  prices: {}, // { AAPL: 150.00, ... }
  signals: {}, // { AAPL: 'BUY', ... }
  loading: false,
  error: null,
};

const marketSlice = createSlice({
  name: 'market',
  initialState,
  reducers: {
    updatePrice: (state, action) => {
      const { ticker, price } = action.payload;
      state.prices[ticker] = price;
    },
    updateSignal: (state, action) => {
      const { ticker, signal } = action.payload;
      state.signals[ticker] = signal;
    },
    setMarketLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
});

export const { updatePrice, updateSignal, setMarketLoading } = marketSlice.actions;
export default marketSlice.reducer;
