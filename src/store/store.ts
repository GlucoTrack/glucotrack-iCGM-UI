import { configureStore } from "@reduxjs/toolkit"
import navbarReducer from "@/features/navbar/navbarSlice"
import groupsReducer from "@/features/groups/groupsSlice"
import measurementsReducer from "@/components/measurements/measurementsSlice"
import { apiSlice } from "@/features/api/apiSlice"

export const store = configureStore({
  reducer: {
    navbar: navbarReducer,
    groups: groupsReducer,
    measurements: measurementsReducer,
    [apiSlice.reducerPath]: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(
      apiSlice.middleware,
    ),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
