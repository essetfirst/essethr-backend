import axios from "axios";

// Base URL for the request
const api = import.meta.env.VITE_API_URL;
const url = `${api}discount`;

//Heders for the request
const token = localStorage.getItem("token");

export const getDiscounts = async () => {
    try {
        const response = await axios.get(`${url}/get`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const getDiscount = async (id: string) => {
    try {
        const response = await axios.get(`${url}/get/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}

export const createDiscount = async (data: any) => {
    try {
        const response = await axios.post(`${url}/create`, data, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}


export const updateDiscount = async (id: string, data: any) => {
    try {
        const response = await axios.put(`${url}/update/${id}`, data, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}


export const deleteDiscount = async (id: string) => {
    try {
        const response = await axios.delete(`${url}/delete/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error(error);
    }
}   