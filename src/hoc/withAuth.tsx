import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import type { RootState } from "../redux/services/scholar/store";

const withAuth = (WrappedComponent: React.ComponentType<any>) => {
  const WithAuthComponent = (props: any) => {
    const navigate = useNavigate();
    const user = useSelector((state: RootState) => state.auth);
    const token = user.token;
    const role = user.role;
    useEffect(() => {
      if (!token) {
        navigate("/");
      }
    }, [navigate, user]);
    return <WrappedComponent {...props} />;
  };
  return WithAuthComponent;
};

export default withAuth;
