// src/components/LoginSuccess.tsx
import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

const LoginSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      localStorage.setItem("accessToken", token);
      navigate("/", { replace: true });
      window.location.reload(); // 상태 반영을 위해 새로고침
    } else {
      alert("로그인에 실패했습니다.");
      navigate("/", { replace: true });
    }
  }, [searchParams, navigate]);

  return <div>로그인 처리 중...</div>;
};

export default LoginSuccess;
