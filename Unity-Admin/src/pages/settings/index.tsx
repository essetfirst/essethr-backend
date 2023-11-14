import React from "react";
import DevelopmentMode from "../../components/DevelopmentMode";
import PageView from "../../components/PageView";
import { Container } from "@mui/system";


const Settings = () => {
    return (
        <PageView title="Settings">
            <Container maxWidth="lg">
                <DevelopmentMode codename="Settings" />
            </Container>
        </PageView>
    );
};

export default Settings;
