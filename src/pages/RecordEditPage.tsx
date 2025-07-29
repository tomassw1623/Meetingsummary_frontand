import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchMeetingRecordById, updateMeetingRecord } from "../api/meeting";
import type { MeetingRecord } from "../interfaces";

const RecordEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [record, setRecord] = useState<MeetingRecord | null>(null);
  const [summary, setSummary] = useState("");
  const [decisions, setDecisions] = useState("");
  const [todo, setTodo] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const getRecord = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token || !id) {
        setError("잘못된 접근입니다.");
        setLoading(false);
        return;
      }

      try {
        // [수정] 이제 fetchMeetingRecordById를 직접 사용합니다.
        const targetRecord = await fetchMeetingRecordById(token, parseInt(id));

        if (targetRecord) {
          setRecord(targetRecord);
          setSummary(targetRecord.summary);
          setDecisions(targetRecord.decisions || ""); // null일 경우 빈 문자열로 처리
          setTodo(targetRecord.todo || ""); // null일 경우 빈 문자열로 처리
        } else {
          setError("기록을 찾을 수 없습니다.");
        }
      } catch (err) {
        // [수정] err 변수 사용
        setError("기록을 불러오는 중 오류가 발생했습니다.");
        console.error(err); // 콘솔에 에러를 출력하여 디버깅에 용이하게 합니다.
      } finally {
        setLoading(false);
      }
    };
    getRecord();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("accessToken");
    if (!token || !id) {
      setError("인증 정보가 없습니다.");
      return;
    }

    try {
      await updateMeetingRecord(token, parseInt(id), {
        summary,
        decisions,
        todo,
      });
      alert("성공적으로 수정되었습니다.");
      navigate("/my-records"); // 수정 후 목록 페이지로 이동
    } catch (err) {
      // [수정] err 변수 사용
      setError("수정 중 오류가 발생했습니다.");
      console.error(err); // 콘솔에 에러를 출력하여 디버깅에 용이하게 합니다.
    }
  };

  if (loading) return <div className="loading-message">로딩 중...</div>;
  if (error) return <div className="error-message">{error}</div>;
  if (!record) return <div className="error-message">기록이 없습니다.</div>;

  return (
    <div className="edit-container">
      <h2>기록 수정</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <div className="form-group">
          <label htmlFor="summary">📝 핵심 요약</label>
          <textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            rows={5}
          />
        </div>
        <div className="form-group">
          <label htmlFor="decisions">📌 결정 사항</label>
          <textarea
            id="decisions"
            value={decisions}
            onChange={(e) => setDecisions(e.target.value)}
            rows={5}
          />
        </div>
        <div className="form-group">
          <label htmlFor="todo">✅ 할 일 목록</label>
          <textarea
            id="todo"
            value={todo}
            onChange={(e) => setTodo(e.target.value)}
            rows={5}
          />
        </div>
        <div className="form-actions">
          <button type="submit" className="action-button save">
            저장
          </button>
          <button
            type="button"
            onClick={() => navigate("/my-records")}
            className="action-button cancel"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default RecordEditPage;
