import { createContext, useContext } from "react";
import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  getSales,
  createSale,
  updateSale,
  deleteSale,
  getAllReport,
  getReportByWeek,
} from "../../api/marketApi";
import { useNotification } from "../useNotification";

export const MarketContext = createContext({} as any);

export const MarketProvider = ({ children }: any) => {
  const queryClient = useQueryClient();
  const { showNotification } = useNotification();

  const { data: sales, isLoading, error } = useQuery("saless", getSales);

  const { data: report } = useQuery("report", getAllReport);

  const { data: reportByWeek } = useQuery("reportByWeek", getReportByWeek);

  const { mutate: createSaleMutation } = useMutation(createSale, {
    onSuccess: () => {
      queryClient.invalidateQueries("sales");
      showNotification("Market Zone Added successfully", "success");
    },

    onError: (error: any) => {
      showNotification("Market Zone Already Exist", "error");
    },
  });

  const { mutate: updateSaleMutation } = useMutation(
    (data: any) => updateSale(data.id, data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("sales");
        showNotification("Market Type Updated successfully", "success");
      },

      onError: (error: any) => {
        showNotification(error.message.response.data.message, "error");
      },
    }
  );

  const { mutate: deleteSaleMutation } = useMutation(deleteSale, {
    onSuccess: () => {
      queryClient.invalidateQueries("sales");
      showNotification("Market Type deleted successfully", "success");
    },

    onError: (error: any) => {
      showNotification(error.message.response.data.message, "error");
    },
  });

  const value = {
    sales,
    report,
    isLoading,
    error,
    reportByWeek,
    createSaleMutation,
    updateSaleMutation,
    deleteSaleMutation,
  };

  return (
    <MarketContext.Provider value={value}>{children}</MarketContext.Provider>
  );
};

export const useMarket = () => useContext(MarketContext);
