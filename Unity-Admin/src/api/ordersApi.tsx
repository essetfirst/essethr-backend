import axios from "axios";

const api = import.meta.env.VITE_API_URL;
const url = `${api}video`;

const token = localStorage.getItem("token");

export const getOrders = async () => {
    try {
        console.log(" Videos Get - Method ", `${url}/`);
        const response = await axios.get(`${url}/`, {
            headers: {
                "Content-Type": "application/json",
                authtoken: `${token}`,
            },
        });
        console.log(" Videos Get - Result ", response.data);
        return response.data;
    } catch (error) { 
        console.log(error);
    }
};


export const createOrder = async (data: any) => {
    var formData = new FormData();
    formData.append("title", data.title)
    formData.append("description", data.description)
    formData.append("image", data.thumbnail)
    formData.append("url", data.url);
    const response = await axios.post(`${url}/`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "authtoken": `${token}`,
        },
    });
    return response?.data;
}

export const updateOrder = async (id: string, data: any) => {
    console.log(" Update Order - ", id, data);
    const response = await axios.put(`${url}?videoId=${id}`, data, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });

    console.log(" Update Order Response ", response.data)
    return response?.data;
}

export const deleteOrder = async (id: string) => {
    try {
        try {
            console.log(`Delete Booking ${url}?videoId=${id}`, id)
            const response = await axios.delete(`${url}?videoId=${id}`, {
                headers: {
                    "Content-Type": "application/json",
                    authtoken: `${token}`,
                },
            });
            console.log("Delete Order Response ", response.data)
            return response.data;
        }catch(error){
            console.log(error);
        }
    
    } catch (error) { 
        console.log(error);
    }

}

export const approveOrder = async (id: string) => {
    try {
        const data = {status:2}
        console.log(" Approve Order - ",id , data);
        const response = await axios.put(`${url}/${id}`,data,{
            headers: {
                "Content-Type": "application/json",
                authtoken: `${token}`,
            },
        });
    
        console.log(" Approve Respone  ",response)
        return response.data;

    }catch(error){
        console.log(error);
    }
}


export const orderReport = async () => {
    const response = await axios.get(`${url}/report`, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });

    return response.data;
}

export const getOrder = async (id: string) => {
    try {
        console.log(`Get Video ${url}/get/${id} `,id)
        const response = await axios.get(`${url}/${id}`, {
            headers: {
                "Content-Type": "application/json",
                authtoken: `${token}`,
            },
        });
       
        console.log(" Get  1 Video Response ", response.data)
        return response.data;
    }
    catch (error) {
        console.error(error);
    }
}
