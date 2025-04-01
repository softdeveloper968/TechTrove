import React, { ReactNode } from "react";
import Button from "../button/Button";
import Modal from "../popup/PopUp";

// Props for the DeleteConfirmationBox component
type ConfirmationBoxProps = {
  heading: string; // Heading for the confirmation box
  message: React.ReactNode; // Message to be displayed in the confirmation box
  showConfirmation: boolean; // Controls whether the confirmation box is visible
  closePopup: () => void; // Function to close the confirmation box
  handleSubmit: () => void; // Function to handle the submit action
  children?: ReactNode; // Optional children nodes
  confirmButtonTitle?: string;
  cancelButtonTitle?: string;
  isAdditionalBtn?: boolean;
  AdditionalBtnTitle?: string;
  handleProceed?: () => void;
  disclaimer?: string;
};

const ConfirmationBox = (props: ConfirmationBoxProps) => {
  const defaultTitle = props.confirmButtonTitle
    ? props.confirmButtonTitle
    : "Confirm";
  const defaultCancelTitle = props.cancelButtonTitle
    ? props.cancelButtonTitle
    : "Cancel";

  return (
    <Modal
      showModal={props.showConfirmation}
      onClose={props.closePopup}
      width="max-w-md"
    >
      <div className="bg-white px-3.5 pb-3.5 pt-4 sm:p-5 rounded-md">
        <div className="sm:flex sm:items-start">
          <div className="text-center sm:text-left">
            <h3
              className="text-sm font-semibold leading-5 text-gray-900"
              id="modal-title"
            >
              {props.heading}
            </h3>
            <div className="my-2">
              {/* Render JSX message directly */}
              <p className="text-xs text-gray-500">{props.message}</p>
            </div>
          </div>
        </div>
        <div className="py-2 flex justify-end gap-1">
          <Button
            type="button"
            isRounded={false}
            title={defaultCancelTitle}
            handleClick={props.closePopup}
            classes="text-[11px] md:text-xs  bg-white text-gray-900 inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 ring-1 ring-slate-900/10 hover:bg-[#f5f8fb] hover:ring-slate-900/15 shadow-lg"
          ></Button>
          <Button
            type="button"
            isRounded={false}
            handleClick={props.handleSubmit}
            title={defaultTitle}
            classes="text-[11px] md:text-xs bg-[#2472db] hover:bg-[#0d5ecb] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
          ></Button>
          {props.isAdditionalBtn && (
            <Button
              type="button"
              isRounded={false}
              handleClick={props.handleProceed}
              title={props.AdditionalBtnTitle ?? "Proceed"}
              classes="text-[11px] md:text-xs bg-[#4DB452] hover:bg-[#0ca413] inline-flex justify-center items-center rounded-md font-semibold py-2 md:py-2.5 px-4 md:px-5 text-white"
            ></Button>
          )}
        </div>
        {props.disclaimer && (
            <div className="my-2">
              {/* Render JSX message directly */}
              <p className="text-xs text-gray-500">{props.disclaimer}</p>
            </div>
          )}
      </div>
    </Modal>
  );
};

export default ConfirmationBox;
