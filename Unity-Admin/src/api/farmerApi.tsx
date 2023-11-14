import axios from "axios";

const url = import.meta.env.VITE_API_URL;
const api = `${url}farmer/`;

const token = localStorage.getItem("token") || "";

//get all categories
export const getCustomers = async () => {
  try{

    const response = await axios.get(`${api}`, {
      headers: {
        "Content-Type": "application/json",
        authtoken: `${token}`,
      },
    });
    return response.data;
  }catch(err){
    throw err;
  }
  // console.log(" Get  Data Customer ",`${api}get`)
};

//create category
export const createCustomer = async (data: any) => {
  try{
    delete data.id;
    console.log(data, " Create Customer ");
    const response = await axios.post(`${api}`, data, {
      headers: {
        "Content-Type": "application/json",
        authtoken: `${token}`,
      },
    });
    console.log(" Response ", response);
    return response.data;
  }catch(err) {
    throw err;
  }
};

//get category by id
export const getCustomerById = async (id: any) => {
  console.log(" Get Farmer by ID ",id)
  const response = await axios.get(`${api}find/${id}`, {
    headers: {
      "Content-Type": "application/json",
      authtoken: `${token}`,
    },
  });
  console.log(" Get Farmer Response ",response?.data);
  return response.data;
};

export const getTankById = async (id: any) => {
  console.log(" Get Tank By by ID ", id);
  const response = await axios.get(`${url}tank/farmer/${id}`, {
    headers: {
      "Content-Type": "application/json",
      authtoken: `${token}`,
    },
  });
  console.log(" Get Tanks Response ", response?.data);
  return response?.data;
};
//update category
export const updateCustomer = async (id: any) => {
  console.log(" Approve User ", id);
  const response = await axios.put(`${api}approve/${id}`, {
    headers: {
      "Content-Type": "application/json",
      authtoken: `${token}`,
    },
  });
  console.log(" Approve Respone ", response);
  return response.data;
};

export const deleteCustomer = async (id: any) => {
  console.log(" Delete Customer ", id);
  const response = await axios.delete(`${api}delete/${id}`, {
    headers: {
      "Content-Type": "application/json",
      authtoken: `${token}`,
    },
  });
  console.log(" Response Delete  ", response);
  return response.data;
};
export const deleteTank = async (id: any) => {
  console.log(" Delete Customer ", id);
  const response = await axios.delete(`${url}tank/delete/${id}`, {
    headers: {
      "Content-Type": "application/json",
      authtoken: `${token}`,
    },
  });
  console.log(" Response Delete  ", response);
  return response.data;
};

export const register = async (data: any) => {
  try {
    const response = await axios.post(`${api}create`, data, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const login = async (data: any) => {
  try {
    console.log(" Login  Data Customer ", `${api}login`, data);
    const response = await axios.post(`${api}login`, data, {
      headers: {
        "Content-Type": "application/json",
        authtoken: `${token}`,
      },
    });
    console.log(" Login Response ", response);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const logout = async () => {
  try {
    const response = await axios.get(`${api}/logout`);
    return response.data;
  } catch (error) {
    console.log(error);
    throw error;
  }
};
