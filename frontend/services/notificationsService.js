import api from "../api/axiosInstancs";
import { ENDPOINTS } from "../api/endpoints";

const buildParams = (userId) => {
  if (userId === null || userId === undefined) {
    return undefined;
  }
  return { userId };
};

const notificationsService = {
  getAll: ({ userId } = {}) =>
    api.get(ENDPOINTS.NOTIFICATIONS.LIST, { params: buildParams(userId) }),

  getCount: ({ userId } = {}) =>
    api.get(ENDPOINTS.NOTIFICATIONS.COUNT, { params: buildParams(userId) }),

  markRead: (id) => api.patch(ENDPOINTS.NOTIFICATIONS.MARK_READ(id)),

  markAllRead: ({ userId } = {}) =>
    api.patch(ENDPOINTS.NOTIFICATIONS.READ_ALL, buildParams(userId) || {}),
};

export default notificationsService;
