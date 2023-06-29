import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Devices", "Groups", "AveragesAndStds"],
  endpoints: (builder) => ({
    //TODO maybe separate per feature with injectEndpoints
    //*DEVICES
    getDevices: builder.query({
      query: () => "device/read",
      providesTags: ["Devices"],
    }),
    //*GROUPS
    addGroup: builder.mutation({
      query: (groupData) => ({
        url: "groups/create",
        method: "POST",
        body: groupData,
      }),
      invalidatesTags: ["Groups"],
    }),
    getGroups: builder.query({
      query: () => "groups/read",
      providesTags: ["Groups"],
    }),
    editGroup: builder.mutation({
      query: ({ groupId, ...groupData }) => ({
        url: `groups/updateByGroupId/${groupId}`,
        method: "PATCH",
        body: groupData,
      }),
      invalidatesTags: ["Groups"],
    }),
    //*MEASUREMENTS
    getAveragesAndStds: builder.query({
      query: (args) => {
        const { deviceNames, startDate, endDate, startTime, endTime } = args
        return {
          url: `measurements/readAveragesAndStdsByDayAndDeviceNames/${deviceNames}?startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}`,
        }
      },
      providesTags: ["AveragesAndStds"],
    }),
  }),
})

export const {
  useGetDevicesQuery,
  useGetAveragesAndStdsQuery,
  useAddGroupMutation,
  useGetGroupsQuery,
  useEditGroupMutation,
} = apiSlice
