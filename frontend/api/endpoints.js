export const ENDPOINTS = {
   DEALS: {
      GET_DEALS: "/deals",
      GET_FILTERS: "/deals/filters"
   },
   NOTIFICATIONS: {
      LIST: "/api/notifications",
      COUNT: "/api/notifications/count",
      READ_ALL: "/api/notifications/read-all",
      MARK_READ: (id) => `/api/notifications/${id}/read`
   }
}