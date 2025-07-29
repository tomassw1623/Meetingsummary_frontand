// import { useState, useEffect } from "react";
// import axios from "axios";
// import { Link } from "react-router-dom";
// import type { MeetingRecord } from "../interfaces";

// const MyRecords = () => {
//   const [records, setRecords] = useState<MeetingRecord[]>([]);
//   const [loading, setLoading] = useState<boolean>(true);
//   const [error, setError] = useState<string>("");

//   useEffect(() => {
//     const fetchRecords = async () => {
//       try {
//         const token = localStorage.getItem("accessToken");
//         if (!token) {
//           setError("로그인이 필요합니다.");
//           setLoading(false);
//           return;
//         }

//         const response = await axios.get<MeetingRecord[]>(
//           "http://localhost:8080/api/me/records",
//           {
//             headers: { Authorization: `Bearer ${token}` },
//           }
//         );

//         // 백엔드에서 이미 최신순으로 정렬되므로 추가 정렬은 필요 없습니다.
//         setRecords(response.data);
//       } catch (err) {
//         setError("기록을 불러오는 중 오류가 발생했습니다.");
//         console.error(err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchRecords();
//   }, []);

//   if (loading) {
//     return <div className="loading-message">기록을 불러오는 중...</div>;
//   }

//   if (error) {
//     return <div className="error-message">{error}</div>;
//   }

//   return (
//     <div className="records-container">
//       <div className="records-header">
//         <h2>내 회의록 기록</h2>
//         <Link to="/" className="back-button">
//           요약 페이지로 돌아가기
//         </Link>
//       </div>
//       {records.length === 0 ? (
//         <p className="no-records">아직 저장된 기록이 없습니다.</p>
//       ) : (
//         <ul className="records-list">
//           {records.map((record) => (
//             <li key={record.id} className="record-item">
//               <div className="record-date">
//                 {new Date(record.createdAt).toLocaleString("ko-KR")}
//               </div>
//               <div className="record-content">
//                 <h3>📝 핵심 요약</h3>
//                 <p>{record.summary}</p>
//                 <h3>📌 결정 사항</h3>
//                 <p>{record.decisions || "없음"}</p>
//                 <h3>✅ 할 일 목록</h3>
//                 <p>{record.todo || "없음"}</p>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default MyRecords;

import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import type { MeetingRecord } from "../interfaces";
import { deleteMeetingRecord } from "../api/meeting";
import RecordDetailModal from "./RecordDetailModal"; // 방금 만든 모달 컴포넌트를 import 합니다.

const MyRecords = () => {
  const [records, setRecords] = useState<MeetingRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  // --- [추가] 모달 상태 관리 ---
  // 어떤 기록을 모달로 보여줄지 관리하는 상태입니다. null이면 모달이 닫힌 상태입니다.
  const [selectedRecord, setSelectedRecord] = useState<MeetingRecord | null>(
    null
  );

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const response = await axios.get<MeetingRecord[]>(
        "http://localhost:8080/api/me/records",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setRecords(response.data);
    } catch (err) {
      setError("기록을 불러오는 중 오류가 발생했습니다.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleDelete = async (recordId: number) => {
    if (!window.confirm("정말로 이 기록을 삭제하시겠습니까?")) {
      return;
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("로그인이 필요합니다.");
        return;
      }
      await deleteMeetingRecord(token, recordId);
      setRecords(records.filter((record) => record.id !== recordId));
    } catch (err) {
      setError("기록 삭제 중 오류가 발생했습니다.");
      console.error(err);
    }
  };

  if (loading) {
    return <div className="loading-message">기록을 불러오는 중...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    // React Fragment(<></>)를 사용해 여러 컴포넌트를 감쌉니다.
    <>
      <div className="records-container">
        <div className="records-header">
          <h2>내 회의록 기록</h2>
          <Link to="/" className="back-button">
            요약 페이지로 돌아가기
          </Link>
        </div>
        {records.length === 0 ? (
          <p className="no-records">아직 저장된 기록이 없습니다.</p>
        ) : (
          <ul className="records-list">
            {records.map((record) => (
              // --- [수정] li에 클릭 이벤트와 클래스 추가 ---
              <li
                key={record.id}
                className="record-item clickable"
                onClick={() => setSelectedRecord(record)} // 클릭 시 selectedRecord 상태를 업데이트합니다.
              >
                <div className="record-header">
                  <div className="record-date">
                    {new Date(record.createdAt).toLocaleString("ko-KR")}
                  </div>
                  <div className="record-actions">
                    {/* 수정/삭제 버튼 클릭이 li의 클릭 이벤트를 방해하지 않도록 이벤트 전파를 막습니다. */}
                    <Link
                      to={`/edit/${record.id}`}
                      className="action-button edit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      수정
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // 이벤트 전파 중지
                        handleDelete(record.id);
                      }}
                      className="action-button delete"
                    >
                      삭제
                    </button>
                  </div>
                </div>
                <div className="record-content">
                  <h3>📝 핵심 요약</h3>
                  <p>{record.summary}</p>
                  <h3>📌 결정 사항</h3>
                  <p>{record.decisions || "없음"}</p>
                  <h3>✅ 할 일 목록</h3>
                  <p>{record.todo || "없음"}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* --- [추가] 모달 컴포넌트 렌더링 --- */}
      {/* selectedRecord가 있을 때만 모달을 보여줍니다. */}
      <RecordDetailModal
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)} // 모달을 닫는 함수를 전달합니다.
      />
    </>
  );
};

export default MyRecords;
