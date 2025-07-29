// 예: src/pages/MeetingRecords.tsx
import { useEffect, useState } from "react";
import { fetchMeetingRecords } from "../api/meeting";

type MeetingRecord = {
  summary: string;
  decisions: string;
  todo: string;
};

const MeetingRecords = () => {
  const [records, setRecords] = useState<MeetingRecord[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("로그인이 필요합니다.");
      return;
    }

    fetchMeetingRecords(token)
      .then(setRecords)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>회의 요약 기록</h2>
      <ul>
        {records.map((r, idx) => (
          <li key={idx}>
            <p>
              <strong>요약:</strong> {r.summary}
            </p>
            <p>
              <strong>결정 사항:</strong> {r.decisions}
            </p>
            <p>
              <strong>할 일:</strong> {r.todo}
            </p>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
};

export default MeetingRecords;
