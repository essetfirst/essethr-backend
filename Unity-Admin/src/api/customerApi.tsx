import axios from "axios";

const url = import.meta.env.VITE_API_URL;
const api = `${url}user/`;


const token = localStorage.getItem("token") || "";

//get all categories
export const getCustomers = async () => {
    // console.log(" Get  Data Customer ",`${api}get`)
    const response = await axios.get(`${api}all`, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });
    return response.data;
}

//create category
export const createCustomer = async (data: any) => {
    delete data.id
    console.log(data," Create Customer ")
    const response = await axios.post(`${api}signup`, data, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });
    console.log(" Response ",response);
    return response.data;
}


//get category by id
export const getCustomerById = async (id: any) => {
    const response = await axios.get(`${api}get/${id}`, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });

    return response.data;
}

//update category
export const updateCustomer = async (id: any) => {
    console.log(" Approve User ",id)
    const response = await axios.put(`${api}approve/${id}`, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });
    console.log(" Approve Respone ",response)
    return response.data;
}


export const deleteCustomer = async (id: any) => {
    console.log(" Delete Customer ",id)
    const response = await axios.delete(`${api}delete/${id}`, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });
    console.log(" Response Delete  ",response);
    return response.data;
}


export const register = async (data: any) => {
    try {
        const response = await axios.post(`${api}create`, data, {
            headers: {
                "Content-Type": "application/json"
            }
        })
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const login = async (data: any) => {
    try {
        console.log(" Login  Data Customer ",`${api}login`,data)
        const response = await axios.post(`${api}login`, data, {
            headers: {
                "Content-Type": "application/json",
                authtoken: `${token}`,
            }
        });
        console.log(" Login Response ",response)
        return response.data;
    } catch (error) {
        throw error;
    }
}

export const logout = async () => {
    try {
        const response = await axios.get(`${api}/logout`);
        return response.data;
    } catch (error) {
        console.log(error);
        throw error;
    }
}