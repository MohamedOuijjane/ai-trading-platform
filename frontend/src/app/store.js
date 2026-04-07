import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import marketReducer from '../features/marketSlice';
import portfolioReducer from '../features/portfolio/portfolioSlice';
import predictionsReducer from '../features/predictionsSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    market: marketReducer,
    portfolio: portfolioReducer,
    predictions: predictionsReducer,
  },
});

export default store;
