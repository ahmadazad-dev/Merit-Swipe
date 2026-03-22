import api from "../api/axiosInstancs"
import { ENDPOINTS } from "../api/endpoints"

const dealsService = {
   getDeals: (params) => {
      return api.get(ENDPOINTS.DEALS.GET_DEALS, { params })
   },

   getFilters: () => {
      return api.get(ENDPOINTS.DEALS.GET_FILTERS)
   }
}

export default dealsService;