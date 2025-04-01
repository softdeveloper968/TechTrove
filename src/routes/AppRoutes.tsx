import React, { ReactElement, useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useAuth } from "context/AuthContext";
import ProtectedRoute from "./protectedRoute/ProtectedRoute";
import ForgotPassword from "pages/forgot-password/ForgotPassword";
import Login from "pages/login/Login";
import SignUp from "pages/sign-up/SignUp";
import Home from "pages/home/Home";
import ResetPassword from "pages/reset-password/ResetPassword";
import CheckCaseStatus from "pages/check-case-status/CheckCaseStatus";
import LateNotices from "pages/late-notices/LateNotices";
import FileEvictions from "pages/file-evictions/FileEvictions";
import ServiceTracker from "pages/service-tracker/ServiceTracker";
import WritsOfPossession from "pages/writs-of-possession/WritsOfPossession";
import Dismissals from "pages/dismissals/Dismissals";
import Amendments from "pages/amendments/Amendments";
import AllCases from "pages/all-cases/AllCases";
import Settings from "pages/settings/Settings";
import Users from "pages/invite-user/Users";
import SignedDismissalsGrid from "pages/dismissals/components/SignedGrid";
import Profile from "pages/invite-user/Profile";
import Accounting from "pages/accounting/Accounting";
import LogsPage from "pages/logger/LogsPage";
import ProcessServer from "pages/process-server/ProcessServer";
import PageNotFound from "pages/page-not-found/PageNotFound";
import EvictionQueue from "pages/eviction-queue/EvictionQueue";
import EmailQueue from "pages/email-queue/EmailQueue";
import EvictionAutomation from "pages/eviction-automation/EvictionAutomation";
import LoginWithPin from "pages/login-with-pin/LoginWithPin";
import EvictionAnswer from "pages/eviction-answer/EvictionAnswer";
import Payment from "pages/single-payment/Payment";
import FilingTransaction from "pages/filing-transaction/FilingTransaction";
import { HttpStatusCode, UserRole } from "utils/enum";
import { getUserInfoFromToken } from "utils/helper";
import Spinner from "components/common/spinner/Spinner";
import AuthService from "services/auth.service";
import FileEvictionsNV from "pages/nv-file-evictions/FileEvictionNV";
import DismissalNV from "pages/nv-dismissals/DismissalNV";
import SystemInfo from "pages/system-info/SystemInfo";
import FileEvictionTX from "pages/tx-file-evictions/FileEvictionsTX";


const ProtectedRouteWrapper: React.FC<{ path: string; element: ReactElement; }> = ({ path, element }) => {

   return <ProtectedRoute redirectPath="/login">{element}</ProtectedRoute>;
};

const hasAccess = (userRoles: string[], allowedRoles: string[]) => {
   return allowedRoles.some(role => userRoles.includes(role));
};

const AppRoutes = () => {
   const location = useLocation();
   const [loading, setLoading] = useState(true);
   const {
      userRole,
      isAuthenticated,
      setIsAuthenticated,
      setUnsignedAmendmentCount,
      setUnsignedDismissalCount,
      setUnsignedWritCount,
      setUnsignedEvictionApprovalCount,
      setUnsignedEvictionDismissalCount,
      permittedStates,
      selectedStateValue
   } = useAuth();

   const handleUnsignedCaseCount = async () => {
      try {
         const response = await AuthService.getUnsignedCaseCount();
         if (response.status === HttpStatusCode.OK) {
            setUnsignedAmendmentCount(response.data.unsignedAmendment);
            setUnsignedDismissalCount(response.data.unsignedDismissal);
            setUnsignedWritCount(response.data.unsignedWrit);
            setUnsignedEvictionApprovalCount(response.data.unsignedEvictionApprovalCount);
            setUnsignedEvictionDismissalCount(response.data.unsignedEvictionDismissalCount);
         }
      } catch (error) {
         console.log(error);
      }
   };

   useEffect(() => {

      if (isAuthenticated) {
         handleUnsignedCaseCount();
      };

   }, [isAuthenticated]);

   useEffect(() => {
      const fetchData = async () => {
         const loggedInUserDetail = getUserInfoFromToken();
         // if (loggedInUserDetail === null && location.pathname === '/eviction-automation' && location.search === '?isApproved=true') {
         //    localStorage.setItem("intendedURL", location.pathname + location.search);
         // }
         const userRoles: string[] = JSON.parse(
            loggedInUserDetail?.UserRoles?.toString() || "[]"
         );
         setIsAuthenticated(
            loggedInUserDetail && userRoles.length ? true : false
         );
         setTimeout(() => {
            setLoading(false);
         }, 50);
      };

      fetchData();

   }, [location, isAuthenticated]);

   if (loading) {
      return <Spinner />; // Render loading indicator while data is being fetched
   };

   return (
      <div>
         <Routes>
            {/* Public routes */}
            <Route path="/" element={<Navigate to="/login" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword isNewAccount={false} />} />
            <Route path="/create-password" element={<ResetPassword isNewAccount={true} />} />
            <Route path="/login-with-pin" element={<LoginWithPin />} />
            <Route path="/eviction-answer" element={<EvictionAnswer />} />

            <Route
               path="/home"
               element={<ProtectedRouteWrapper path="/home" element={<Home />} />}
            />

            <Route
               path="/profile"
               element={
                  <ProtectedRouteWrapper path="/login" element={<Profile />} />
               }
            />

            {/* Route for ProcessServer and C2CAdmin */}
            {hasAccess(userRole, [UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.ProcessServer]) && (["GA"].includes(selectedStateValue)) && (
               <Route
                  path="/process-server"
                  element={
                     <ProtectedRouteWrapper path="/process-server" element={<ProcessServer />} />
                  }
               />
            )}

            {hasAccess(userRole, [UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.ProcessServer]) && (["GA"].includes(selectedStateValue)) && (
               <Route
                  path="/process-server-sign"
                  element={
                     <ProtectedRouteWrapper path="/process-server-sign" element={<ProcessServer />} />
                  }
               />
            )}

            {hasAccess(userRole,[UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin, UserRole.Signer, UserRole.NonSigner, UserRole.Viewer]) && (
               <Route
               path="/user-management"
               element={
                  <ProtectedRouteWrapper path="/login" element={<Users />} />
               }
            ></Route>
            )}
            {hasAccess(userRole,[UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin, UserRole.Signer, UserRole.NonSigner, UserRole.Viewer]) && (
               <Route
               path="/system-info"
               element={
                  <ProtectedRouteWrapper path="/system-info" element={<SystemInfo />} />
               }
            ></Route>
            )}

            {/* Route for WritLabor, C2CAdmin, and Admin */}
            {hasAccess(userRole, [UserRole.WritLabor, UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin, UserRole.Signer, UserRole.NonSigner, UserRole.Viewer]) && (["GA"].includes(selectedStateValue)) && (
               <Route
                  path="/writs-of-possession"
                  element={
                     <ProtectedRouteWrapper path="/writs-of-possession" element={<WritsOfPossession />} />
                  }
               />
            )}

            {/* Routes for Admin and C2CAdmin */}
            {hasAccess(userRole, [UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin]) && (
               <>
                  <Route
                     path="/settings/*"
                     element={
                        <ProtectedRouteWrapper path="/login" element={<Settings />} />
                     }
                  >
                     <Route
                        path="county"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Settings />} />
                        }
                     ></Route>
                     <Route
                        path="court"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Settings />} />
                        }
                     ></Route>
                     <Route
                        path="writ-labor"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Settings />} />
                        }
                     ></Route>
                     <Route
                        path="tyler-logins"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Settings />} />
                        }
                     ></Route>
                     <Route
                        path="tyler-config"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Settings />} />
                        }
                     ></Route>
                     <Route
                        path="process-server"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Settings />} />
                        }
                     ></Route>
                     <Route
                        path="notary-config"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Settings />} />
                        }
                     ></Route>
                     <Route
                        path="cobb-users"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Settings />} />
                        }
                     ></Route>
                     <Route
                        path="process-server-documents"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Settings />} />
                        }
                     ></Route>
                     <Route
                        path="filing-type"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Settings />} />
                        }
                     ></Route>
                  </Route>
                  {/* <Route
                     path="/user-management"
                     element={
                        <ProtectedRouteWrapper path="/login" element={<Users />} />
                     }
                  ></Route> */}
                  {/* <Route
                     path="/eviction-automation"
                     element={
                        <ProtectedRouteWrapper path="/eviction-automation" element={<EvictionAutomation />} />
                     }
                  /> */}
                  <Route
                     path="/accounting/*"
                     element={
                        <ProtectedRouteWrapper path="/login" element={<Accounting />} />
                     }
                  >
                     <Route
                        path="c2c-fees"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Accounting />} />
                        }
                     ></Route>
                  </Route>
               </>
            )}

            {/* Routes for C2CAdmin */}
            {hasAccess(userRole, [UserRole.C2CAdmin,UserRole.ChiefAdmin]) && (["GA","TX"].includes(selectedStateValue)) && (
               <>
                  <Route
                     path="/logs"
                     element={
                        <ProtectedRouteWrapper path="/logs" element={<LogsPage />} />
                     }
                  />

                  <Route
                     path="/queue-management/*"
                     element={
                        <ProtectedRouteWrapper path="/login" element={<EvictionQueue />} />
                     }
                  >
                     <Route
                        path="tasks"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<EvictionQueue />} />
                        }
                     ></Route>
                  </Route>

                  {/* <Route
                     path="/aos-queue"
                     element={
                        <ProtectedRouteWrapper path="/login" element={<AosQueue />} />
                     }
                  />

                  <Route
                     path="/aos-queue/:queueId"
                     element={
                        <ProtectedRouteWrapper path="/login" element={<AosQueue />} />
                     }
                  /> */}

                  <Route
                     path="/process-queue"
                     element={
                        <ProtectedRouteWrapper path="/send-email-queue" element={<EmailQueue />} />
                     }
                  />


                  <Route
                     path="/single-payment"
                     element={
                        <ProtectedRouteWrapper path="/single-payment" element={<Payment />} />
                     }
                  />
                  

                  {/* <Route
                     path="/eviction-automation"
                     element={
                        <ProtectedRouteWrapper path="/eviction-automation" element={<EvictionAutomation />} />
                     }
                  /> */}

               </>
            )}
            {hasAccess(userRole, [UserRole.C2CAdmin,UserRole.ChiefAdmin]) && (["GA","TX"].includes(selectedStateValue)) && (
               <>
               <Route
                     path="/filing-transactions"
                     element={
                        <ProtectedRouteWrapper path="/filing-transactions" element={<FilingTransaction />} />
                     }
                  />
               </>
                )}
            {hasAccess(userRole, [UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin, UserRole.Signer, UserRole.ProcessServer, UserRole.PropertyManager,UserRole.NonSigner]) && ( ["NV"].includes(selectedStateValue)) && (
              <>
               <Route
                  path="/notices"
                  element={
                     <ProtectedRouteWrapper path="/notices" element={<LateNotices />} />
                  }
               />
               <Route
                     path="/nv-file-eviction"
                     element={
                        <ProtectedRouteWrapper path="/nv-file-eviction" element={<FileEvictionsNV />} />
                     }
                  />
                  <Route
                     path="/nv-dismissals"
                     element={
                        <ProtectedRouteWrapper path="/nv-dismissals" element={<DismissalNV />} />
                     }
                  />
              </>
            )}
            {/* Routes for C2CAdmin, Admin, Signer, NonSigner, Viewer */}
            {hasAccess(userRole, [UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin, UserRole.Signer, UserRole.NonSigner, UserRole.Viewer,UserRole.PropertyManager]) && (["GA"].includes(selectedStateValue)) && (
               <>
                  
                  <Route
                     path="/file-eviction"
                     element={
                        <ProtectedRouteWrapper path="/file-eviction" element={<FileEvictions />} />
                     }
                  />
                  {/* <Route
                     path="/all-cases"
                     element={
                        <ProtectedRouteWrapper path="/all-cases" element={<AllCases />} />
                     }
                  /> */}
                  <Route
                     path="/service-tracker"
                     element={
                        <ProtectedRouteWrapper path="/login" element={<ServiceTracker />} />
                     }
                  />
                  <Route
                     path="/dismissals/*"
                     element={
                        <ProtectedRouteWrapper path="/login" element={<Dismissals />} />
                     }
                  >
                     <Route
                        path="ReviewSign"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<Dismissals />} />
                        }
                     ></Route>
                     <Route
                        path="signed"
                        element={
                           <ProtectedRouteWrapper path="/login" element={<SignedDismissalsGrid />} />
                        }
                     ></Route>
                  </Route>
                  <Route
                     path="/amendments"
                     element={
                        <ProtectedRouteWrapper path="/amendments" element={<Amendments />} />
                     }
                  />

                  {/* <Route
              path="/eviction-queue"
              element={
                <ProtectedRouteWrapper path="/logs" element={<EvictionQueue />} />
              }
            /> */}

               </>
            )}
             {hasAccess(userRole, [UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin, UserRole.Signer, UserRole.NonSigner, UserRole.Viewer,UserRole.PropertyManager]) && (["GA","TX"].includes(selectedStateValue)) && (
               <>
               <Route
                     path="/all-cases"
                     element={
                        <ProtectedRouteWrapper path="/all-cases" element={<AllCases />} />
                     }
                  />
                  <Route
                     path="/check-case-status/:query?"
                     element={
                        <ProtectedRouteWrapper path="/check-case-status/:query?" element={<CheckCaseStatus />} />
                     }
                  />
               </>
             )}

            {/* {hasAccess(userRole, [UserRole.C2CAdmin, UserRole.Admin, UserRole.PropertyManager, UserRole.Signer]) &&(["GA","NV"].includes(selectedStateValue)||hasAccess(userRole, [UserRole.C2CAdmin]))&& (
               <Route
                  path="/eviction-automation"
                  element={
                     <ProtectedRouteWrapper path="/eviction-automation" element={<EvictionAutomation />} />
                  }
               />
            )} */}
            {hasAccess(userRole, [UserRole.C2CAdmin,UserRole.ChiefAdmin]) &&
               (["GA", "NV","TX"].includes(selectedStateValue)) && (
                  <Route
                     path="/eviction-automation"
                     element={
                        <ProtectedRouteWrapper path="/eviction-automation" element={<EvictionAutomation />} />
                     }
                  />
               )}
               {hasAccess(userRole, [UserRole.C2CAdmin,UserRole.ChiefAdmin, UserRole.Admin, UserRole.Signer,UserRole.NonSigner,UserRole.Viewer,UserRole.PropertyManager]) && ( ["TX"].includes(selectedStateValue)) && (
              <>
               <Route
                     path="/tx-file-eviction"
                     element={
                        <ProtectedRouteWrapper path="/tx-file-eviction" element={<FileEvictionTX />} />
                     }
                  />
              </>
            )}


            <Route
               path="*"
               element={
                  !isAuthenticated
                     ? <Navigate to="/login" />
                     : <PageNotFound />
               }
            />
         </Routes>
      </div>
   );
};

export default AppRoutes;
