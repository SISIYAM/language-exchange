 
import Blog from '@/components/admin/Blog';
import DashboardContainer from '@/container/DashboardContainer';
import React from 'react';

const page = () => {
    return (
        <DashboardContainer>
            <Blog/>
        </DashboardContainer>
    );
};

export default page;