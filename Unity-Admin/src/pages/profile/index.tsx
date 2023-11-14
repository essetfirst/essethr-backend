import React from 'react';
import DevelopmentMode from '../../components/DevelopmentMode';
import PageView from '../../components/PageView';
import { Container } from '@mui/system';


const Profile = () => {
    return (
        <PageView title="Profile">
            <Container maxWidth="lg">
                <DevelopmentMode codename="Profile" />
            </Container>
        </PageView>
    );
};

export default Profile;
