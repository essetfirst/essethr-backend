import React,{useState,useEffect} from 'react'
import { useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import { useForum } from "../../hooks/useForum";
import LoadingComponent from "../../components/LoadingComponent";
import { getCustomerById, getTankById } from "../../api/farmerApi";
import { useQuery } from "react-query";
import PageView from "../../components/PageView";
import { styled } from '@mui/system';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CategoryInfo from "./CategoryInfo";
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import axios from 'axios';
const url = import.meta.env.VITE_API_URL;

const StyledTabs = styled(Tabs)(({ theme }: any) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1e1e1e' : '#fff',
    borderBottom: `1px solid ${theme.palette.divider}`,
    '& .MuiTabs-indicator': {
        backgroundColor: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
    },
}));

const StyledTab = styled(Tab)(({ theme }: any) => ({
    textTransform: 'uppercase',
    fontSize: theme.typography.pxToRem(15),
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing(5),
    color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
    '&.Mui-selected': {
        color: theme.palette.mode === 'dark' ? '#fff' : theme.palette.primary.main,
        fontWeight: theme.typography.fontWeightMedium,
    },
    '&:hover': {
        color: theme.palette.primary.main,
        opacity: 1,
    },
    '&.Mui-focusVisible': {
        backgroundColor: theme.palette.action.focus,
    },
}));


const CategoryDetail = () => {
  const theme = useTheme();
  const { id }: any = useParams();
  const [tanks, setTanks] = useState(
    {
      fish: [],
      shrimp: [],
      poly: [],
      result:[],
    },
  );
//   const { datas, isLoadings, isErrors } = useQuery(["farmers", id], () =>
//     getTankById(id)
//   );
  const { data, isLoading, isError } = useQuery(["farmer", id], () =>
    getCustomerById(id)
  );
  const [value, setValue] = React.useState(0);
  useEffect(() => {
    axios
      .get(`${url}tank/farmer/${id}`)
      .then((response) => {
        // Assuming the API response is an array of tank objects
        console.log(response?.data);
        setTanks(response.data);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
      });
  }, []); // The empty dependency array ensures this effect runs once on component mount

  console.log(" Get Customer Detail Page ", data);
  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    console.log(" New Value ", newValue, " Data - ", data);
    setValue(newValue);
  };
  console.log(" Tanks ", tanks);

  if (isLoading)
    return (
      <PageView title="Loading . . .">
        <LoadingComponent />
      </PageView>
    );
  if (isError) return <div>Error</div>;

  return (
    <>
      {/* <PageView title={data?.result?.name || 'Un'} backPath="/forum"> */}
      {/* <Container maxWidth="lg"> */}
      {/* <StyledTabs value={value} onChange={handleChange} aria-label="basic tabs example"> */}
      {/* <StyledTab label="User & Lab Details" /> */}
      {/* </StyledTabs> */}
      {value === 0 && <CategoryInfo category={data?.result} tank={tanks?.result} />}
      {/* </Container> */}
      {/* </PageView> */}
    </>
  );
}

export default CategoryDetail