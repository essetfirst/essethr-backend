import axios from "axios";


const api = import.meta.env.VITE_API_URL;
const url = `${api}user`;

export const register = async (data: any) => {
    try {
        const response = await axios.post(`${url}/signup`, data)
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const login = async (data: any) => {
    try {
        console.log(" Login ",data,`${url}/login`)
        const response = await axios.post(`${url}/login`, data);
        console.log(" Login ",response,data)
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const logout = async () => {
    try {
        const response = await axios.get(`${url}/logout`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


