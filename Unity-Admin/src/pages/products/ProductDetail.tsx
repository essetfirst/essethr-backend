import React from 'react'
import { useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import { useProduct } from "../../hooks/useProduct";
import LoadingComponent from "../../components/LoadingComponent";
import { getProduct } from "../../api/productApi";
import { useQuery } from "react-query";
import PageView from "../../components/PageView";
import { styled } from '@mui/system';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import ProductInfo from "./ProductInfo";
import ProductCategory from "./ProductCategory";
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';

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




const ProductDetail = () => {
    const theme = useTheme();
    const { id } : any = useParams();
    const { data, isLoading, isError } = useQuery(['product', id], () => getProduct(id));
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        // console.log(" New Value ", newValue," Data - ",data)
        setValue(newValue);
    };

    // console.log(" Value ",value," Data ",data)

    if (isLoading) return (
        <PageView title="Loading . . .">
            <LoadingComponent />
        </PageView>
    )
    if (isError) return <div>Error</div>;

    return (
        <>
            <PageView title={data.user.fullName} backPath="/products">
                <Container maxWidth="lg">
                    <StyledTabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <StyledTab label="User Details" />
                    </StyledTabs>
                    {value === 0 && <ProductInfo product={data} />}
                </Container>
            </PageView>
        </>
    )
}

export default ProductDetail