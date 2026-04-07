import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  latestPredictions: [],
  history: [],
  loading: false,
  error: null,
};

const predictionsSlice = createSlice({
  name: 'predictions',
  initialState,
  reducers: {
    addPrediction: (state, action) => {
      state.latestPredictions = [action.payload, ...state.latestPredictions.slice(0, 9)];
    },
    setPredictionsHistory: (state, action) => {
      state.history = action.payload;
    },
    setPredictionsLoading: (state, action) => {
      state.loading = action.payload;
    }
  },
});

export const { addPrediction, setPredictionsHistory, setPredictionsLoading } = predictionsSlice.actions;
export default predictionsSlice.reducer;
