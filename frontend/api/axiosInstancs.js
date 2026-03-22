import axios from "axios"

const api = axios.create({
   baseURL:"http://localhost:5000",
   timeout:10000,
   headers:{
      "Content-Type":"application/json"
   },
})

api.interceptors.request.use((config)=>{
   const token = localStorage.getItem("token");
   if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      return config
   }
},
   (error)=>{
      return Promise.reject(error);
   }  
)

api.interceptors.response.use(
   (response)=>{
      return response;
   },
   (error)=>{
      const status = error.response?.status;
      if(status === 401){
         localStorage.removeItem("token");
      }
      if(status === 403){
         //baad mei
      }
      if(status === 500){
         console.log("Internal Server Error");
      }
      return Promise.reject(error);
   }
);

export default api;