import React from "react";

import ConfirmationBox from "components/common/deleteConfirmation/DeleteConfirmation";
import { useAuth } from "context/AuthContext";

type LogoutPopupProps = {
  onClose: () => void;
  confirmation: boolean;
};

export const LogoutPopup: React.FC<LogoutPopupProps> = ({
  onClose,
  confirmation,
}: LogoutPopupProps) => {
  const { logout } = useAuth();

  // Cast the event listener function to the correct type
  return (
    <div>
      {/* Your logout popup content goes here */}
      <ConfirmationBox
        heading={"Logout"}
        message={"Are you sure you want to Logout ?"}
        showConfirmation={confirmation}
        closePopup={onClose}
        handleSubmit={logout}
      ></ConfirmationBox>
    </div>
  );
};
