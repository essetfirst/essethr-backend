import axios from "axios";
const url = import.meta.env.VITE_API_URL;

const token = localStorage.getItem("token") || "";


//impliment crud operations
export const getCategories = async () => {
    console.log(" Get All Category - ",url,token)
    const response = await axios.get(`${url}news/`, {
        headers: {
            "Content-Type": "application/json",
            "authtoken": `${token}`,
        },
    });
    console.log(" Category  = " , response.data)

    return response.data;
};

export const createCategory = async (data: any) => {
    var formData = new FormData()
    formData.append("title", data.title)
    formData.append("description", data.description)
    formData.append("image", data.thumbnail)

    console.log(" News data = ", data)
    let newData = data.images
    const response = await axios.post(`${url}news/`, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
            "authtoken": `${token}`
        },
    });
    console.log(" News  Response = ", response)
    return response.data;
};

//get category by id
export const getCategoryById = async (id: any) => {
    const response = await axios.get(`${url}news/${id}`, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });

    return response.data;
};

//update category
export const updateCategory = async (id: any, data: any) => {
    console.log(data,id);
    var formData = new FormData();
        if(data?.thumbnail){
            formData.append("image", data.thumbnail);
        } 
        if(data?.title){
          formData.append("title", data.title);
        }
        if (data?.description) {
            formData.append("description", data.description);
        }
    var contentType = data?.thumbnail ? "multipart/form-data": "application/json" ;
    const response = await axios.put(`${url}news/id`, formData, {
        headers: {
            "Content-Type": `${contentType}`,
            authtoken: `${token}`,
        },
    });
    console.log(" Updated Response ",response);
    return response.data;
};


export const deleteCategory = async (id: any) => {
    const response = await axios.delete(`${url}news/${id}`, {
        headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
        },
    });

    return response.data;
}








