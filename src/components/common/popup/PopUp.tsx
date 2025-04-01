import React from "react";
import { ReactNode } from "react";
import { FaTimes } from "react-icons/fa";
import Button from "../button/Button";

type Props = {
  showModal: Boolean;
  onClose: () => void;
  children?: ReactNode;
  width: string;
  showCloseIcon?:Boolean;
  classes?:string;
};
const Modal = (props: Props) => {
  return (
    <>
      {props.showModal ? (
        <>
          <div
            className={props.classes?props.classes:"relative z-20 modal-box"}
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="fixed inset-0 z-10 w-screen overflow-y-auto overflow-x-hidden">
              <div className="flex min-h-full items-end justify-center p-2.5 md:p-3.5 text-center items-center">
                <div
                  className={`relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all w-full ${props.width}`}
                >
                  <Button
                    classes="absolute top-0 right-0 m-2 md:m-3 text-gray-500 cursor-pointer"
                    handleClick={() => {
                      props.onClose();
                    }}
                    isRounded={false}
                    title={""}
                    type={"button"}
                  >
                    {
                    props.showCloseIcon != true &&
                    <>
                    <FaTimes className="h-3.5 h-3.5" />
                    </>
                    }
                    {/* <FaTimes className="h-3.5 h-3.5" /> */}
                  </Button>
                  {props.children}
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </>
  );
};

export default Modal;
