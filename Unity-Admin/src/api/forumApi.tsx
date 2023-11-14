import axios from "axios";

// Base URL for the request
const api = import.meta.env.VITE_API_URL;
const url = `${api}`;

//Heders for the request
const token = localStorage.getItem("token");


// console.log(" URL =  ", `${url}forum/`,token)
export const getForums = async () => {
    try{

        console.log(" Get All Forums : ",url);
        const response = await axios.get(`${url}forum/`, {
            headers: {
                "Content-Type": "application/json",
                "authtoken": `${token}`,
            },
        });
        console.log(" All Forums  Response  - ",response.data);
        return response.data;
    }catch(err){
        throw err;
    }
}
export const getTanks = async () => {
    try{
        console.log(" Get All Tanks : ", url);
        const response = await axios.get(`${url}tank/`, {
          headers: {
            "Content-Type": "application/json",
            authtoken: `${token}`,
          },
        });
        console.log(" Alls  Tanks Response  - ", response.data);
        return response.data;
    }catch(error){
        throw error;
    }
};

export const getForum = async (id: string) => {
        console.log(" Get Forum  by Id-  ",id)
        const response = await axios.get(`${url}forum/get/${id}`, {
            headers: {
                "Content-Type": "application/json",
                "authtoken": token
            },
        });
        console.log(" Get Forum Response ",response);
        return response.data;
}

export const createForum = async (data: any) => {
    try{

        const response = await axios.post(`${url}forum`, data, {
            headers: {
                "Content-Type": "application/json",
                "authtoken": `${token}`,
            },
        });
        console.log(" Create Product -  ",response?.data,data)
        return response.data;
    }catch(err){
        throw err;
    }
}

export const updateForum = async (id: string, data: any) => {
        const response = await axios.put(`${url}forum?forumId=${id}`, data, {
            headers: {
                "Content-Type": "application/json",
                "authtoken": `${token}`,
            },
        });
        console.log(" Data  - ", { id, data }, " Response - ", response);

        return response.data;
}


export const deleteForum = async (id: string) => {
    // try {
        console.log(`${url}?forumId=${id}`, id)
        const response = await axios.delete(`${url}forum?forumId=${id}`, {
            headers: {
                "Content-Type": "application/json",
                 "authtoken": `${token}`,
            },
        });
        console.log("Delete Product Response ", response.data)
        return response.data;
}


