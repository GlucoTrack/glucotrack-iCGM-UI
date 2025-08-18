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
        "editUsers",
        "deleteUser",
        "addUser",
        "getRawUserMeasurementsByUserIds",
        "getUserGroups",
        "addUserGroup",
        "editUserGroup",
        "deleteUserGroup",
        "addUserGroup",
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
    "UserGroups",
    "GlucoseValues",
  ],
  endpoints: (builder) => ({
    //TODO maybe code split per feature
    //*DEVICES
    addDevice: builder.mutation({
      query: (deviceData) => ({
        url: "device",
        method: "POST",
        body: deviceData,
      }),
      invalidatesTags: ["Devices"],
    }),
    getDevices: builder.query({
      query: () => "device",
      providesTags: ["Devices"],
    }),
    getDevice: builder.query({
      query: (deviceId) => ({
        url: `device/${deviceId}`,
      }),
      providesTags: ["Devices"],
    }),
    editDevice: builder.mutation({
      query: ({ deviceId, ...deviceData }) => ({
        url: `device/${deviceId}`,
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
        url: `device/by-ids/${deviceIds}`,
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
        url: `device/${deviceId}`,
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
        url: "mobile",
        method: "POST",
        body: mobileData,
      }),
      invalidatesTags: ["Mobiles"],
    }),
    getMobiles: builder.query({
      query: () => "mobile",
      providesTags: ["Mobiles"],
    }),
    getMobile: builder.query({
      query: (mobileId) => ({
        url: `mobile/${mobileId}`,
      }),
      providesTags: ["Mobiles"],
    }),
    editMobile: builder.mutation({
      query: ({ mobileId, ...mobileData }) => ({
        url: `mobile/${mobileId}`,
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
        url: `mobile/by-ids/${mobileIds}`,
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
        url: `mobile/${mobileId}`,
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
          url: `measurements/devices/${deviceNames}?startTime=${startTime}&endTime=${endTime}`,
        }
      },
      providesTags: ["Measurements"],
    }),
    getAnimalMeasurementsByMobileNames: builder.query({
      query: (args) => {
        const { deviceNames, startTime, endTime } = args
        return {
          url: `measurements/animals/mobiles/${deviceNames}?startTime=${startTime}&endTime=${endTime}`,
        }
      },
      providesTags: ["Measurements"],
    }),
    getRawMeasurementsByMobileNames: builder.query({
      query: (args) => {
        const { deviceNames, startTime, endTime } = args
        return {
          url: `measurements/raw/mobiles/${deviceNames}?startTime=${startTime}&endTime=${endTime}`,
        }
      },
      providesTags: ["Measurements"],
    }),
    getRawUserMeasurementsByUserIds: builder.query({
      query: (args) => {
        const { userIds, startTime, endTime } = args
        return {
          url: `measurements/raw/users/${userIds}?startTime=${startTime}&endTime=${endTime}`,
        }
      },
      providesTags: ["Measurements"],
    }),
    getAnimalMeasurementsBySensorNames: builder.query({
      query: (args) => {
        const { deviceNames, startTime, endTime } = args
        return {
          url: `measurements/animals/sensors/${deviceNames}?startTime=${startTime}&endTime=${endTime}`,
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
    // GLUCOSE VALUES
    getGlucoseValuesByMobileNames: builder.query({
      query: (args) => {
        const { deviceNames, startTime, endTime } = args
        return {
          url: `glucose/by-mobile-names/${deviceNames}?startTime=${startTime}&endTime=${endTime}`,
        }
      },
      providesTags: ["GlucoseValues"],
    }),
    //*MOBILE GROUPS
    addMobileGroup: builder.mutation({
      query: (groupData) => ({
        url: "mobile-groups",
        method: "POST",
        body: groupData,
      }),
      invalidatesTags: ["MobileGroups"],
    }),
    getMobileGroups: builder.query({
      query: () => "mobile-groups",
      providesTags: ["MobileGroups"],
    }),
    editMobileGroup: builder.mutation({
      query: ({ groupId, ...groupData }) => ({
        url: `mobile-groups/${groupId}`,
        method: "PATCH",
        body: groupData,
      }),
      invalidatesTags: ["MobileGroups"],
    }),
    deleteMobileGroup: builder.mutation({
      query: (groupId) => ({
        url: `mobile-groups/${groupId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["MobileGroups"],
    }),
    //*FIRMWARES
    addFirmware: builder.mutation({
      query: (firmwareData) => ({
        url: "firmware",
        method: "POST",
        body: firmwareData,
      }),
      invalidatesTags: ["Firmwares"],
    }),
    getFirmware: builder.query({
      query: (firmwareId) => ({
        url: `firmware/${firmwareId}`,
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
      query: () => "firmware",
      providesTags: ["Firmwares"],
    }),
    //*USERS
    getUsers: builder.query({
      query: () => "user",
      providesTags: ["Users"],
    }),
    getUser: builder.query({
      query: (id) => ({
        url: `user/${id}`,
      }),
      providesTags: ["Users"],
    }),
    editUser: builder.mutation({
      query: ({ id, ...userData }) => ({
        url: `user/${id}`,
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    editUsers: builder.mutation({
      query: ({ userIds, ...userData }) => ({
        url: `user/multiple/${userIds}`,
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Users", id: arg },
        "Users",
      ],
    }),
    deleteUser: builder.mutation({
      query: (id) => ({
        url: `user/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Users"],
    }),
    addUser: builder.mutation({
      query: (userData) => ({
        url: "user",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    //*USER GROUPS
    addUserGroup: builder.mutation({
      query: (groupData) => ({
        url: "user-groups",
        method: "POST",
        body: groupData,
      }),
      invalidatesTags: ["UserGroups"],
    }),
    getUserGroups: builder.query({
      query: () => "user-groups",
      providesTags: ["UserGroups"],
    }),
    editUserGroup: builder.mutation({
      query: ({ groupId, ...groupData }) => ({
        url: `user-groups/${groupId}`,
        method: "PATCH",
        body: groupData,
      }),
      invalidatesTags: ["UserGroups"],
    }),
    deleteUserGroup: builder.mutation({
      query: (groupId) => ({
        url: `user-groups/${groupId}`,
        method: "DELETE",
      }),
      invalidatesTags: ["UserGroups"],
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
  useGetRawUserMeasurementsByUserIdsQuery,
  useGetAnimalMeasurementsBySensorNamesQuery,
  useGetGlucoseValuesByMobileNamesQuery,
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
  useEditUsersMutation,
  useDeleteUserMutation,
  useAddUserMutation,
  useGetUserGroupsQuery,
  useEditUserGroupMutation,
  useDeleteUserGroupMutation,
  useAddUserGroupMutation,
} = apiSlice
