import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";
import googleIcon from "./assets/icons/google.svg";
import naverIcon from "./assets/icons/naver.png";
import kakaoIcon from "./assets/icons/kakao.svg";

// 필요한 컴포넌트들을 import 합니다.
import MainPage from "./pages/MainPage";
import MyRecords from "./components/MyRecords";
import LoginSuccess from "./components/LoginSuccess";

// 사용자 정보 타입을 위한 인터페이스
interface UserProfile {
  name: string;
  email: string;
  picture: string;
}

// --- 로그인 페이지 컴포넌트 ---
const LoginPage = () => {
  const googleLoginUrl = "http://localhost:8080/oauth2/authorization/google";
  const naverLoginUrl = "http://localhost:8080/oauth2/authorization/naver";
  const kakaoLoginUrl = "http://localhost:8080/oauth2/authorization/kakao";

  return (
    <div className="login-container">
      <h1>AI 회의록 요약</h1>
      <p>서비스를 이용하려면 로그인이 필요합니다.</p>
      <div className="social-login-buttons">
        {/* Google 버튼 수정 */}
        <a href={googleLoginUrl} className="login-button google">
          <img src={googleIcon} alt="Google logo" />
          Google 계정으로 로그인
        </a>
        {/* Naver 버튼 수정 */}
        <a href={naverLoginUrl} className="login-button naver">
          <img src={naverIcon} alt="Naver logo" />
          네이버 아이디로 로그인
        </a>
        {/* Kakao 버튼 수정 */}
        <a href={kakaoLoginUrl} className="login-button kakao">
          <img src={kakaoIcon} alt="Kakao logo" />
          카카오로 시작하기
        </a>
      </div>
    </div>
  );
};

// --- 로그인 후 보여줄 메인 앱 레이아웃 ---
const AppLayout = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "dark"; // 기본값 다크 모드
  });

  useEffect(() => {
    document.body.className = "";
    document.body.classList.add(theme + "-mode");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem("accessToken");
      if (token) {
        try {
          const response = await axios.get<UserProfile>(
            "http://localhost:8080/api/me",
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUser(response.data);
        } catch (error) {
          console.error("사용자 정보 로딩 실패:", error);
          handleLogout(); // 토큰이 유효하지 않으면 로그아웃 처리
        }
      }
    };
    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate(0); // 페이지를 새로고침하여 로그아웃 상태를 반영
  };

  return (
    <div className="container">
      <header className="app-header">
        <div className="logo" onClick={() => navigate("/")}>
          AI 회의록 요약
        </div>
        <nav className="header-nav">
          <Link to="/my-records" className="nav-item">
            <button
              className="icon-button"
              title="테마 전환"
              onClick={toggleTheme}
            >
              {theme === "dark" ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
              )}
            </button>
            <button className="icon-button" title="내 기록 보기">
              내 기록
            </button>
          </Link>
          <div className="nav-item">
            <span>{user?.name || "..."}님</span>
            <button onClick={handleLogout} className="logout-button">
              로그아웃
            </button>
          </div>
        </nav>
      </header>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/my-records" element={<MyRecords />} />
      </Routes>
    </div>
  );
};

// --- 전체 앱 로직 ---
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      setIsLoggedIn(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>로딩 중...</div>; // 로딩 중 화면
  }

  return (
    <Routes>
      <Route path="/login/success" element={<LoginSuccess />} />
      <Route path="/*" element={isLoggedIn ? <AppLayout /> : <LoginPage />} />
    </Routes>
  );
}

export default App;

// import { Routes, Route, Link, useNavigate } from "react-router-dom";
// import { useState, useEffect } from "react";
// import axios from "axios";
// import "./App.css";
// import googleIcon from "./assets/icons/google.svg";
// import naverIcon from "./assets/icons/naver.png";
// import kakaoIcon from "./assets/icons/kakao.svg";

// // 필요한 컴포넌트들을 import 합니다.
// import MainPage from "./pages/MainPage";
// import MyRecords from "./components/MyRecords";
// import LoginSuccess from "./components/LoginSuccess";
// import RecordEditPage from "./pages/RecordEditPage";

// // 사용자 정보 타입을 위한 인터페이스
// interface UserProfile {
//   name: string;
//   email: string;
//   picture: string;
// }

// // --- 로그인 페이지 컴포넌트 ---
// const LoginPage = () => {
//   const googleLoginUrl = "http://localhost:8080/oauth2/authorization/google";
//   const naverLoginUrl = "http://localhost:8080/oauth2/authorization/naver";
//   const kakaoLoginUrl = "http://localhost:8080/oauth2/authorization/kakao";

//   return (
//     <div className="login-container">
//       <h1>AI 회의록 요약</h1>
//       <p>서비스를 이용하려면 로그인이 필요합니다.</p>
//       <div className="social-login-buttons">
//         <a href={googleLoginUrl} className="login-button google">
//           <img src={googleIcon} alt="Google logo" />
//           Google 계정으로 로그인
//         </a>
//         <a href={naverLoginUrl} className="login-button naver">
//           <img src={naverIcon} alt="Naver logo" />
//           네이버 아이디로 로그인
//         </a>
//         <a href={kakaoLoginUrl} className="login-button kakao">
//           <img src={kakaoIcon} alt="Kakao logo" />
//           카카오로 시작하기
//         </a>
//       </div>
//     </div>
//   );
// };

// // --- 로그인 후 보여줄 메인 앱 레이아웃 ---
// const AppLayout = () => {
//   const [user, setUser] = useState<UserProfile | null>(null);
//   const navigate = useNavigate();

//   const [theme, setTheme] = useState(() => {
//     return localStorage.getItem("theme") || "dark"; // 기본값 다크 모드
//   });

//   useEffect(() => {
//     document.body.className = "";
//     document.body.classList.add(theme + "-mode");
//     localStorage.setItem("theme", theme);
//   }, [theme]);

//   const toggleTheme = () => {
//     setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
//   };

//   useEffect(() => {
//     const fetchUser = async () => {
//       const token = localStorage.getItem("accessToken");
//       if (token) {
//         try {
//           const response = await axios.get<UserProfile>(
//             "http://localhost:8080/api/me",
//             {
//               headers: { Authorization: `Bearer ${token}` },
//             }
//           );
//           setUser(response.data);
//         } catch (error) {
//           console.error("사용자 정보 로딩 실패:", error);
//           handleLogout(); // 토큰이 유효하지 않으면 로그아웃 처리
//         }
//       }
//     };
//     fetchUser();
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("accessToken");
//     navigate(0); // 페이지를 새로고침하여 로그아웃 상태를 반영
//   };

//   return (
//     <div className="container">
//       <header className="app-header">
//         <div className="logo" onClick={() => navigate("/")}>
//           AI 회의록 요약
//         </div>
//         <nav className="header-nav">
//           {/* --- [수정된 부분 시작] --- */}
//           {/* 1. 테마 전환 버튼을 Link 밖으로 분리 */}
//           <button
//             className="icon-button"
//             title="테마 전환"
//             onClick={toggleTheme}
//           >
//             {theme === "dark" ? (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
//               </svg>
//             ) : (
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 width="24"
//                 height="24"
//                 viewBox="0 0 24 24"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth="2"
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//               >
//                 <circle cx="12" cy="12" r="5"></circle>
//                 <line x1="12" y1="1" x2="12" y2="3"></line>
//                 <line x1="12" y1="21" x2="12" y2="23"></line>
//                 <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
//                 <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
//                 <line x1="1" y1="12" x2="3" y2="12"></line>
//                 <line x1="21" y1="12" x2="23" y2="12"></line>
//                 <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
//                 <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
//               </svg>
//             )}
//           </button>

//           {/* 2. '내 기록' 버튼만 Link로 감싸기 */}
//           <Link to="/my-records" className="nav-item">
//             <button className="icon-button" title="내 기록 보기">
//               내 기록
//             </button>
//           </Link>
//           {/* --- [수정된 부분 끝] --- */}

//           <div className="nav-item">
//             <span>{user?.name || "..."}님</span>
//             <button onClick={handleLogout} className="logout-button">
//               로그아웃
//             </button>
//           </div>
//         </nav>
//       </header>
//       <Routes>
//         <Route path="/" element={<MainPage />} />
//         <Route path="/my-records" element={<MyRecords />} />
//         {/* --- [추가된 라우트] --- */}
//         <Route path="/edit/:id" element={<RecordEditPage />} />
//       </Routes>
//     </div>
//   );
// };

// // --- 전체 앱 로직 ---
// function App() {
//   const [isLoggedIn, setIsLoggedIn] = useState(false);
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     const token = localStorage.getItem("accessToken");
//     if (token) {
//       setIsLoggedIn(true);
//     }
//     setLoading(false);
//   }, []);

//   if (loading) {
//     return <div>로딩 중...</div>; // 로딩 중 화면
//   }

//   return (
//     <Routes>
//       <Route path="/login/success" element={<LoginSuccess />} />
//       <Route path="/*" element={isLoggedIn ? <AppLayout /> : <LoginPage />} />
//     </Routes>
//   );
// }

// export default App;
