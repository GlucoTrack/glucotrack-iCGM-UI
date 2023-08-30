import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react"
const token = sessionStorage.getItem('token');
//console.log ('Session JWT in API: ', token)

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: import.meta.env.VITE_API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      // Get token from session storage
      const token = sessionStorage.getItem('token');
      
      // If the token exists, set it in the headers
      if (token) {
        headers.set('authorization', `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Devices", "Groups", "Measurements", "AveragesAndStds", "Users", "Email"],
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

    //*USERS
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
    getUserById: builder.query({
      query: (userId) => ({
        url: `users/readById/${userId}`,
      }),
      providesTags: ["Users"],
    }),
    getUserByName: builder.query({
      query: (userame) => ({
        url: `users/readByUsername/${userame}`,
      }),
      providesTags: ["Users"],
    }),
    getUsers: builder.query({
      query: () => "users/read",
      providesTags: ["Users"],
    }),
    editUser: builder.mutation({
      query: ({ userId, ...userData }) => ({
        url: `users/updateByUserId/${userId}`,
        method: "PATCH",
        body: userData,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Users", id: arg },
        "Users",
      ],
    }),
    deleteUser: builder.mutation({
      query: (userId) => ({
        url: `users/delete/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Users", id: arg },
        "Users",
      ],
    }),

    // Login
    resetPassword: builder.mutation({
      query: (passwordData) => ({
        url: "users/resetpassword",
        method: "POST",
        body: passwordData,
      }),
      invalidatesTags: ["Users"],
    }),  
    loginUser: builder.mutation({
      query: (userData) => ({
        url: "users/login",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["Users"],
    }),
    validateToken: builder.mutation({
      query: (tokenInfo) => ({
        url: `users/validate/${tokenInfo.token}/${tokenInfo.eMail}/${tokenInfo.username}`,
        method: "GET",
      }),
      invalidatesTags: ["Users"],
    }),

    forgotPasswordEmail: builder.mutation({
      query: (emailData) => ({
        url: "email/forgotPasswordEmail",
        method: "POST",
        body: emailData,
      }),
      invalidatesTags: ["Email"],
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
  useGetUserByIdQuery,
  useGetUserByNameQuery,
  useGetUsersQuery,
  useEditUserMutation,
  useDeleteUserMutation,
  useResetPasswordMutation,
  useLoginUserMutation,
  useValidateTokenMutation,
  useForgotPasswordEmailMutation,
} = apiSlice
