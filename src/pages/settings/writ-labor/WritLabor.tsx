import React, { useState } from "react";
import WritLaborGrid from "./WritLaborGrid";

import { WritLaborProvider } from "./WritLaborContext";
import { useAuth } from "context/AuthContext";
// import User_SearchBar from "./components/User_SearchBar";

const Users = () => {
  const { userRole } = useAuth();


  // show invite user modal
  const [showInviteUserModal, setShowInviteUserModal] = useState<Boolean>(false);

  const handleClick = () => {
    setShowInviteUserModal(true);
  };

  return (
    <>
      <WritLaborProvider>
        {/* uncomment below code once the search api is ready */}
        <div className="w-[25%]">
          {/* <User_SearchBar activeTab={tabName} /> */}
        </div>
        <div>
            <WritLaborGrid/>
        </div>
        
      </WritLaborProvider>

      {/* <div>
      {showInviteUserModal && (
        <InviteUsers
          showInviteUserModal={showInviteUserModal}
          handleInviteUserModal={(value: boolean) => {
            setShowInviteUserModal(value);
          }}
        ></InviteUsers>
      )}
      <Button
        title={"Add New"}
        classes={
          "bg-[#2472db] hover:bg-[#0d5ecb] px-4 py-2 font-medium text-[13px] text-white rounded-md	 shadow-lg ml-2 inline-flex items-center mb-1"
        }
        type={"button"}
        isRounded={false}
        icon={<FaPlus className="fa-solid fa-plus  mr-1 text-xs" />}
        key={0}
        handleClick={() => handleClick()}
      ></Button>
      <UsersGrid></UsersGrid>
    </div> */}
    </>
  );
};
export default Users;
