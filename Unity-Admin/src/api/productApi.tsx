import axios from "axios";

// Base URL for the request
const api = import.meta.env.VITE_API_URL;
const url = `${api}book`;

//Heders for the request
const token = localStorage.getItem("token");


export const getProducts = async () => {
    try {
        const response = await axios.get(`${url}/`, {
            headers: {
                "Content-Type": "application/json",
                authtoken: `${token}`,
            },
        });
        console.log(" Get All Books - ",response.data);
        return response.data;
    } catch (error) {
        console.log(error);
    }
}

export const getProduct = async (id: string) => {
    try {
        console.log(" Get Product -  ",id)
        const response = await axios.get(`${url}/${id}`, {
            headers: {
                "Content-Type": "application/json",
                authtoken: `${token}`,
            },
        });

        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}

export const createProduct = async (data: any) => {
    try {
        var formData = new FormData()
        formData.append("title", data.title)
        formData.append("topicId", data.topicId)
        formData.append("image", data.thumbnailUrl)
        formData.append("pdf", data.file);

        console.log(" Create Book ",data)
        const response = await axios.post(`${url}/`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                 authtoken: `${token}`,
            },
        });
        console.log(" Create Product -  ",response)
        return response.data;
    }
    catch (error) {
        console.log(error);
    }
}


export const createProductCategory = async (data: any) => {
        console.log(" Create Category ",data)
        const response = await axios.post(`${api}topic`, data, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log(" Create Category Result -  ",response?.data,data)
        return response.data;
   
}
export const updateProduct = async (id: string, data: any) => {
    try {
                var formData = new FormData();
                if(data.title){
                    formData.append("title", data.title);
                }
                if(data.topicId){
                    formData.append("topicId", data.topicId);
                }
                if (data.thumbnailUrl) {
                  formData.append("image", data.thumbnailUrl);
                }
                if(data.file){
                  formData.append("pdf", data.file);
                }
         var contentType = data?.file || data?.thumbnailUrl ? "multipart/form-data" : "application/json"
        const response = await axios.put(`${url}/${id}`, formData, {
            headers: {
                "Content-Type":`${contentType}` ,
                authtoken: `${token}`,
            },
        });
        console.log(" Data  - ", { id, data }, " Response - ", response);

        return response.data;
    } catch (error) {
        console.log(error)
        console.error(error);
    }
}


export const deleteProduct = async (id: string) => {
    try {
        console.log(`${url}/delete/${id}`, id)
        const response = await axios.delete(`${url}/${id}`, {
            headers: {
                "Content-Type": "application/json",
                authtoken: `${token}`,
            },
        });
        console.log("Delete Product Response ", response.data)
        return response.data;
    } catch (error) {
        console.log(error);
    }
}


export const getStock = async () => {
    const response = await axios.get(`${url}/stock`, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });

    return response.data;
}

