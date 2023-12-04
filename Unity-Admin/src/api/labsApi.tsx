import axios from "axios";

const url = import.meta.env.VITE_API_URL;
const api = `${url}lab/`;

const token = localStorage.getItem("token") || "";

export const getLabs = async () => {
  console.log(" Get All Labs ",`${url}lab/`);
    const response = await axios.get(`${url}lab/`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    console.log(" Get  All Assistants  ",response.data)
    return response.data;
};

export const updateAssistant = async (body:any) => {
  const {id,status} = body
  const response = await axios.put(`${url}lab/${id}`,{status},{
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(" Update Assistant Respone ",response);
  return response.data;
};



export const deleteLab = async (id: any) => {
  console.log(" Delete Lab Assistant ", id);
  const response = await axios.delete(`${url}lab/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });
  console.log(" Response Delete  ", response);
  return response.data;
};

