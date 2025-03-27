import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
import { RootState } from "@/store/store"

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState, endpoint }) => {
      const token = (getState() as RootState)?.auth?.token

      const endpointsWithAuth = new Set([
        "getUsers",
        "getUser",
        "editUser",
        "deleteUser",
        "addUser",
      ])

      if (endpointsWithAuth.has(endpoint) && token) {
        headers.set("Authorization", `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: [
    "Devices",
    "Mobiles",
    "Groups",
    "Measurements",
    "AveragesAndStds",
    "MobileGroups",
    "Firmwares",
    "Users",
  ],
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
    editMobiles: builder.mutation({
      query: ({ mobileIds, ...mobileData }) => ({
        url: `mobile/updateMobileIds/${mobileIds}`,
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
        url: "groups",
        method: "POST",
        body: groupData,
      }),
      invalidatesTags: ["Groups"],
    }),
    getGroups: builder.query({
      query: () => "groups",
      providesTags: ["Groups"],
    }),
    editGroup: builder.mutation({
      query: ({ groupId, ...groupData }) => ({
        url: `groups/${groupId}`,
        method: "PATCH",
        body: groupData,
      }),
      invalidatesTags: ["Groups"],
    }),
    deleteGroup: builder.mutation({
      query: (groupId) => ({
        url: `groups/${groupId}`,
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
    getRawMeasurementsByMobileNames: builder.query({
      query: (args) => {
        const { deviceNames, startTime, endTime } = args
        return {
          url: `measurements/raw/${deviceNames}?startTime=${startTime}&endTime=${endTime}`,
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
    //*MOBILE GROUPS
    addMobileGroup: builder.mutation({
      query: (groupData) => ({
        url: "mobileGroups",
        method: "POST",
        body: groupData,
      }),
      invalidatesTags: ["MobileGroups"],
    }),
    getMobileGroups: builder.query({
      query: () => "mobileGroups",
      providesTags: ["MobileGroups"],
    }),
    editMobileGroup: builder.mutation({
      query: ({ groupId, ...groupData }) => ({
        url: `mobileGroups/${groupId}`,
        method: "PATCH",
        body: groupData,
      }),
      invalidatesTags: ["MobileGroups"],
    }),
    deleteMobileGroup: builder.mutation({
      query: (groupId) => ({
        url: `mobileGroups/${groupId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MobileGroups"],
    }),
    //*FIRMWARES
    addFirmware: builder.mutation({
      query: (firmwareData) => ({
        url: "firmware/create",
        method: "POST",
        body: firmwareData,
      }),
      invalidatesTags: ["Firmwares"],
    }),
    getFirmware: builder.query({
      query: (firmwareId) => ({
        url: `firmware/read/${firmwareId}`,
      }),
      providesTags: ["Firmwares"],
    }),
    editFirmware: builder.mutation({
      query: ({ firmwareId, ...firmwareData }) => ({
        url: `firmware/${firmwareId}`,
        method: "PATCH",
        body: firmwareData,
      }),
      invalidatesTags: ["Firmwares"],
    }),
    deleteFirmware: builder.mutation({
      query: (firmwareId) => ({
        url: `firmware/${firmwareId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Firmwares"],
    }),
    getFirmwares: builder.query({
      query: () => "firmware/read",
      providesTags: ["Firmwares"],
    }),
    //*USERS
    getUsers: builder.query({
      query: () => "user/read",
      providesTags: ["Users"],
    }),
    getUser: builder.query({
      query: (userId) => ({
        url: `user/readByUserId/${userId}`,
      }),
      providesTags: ["Users"],
    }),
    editUser: builder.mutation({
      query: ({ userId, ...userData }) => ({
        url: `user/updateByUserId/${userId}`,
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `user/deleteByUserId/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
    addUser: builder.mutation({
      query: (userData) => ({
        url: "user/create",
        method: "POST",
        body: userData,
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
  useEditDevicesMutation,
  useDeleteDeviceMutation,
  useAddMobileMutation,
  useGetMobilesQuery,
  useGetMobileQuery,
  useEditMobileMutation,
  useEditMobilesMutation,
  useDeleteMobileMutation,
  useAddGroupMutation,
  useGetGroupsQuery,
  useEditGroupMutation,
  useDeleteGroupMutation,
  useGetMeasurementsByDeviceNamesQuery,
  useGetAnimalMeasurementsByMobileNamesQuery,
  useGetRawMeasurementsByMobileNamesQuery,
  useGetAnimalMeasurementsBySensorNamesQuery,
  useGetAveragesAndStdsQuery,
  useAddMobileGroupMutation,
  useGetMobileGroupsQuery,
  useEditMobileGroupMutation,
  useDeleteMobileGroupMutation,
  useAddFirmwareMutation,
  useGetFirmwaresQuery,
  useGetFirmwareQuery,
  useEditFirmwareMutation,
  useDeleteFirmwareMutation,
  useGetUsersQuery,
  useGetUserQuery,
  useEditUserMutation,
  useDeleteUserMutation,
  useAddUserMutation,
} = apiSlice
