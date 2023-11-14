import React from 'react'
import { useTheme } from "@mui/material";
import { useParams } from "react-router-dom";
import { useForum } from "../../hooks/useForum";
import LoadingComponent from "../../components/LoadingComponent";
import { getForum } from "../../api/forumApi";
import { useQuery } from "react-query";
import PageView from "../../components/PageView";
import { styled } from '@mui/system';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CategoryInfo from "./CategoryInfo";
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




const CategoryDetail = () => {
    const theme = useTheme();
    const { id } : any = useParams();
    const { data, isLoading, isError } = useQuery(['forum', id], () => getForum(id));
    const [value, setValue] = React.useState(0);

    console.log(" Get Forum Detail Page ",data)
    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        console.log(" New Value ", newValue," Data - ",data)
        setValue(newValue);
    };

    console.log(" Value ",value," Data ",data)

    if (isLoading) return (
        <PageView title="Loading . . .">
            <LoadingComponent />
        </PageView>
    )
    if (isError) return <div>Error</div>;

    return (
        <>
            <PageView title={data?.result?.title || 'Un'} backPath="/forum">
                <Container maxWidth="lg">
                    <StyledTabs value={value} onChange={handleChange} aria-label="basic tabs example">
                        <StyledTab label="Thread Details" />
                    </StyledTabs>
                    {value === 0 && <CategoryInfo category={data?.result} />}
                </Container>
            </PageView>
        </>
    )
}

export default CategoryDetail