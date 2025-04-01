import React from "react";
import { useNavigate } from "react-router-dom";
import Button from "components/common/button/Button";

const PageNotFound = () => {
    const navigate = useNavigate();

    const handleBackToHome = () => {
        navigate("/home");
    };

    return (
        <>
        <div className="min-h-screen flex flex-grow items-center justify-center bg-gray-50 p-2.5">
            <div className="rounded-md bg-white p-5 sm:p-7 text-center shadow-xl">
                <h1 className="mb-3.5 text-3xl md:text-4xl font-bold text-[#12325c]">404</h1>
                <h1 className="mb-1 font-bold tracking-tight text-gray-900 text-xl">Page not found</h1>
                <p className="text-gray-600 mb-4">Sorry, we couldn’t find the page you’re looking for.</p>
                <Button
                    isRounded={false}
                    title={"Go back home"}
                    type={"button"}
                    handleClick={handleBackToHome}
                ></Button>
            </div>
        </div>
        </>
    );
};

export default PageNotFound;