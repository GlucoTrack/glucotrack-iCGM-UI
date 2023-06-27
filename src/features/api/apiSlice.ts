import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  //TODO will need to add Tags in general and per endpoint
  endpoints: (builder) => ({
    //TODO maybe separate per feature with injectEndpoints
    getDevices: builder.query({
      query: () => "device/read",
    }),
    getAveragesAndStds: builder.query({
      query: (deviceNames) =>
        `measurements/readAveragesAndStdsByDayAndDeviceNames/${deviceNames}?startDate=2023-04-10&endDate=2023-04-12&startTime=23%3A29%3A00&endTime=23%3A59%3A59`,
    }),
    getGroups: builder.query({
      query: () => "groups/read",
    }),
  }),
})

export const {
  useGetDevicesQuery,
  useGetAveragesAndStdsQuery,
  useGetGroupsQuery,
} = apiSlice
