import React, { forwardRef } from "react";
import {Helmet} from "react-helmet";


type Props = {
    title: string;
    children: React.ReactNode;
};

interface PageProps extends Props {
    ref: React.Ref<HTMLDivElement>;
}


const Page = forwardRef<HTMLDivElement, PageProps>(({ title, children }, ref) => {
    return (
        <div ref={ref}>
            <Helmet>
                <title>{title}</title>
            </Helmet>
            {children}
        </div>
    );
}
);

export default Page;





