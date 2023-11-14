import axios from "axios";

const api = import.meta.env.VITE_API_URL;
const url = `${api}treatment`;

const token = localStorage.getItem("token");

export const getSales = async () => {
    console.log(" Get All sales ",`${url}/farmer/all`)
    const response = await axios.get(`${url}/farmer/all`, {
        headers: {
            "Content-Type": "application/json",
        },
    });
   console.log(" Response Get Sales ", response?.data);
    return response.data;
};

export const createSale = async (data: any) => {
    const formData = new FormData();
    const { images } = data;
    formData.append("name", data.name);
    formData.append("description", data.description);
    formData.append("problemId", data.problemId);
    images.map((image: any, index: number) => {
        const val = index + 1;
        console.log('Index ', val, image);
        formData.append(`imageUrl${val}`,image)
     })
    console.log(" Create Treatment API ", formData);
    const response = await axios.post(`${url}/`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            authtoken: `${token}`,
        },
    });
    console.log(" Response = ",response);
    return response.data;
}

export const updateSale = async (id: string, data: any) => {
    const response = await axios.put(`${url}/farmer/${id}`, data, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });
    return response.data;
}

export const deleteSale = async (id: string) => {
    console.log(" Delete Farmer ",id)
    const response = await axios.delete(`${url}/farmer/${id}`, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });
    console.log(" Response ",response?.data)
    return response.data;
}


export const getAllReport = async () => {
    const response = await axios.get(`${url}/`, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });
   
    return response.data;
}


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
        console.error(error)

    }
}


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
        console.error(error)
    }
};
