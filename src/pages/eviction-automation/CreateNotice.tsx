import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Document, Page, pdfjs } from "react-pdf";
import { HttpStatusCode } from "axios";
import { toast } from "react-toastify";
import { FaAngleLeft } from "react-icons/fa";
import Button from "components/common/button/Button";
import Spinner from "components/common/spinner/Spinner";
import NoticeService from "services/late-notices.service";
import { useEvictionAutomationContext } from "./EvictionAutomationContext";
import { useAuth } from "context/AuthContext";
type CreateNoticeProps = {
    handleBack: () => void;
    activeTab: string;
};
const CreateNotice = (props: CreateNoticeProps) => {
    const {
        evictionAutomationNoticesConfirmQueue,
        evictionAutomationNoticesConfirmedQueue,
        getEvictionAutomationNoticeQueue,
        setEvictionAutomationNoticesConfirmQueue,
        setEvictionAutomationNoticesConfirmedQueue,
        selectedEvictionNoticeConfirmedId,
        selectedEvictionNoticeId,
    } = useEvictionAutomationContext();

    const navigate = useNavigate();
    const [showSpinner, setShowSpinner] = useState<boolean>(false);
    const [pdfLink, setPdfLink] = useState<string>("");
    const [totalWarrant, setTotalWarrant] = useState<number>(0);
    pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;
    const [numPages, setNumPages] = useState<number | null>(null);
    const {selectedStateValue}=useAuth();

    useEffect(() => {
        ;
        GetNoticePdfLink();
    },[]);
    const GetNoticePdfLink = async () => {

        try {

            setShowSpinner(true);
            const apiResponse = await NoticeService.getNoticeDocument(
                props.activeTab === "Confirm Notices"
                    ? selectedEvictionNoticeId
                    : selectedEvictionNoticeConfirmedId
            );
            if (apiResponse.status === HttpStatusCode.Ok) {
                
                setTotalWarrant(props.activeTab === "Confirm Notices"
                    ? selectedEvictionNoticeId.length
                    : selectedEvictionNoticeConfirmedId.length)
                setPdfLink(apiResponse.data);
            } else {
                toast.error("Something went wrong. Please try again!", {
                    position: toast.POSITION.TOP_RIGHT,
                });
            }

        } finally {
            setShowSpinner(false);
        }
    };

    const handleLoadSuccess = ({ numPages }: { numPages: number }) => {
        setNumPages(numPages);
    };

    const SendForService = async () => {
        try {          
          setShowSpinner(true);          
           const dispoIds=props.activeTab=="Confirm Notices"?selectedEvictionNoticeId:selectedEvictionNoticeConfirmedId;
           const apiResponse =await NoticeService.sendForService(dispoIds);
           if (apiResponse.status === HttpStatusCode.Ok) {   
              
            toast.success(apiResponse.data.message, {
              position: toast.POSITION.TOP_RIGHT,
            });
           // if(selectedStateValue!="NV")
                navigate("/notices?isConfirmed=true");           
          }
          
        } finally {
          setShowSpinner(false);
        }
      };
      const tabletBreakpoint = 1024; // Breakpoint for tablet and iOS devices

      // Determine the scale based on the window's width
      const windowWidth = window.innerWidth;
      var scale = 1;
      
      if (windowWidth <= tabletBreakpoint) {
         scale = 1; // Scale for tablet and iOS devices
      } else {
         scale = 1.5; // Higher scale for desktops
      }

    return (
        <>
            <div>
                {showSpinner && <Spinner></Spinner>}
                <Button
                    isRounded={false}
                    title={"Back"}
                    type={"button"}
                    icon={<FaAngleLeft className="h-3.5 h-3.5 mr-1" />}
                    handleClick={() => {
                        props.handleBack();
                    }}
                    classes="text-xs bg-white inline-flex justify-center items-center rounded-md font-semibold py-1.5 px-3 text-slate-900 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
                ></Button>
                <div className="relative pt-3 pb-1 flex-auto overflow-y-auto flex items-center justify-start flex-wrap sm:flex-nowrap">
                <Button
                        type="button"
                        isRounded={false}
                        title="Create & Send for Service"
                        handleClick={SendForService}
                        classes="text-[11px] md:text-xs bg-[#2472db] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
                      ></Button>
                    <p className="font-semibold w-full sm:w-auto sm:ml-1.5 md:ml-4 mb-1.5 md:mb-0 text-[#2472db] md:pr-6 text-xs md:text-sm" >{ }Total{" "}{(totalWarrant > 1) ? "Warrants" : "Warrant"}{" "} :{" "} <span className="text-slate-900">
                        {totalWarrant}
                    </span></p>
                </div>

                {pdfLink && (
                    <div className="overflow-auto">
                        <Document file={pdfLink} onLoadSuccess={handleLoadSuccess} className="my-3">
                            {Array.from(new Array(numPages || 0), (el, index) => (
                                <Page
                                    key={`page_${index + 1}`}
                                    pageNumber={index + 1}
                                    scale={scale}
                                    renderAnnotationLayer={false}
                                    renderTextLayer={false}
                                    className="my-3"
                                />
                            ))}
                        </Document>
                    </div>
                )}

            </div>
        </>);


}

export default CreateNotice;

