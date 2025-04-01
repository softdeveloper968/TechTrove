// redirect-utils.ts
import { useNavigate } from "react-router-dom";

const useRedirectToLogin = () => {
  const navigate = useNavigate();

  const redirectToLogin = () => {
    navigate("/");
  };

  return {
    redirectToLogin,
  };
};

export default useRedirectToLogin;
