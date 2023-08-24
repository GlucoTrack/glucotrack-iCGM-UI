import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Devices", "Groups", "Measurements", "AveragesAndStds", "Users"],
  endpoints: (builder) => ({
    //TODO maybe code split per feature
    //*DEVICES
    addDevice: builder.mutation({
      query: (deviceData) => ({
        url: "device/create",
        method: "POST",
        body: deviceData,
      }),
      invalidatesTags: ["Devices"],
    }),
    getDevices: builder.query({
      query: () => "device/read",
      providesTags: ["Devices"],
    }),
    getDevice: builder.query({
      query: (deviceId) => ({
        url: `device/read/${deviceId}`,
      }),
      providesTags: ["Devices"],
    }),
    editDevice: builder.mutation({
      query: ({ deviceId, ...deviceData }) => ({
        url: `device/updateDeviceId/${deviceId}`,
        method: "PATCH",
        body: deviceData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Devices", id: arg },
        "Devices",
      ],
    }),
    deleteDevice: builder.mutation({
      query: (deviceId) => ({
        url: `device/delete/${deviceId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Devices", id: arg },
        "Devices",
      ],
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
    deleteGroup: builder.mutation({
      query: (groupId) => ({
        url: `groups/delete/${groupId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Groups"],
    }),
    //*MEASUREMENTS
    getMeasurementsByDeviceNames: builder.query({
      query: (args) => {
        const { deviceNames, startTime, endTime } = args
        return {
          url: `measurements/readDeviceNames/${deviceNames}?startTime=${startTime}&endTime=${endTime}`,
        }
      },
      providesTags: ["Measurements"],
    }),
    getAveragesAndStds: builder.query({
      query: (args) => {
        const { deviceNames, startDate, endDate, startTime, endTime } = args
        return {
          url: `measurements/readAveragesAndStdsByDayAndDeviceNames/${deviceNames}?startDate=${startDate}&endDate=${endDate}&startTime=${startTime}&endTime=${endTime}`,
        }
      },
      providesTags: ["AveragesAndStds"],
    }),
    addUser: builder.mutation({
      query: (userData) => ({
        url: "users/create",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: [
        "Users"
      ],
    }),
    resetPassword: builder.mutation({
      query: (passwordData) => ({
        url: "users/resetPassword",
        method: "POST",
        body: passwordData,
      }),
      invalidatesTags: ["Users"],
    }),    
  }),
})

export const {
  useAddDeviceMutation,
  useGetDevicesQuery,
  useGetDeviceQuery,
  useEditDeviceMutation,
  useDeleteDeviceMutation,
  useAddGroupMutation,
  useGetGroupsQuery,
  useEditGroupMutation,
  useDeleteGroupMutation,
  useGetMeasurementsByDeviceNamesQuery,
  useGetAveragesAndStdsQuery,
  useAddUserMutation,
  useResetPasswordMutation,
} = apiSlice
