import axios from "axios";

const api = import.meta.env.VITE_API_URL;
const url = `${api}market`;

const token = localStorage.getItem("token");

export const getSales = async () => {
  // console.log(" Get All sales ", `${url}/farmer/all`);
  const response = await axios.get(`${url}/type/all`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(" Response Get Sales ", response?.data);
  return response.data;
};

export const createSale = async (data: any) => {
  delete data.id
  console.log(" Create Market API ", data);
  const response = await axios.post(`${url}/zone/`, data, {
    headers: {
      "Content-Type": "application/json",
      authtoken: `${token}`,
    },
  });
  console.log(" Market Response = ", response);
  return response.data;
};

export const updateSale = async (id: string, data: any) => {
  const response = await axios.put(`${url}/farmer/${id}`, data, {
    headers: {
      "Content-Type": "application/json",
      authtoken: `${token}`,
    },
  });
  return response.data;
};

export const deleteSale = async (id: string) => {
  const response = await axios.delete(`${url}/type/${id}`, {
    headers: {
      "Content-Type": "application/json",
      authtoken: `${token}`,
    },
  });
  console.log(" Delete Response ",id, response?.data);
  return response.data;
};

export const getAllReport = async () => {
  const response = await axios.get(`${url}/`, {
    headers: {
      "Content-Type": "application/json",
      authtoken: `${token}`,
    },
  });

  return response.data;
};

export const getReportByWeek = async () => {
  try {
    const response = await axios.get(`${url}/week`, {
      headers: {
        "Content-Type": "application/json",
        authtoken: `${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getSalesDetails = async (id: string) => {
  try {
    const response = await axios.get(`${url}/farmer/${id}`, {
      headers: {
        "Content-Type": "application/json",
        authtoken: `${token}`,
      },
    });

    return response?.data;
  } catch (error) {
    console.error(error);
  }
};
