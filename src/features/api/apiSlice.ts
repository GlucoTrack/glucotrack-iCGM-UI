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
      query: ({ deviceNames, startDate, endDate, startTime, endTime }) =>
        `measurements/readAveragesAndStdsByDayAndDeviceNames/${deviceNames}?startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}`,
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
