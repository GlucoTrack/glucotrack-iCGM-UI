import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
  }),
  tagTypes: ["Devices", "Mobiles", "Groups", "Measurements", "AveragesAndStds"],
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
    editDevices: builder.mutation({
      query: ({ deviceIds, ...deviceData }) => ({
        url: `device/updateDeviceIds/${deviceIds}`,
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
    //*MOBILES
    addMobile: builder.mutation({
      query: (mobileData) => ({
        url: "mobile/create",
        method: "POST",
        body: mobileData,
      }),
      invalidatesTags: ["Mobiles"],
    }),
    getMobiles: builder.query({
      query: () => "mobile/read",
      providesTags: ["Mobiles"],
    }),
    getMobile: builder.query({
      query: (mobileId) => ({
        url: `mobile/readByMobileId/${mobileId}`,
      }),
      providesTags: ["Mobiles"],
    }),
    editMobile: builder.mutation({
      query: ({ mobileId, ...mobileData }) => ({
        url: `mobile/updateByMobileId/${mobileId}`,
        method: "PATCH",
        body: mobileData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Mobiles", id: arg },
        "Mobiles",
      ],
    }),
    deleteMobile: builder.mutation({
      query: (mobileId) => ({
        url: `mobile/deleteByMobileId/${mobileId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Mobiles", id: arg },
        "Mobiles",
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
    getAnimalMeasurementsByMobileNames: builder.query({
      query: (args) => {
        const { deviceNames, startTime, endTime } = args
        return {
          url: `measurements/readAnimalMobileNames/${deviceNames}?startTime=${startTime}&endTime=${endTime}`,
        }
      },
      providesTags: ["Measurements"],
    }),
    getAnimalMeasurementsBySensorNames: builder.query({
      query: (args) => {
        const { deviceNames, startTime, endTime } = args
        return {
          url: `measurements/readAnimalSensorNames/${deviceNames}?startTime=${startTime}&endTime=${endTime}`,
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
  }),
})

export const {
  useAddDeviceMutation,
  useGetDevicesQuery,
  useGetDeviceQuery,
  useEditDeviceMutation,
  useEditDevicesMutation,
  useDeleteDeviceMutation,
  useAddMobileMutation,
  useGetMobilesQuery,
  useGetMobileQuery,
  useEditMobileMutation,
  useDeleteMobileMutation,
  useAddGroupMutation,
  useGetGroupsQuery,
  useEditGroupMutation,
  useDeleteGroupMutation,
  useGetMeasurementsByDeviceNamesQuery,
  useGetAnimalMeasurementsByMobileNamesQuery,
  useGetAnimalMeasurementsBySensorNamesQuery,
  useGetAveragesAndStdsQuery,
} = apiSlice
