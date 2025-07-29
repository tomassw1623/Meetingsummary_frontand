import { useState } from "react";
import axios from "axios";
import type { AiResponse } from "../interfaces";
import "../App.css";

// --- [추가] 구조화된 입력을 위한 상태 타입 ---
interface StructuredInput {
  topic: string;
  attendees: string;
  discussion: string;
}

const MainPage = () => {
  const [mode, setMode] = useState<"free" | "structured">("free"); // 입력 모드 상태
  const [inputText, setInputText] = useState<string>("");
  // --- [추가] 구조화된 입력을 위한 상태 ---
  const [structuredInput, setStructuredInput] = useState<StructuredInput>({
    topic: "",
    attendees: "",
    discussion: "",
  });
  const [result, setResult] = useState<AiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleInputChange = (
    e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    if (mode === "structured") {
      setStructuredInput((prev) => ({ ...prev, [name]: value }));
    } else {
      setInputText(value);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setError("");

    // --- [수정] 모드에 따라 전송할 내용 생성 ---
    let contentToSubmit = "";
    if (mode === "free") {
      if (!inputText.trim()) {
        setError("회의록 내용을 입력해주세요.");
        setLoading(false);
        return;
      }
      contentToSubmit = inputText;
    } else {
      const { topic, attendees, discussion } = structuredInput;
      if (!topic.trim() || !discussion.trim()) {
        setError("회의 주제와 주요 논의 내용은 필수 항목입니다.");
        setLoading(false);
        return;
      }
      // 구조화된 내용을 하나의 문자열로 조합
      contentToSubmit = `
회의 주제: ${topic}
참석자: ${attendees || "정보 없음"}
---
[주요 논의 내용]
${discussion}
      `.trim();
    }

    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        setError("로그인이 필요합니다.");
        setLoading(false);
        return;
      }

      const response = await axios.post<AiResponse>(
        "http://localhost:8080/api/summarize",
        { content: contentToSubmit }, // 조합된 내용을 전송
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setResult(response.data);
    } catch (err) {
      setError(
        "요약 중 오류가 발생했습니다. 다시 로그인하거나 서버 상태를 확인해주세요."
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main>
      {/* --- [추가] 모드 전환 버튼 --- */}
      <div className="mode-switcher">
        <button
          onClick={() => setMode("free")}
          className={mode === "free" ? "active" : ""}
        >
          자유 양식
        </button>
        <button
          onClick={() => setMode("structured")}
          className={mode === "structured" ? "active" : ""}
        >
          구조화된 양식
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* --- [수정] 모드에 따라 다른 입력 폼 렌더링 --- */}
        {mode === "free" ? (
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="이곳에 회의록 내용을 자유롭게 붙여넣으세요..."
            rows={15}
            disabled={loading}
          />
        ) : (
          <div className="structured-form">
            <div className="form-group">
              <label htmlFor="topic">회의 주제 (필수)</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={structuredInput.topic}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="attendees">참석자</label>
              <input
                type="text"
                id="attendees"
                name="attendees"
                value={structuredInput.attendees}
                onChange={handleInputChange}
                disabled={loading}
              />
            </div>
            <div className="form-group">
              <label htmlFor="discussion">주요 논의 내용 (필수)</label>
              <textarea
                id="discussion"
                name="discussion"
                value={structuredInput.discussion}
                onChange={handleInputChange}
                rows={10}
                disabled={loading}
              />
            </div>
          </div>
        )}

        <button type="submit" className="summarize-button" disabled={loading}>
          {loading ? "요약하는 중..." : "요약하기"}
        </button>
      </form>

      {error && <div className="error-message">{error}</div>}

      {result && (
        <div className="result-card">
          <h2>요약 결과</h2>
          <div className="result-section">
            <h3>📝 핵심 요약</h3>
            <p>{result.summary}</p>
          </div>
          <div className="result-section">
            <h3>📌 결정 사항</h3>
            <p>{result.decisions || "없음"}</p>
          </div>
          <div className="result-section">
            <h3>✅ 할 일 목록</h3>
            <p>{result.todo || "없음"}</p>
          </div>
        </div>
      )}
    </main>
  );
};

export default MainPage;

// import { useState, useEffect } from "react"; // [수정] useEffect를 import에 추가했습니다.
// import type { AiResponse } from "../interfaces";
// import "../App.css";

// // [추가] 스트리밍 완료 후 저장 요청을 보낼 API 함수
// async function saveRecord(
//   token: string,
//   record: {
//     originalContent: string;
//     summary: string;
//     decisions: string;
//     todo: string;
//   }
// ) {
//   try {
//     await fetch("http://localhost:8080/api/me/records", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${token}`,
//       },
//       body: JSON.stringify(record),
//     });
//   } catch (error) {
//     console.error("기록 저장에 실패했습니다.", error);
//     // 사용자에게 알리지 않고, 콘솔에만 에러를 남깁니다.
//   }
// }

// interface StructuredInput {
//   topic: string;
//   attendees: string;
//   discussion: string;
// }

// const MainPage = () => {
//   const [mode, setMode] = useState<"free" | "structured">("free");
//   const [inputText, setInputText] = useState<string>("");
//   const [structuredInput, setStructuredInput] = useState<StructuredInput>({
//     topic: "",
//     attendees: "",
//     discussion: "",
//   });

//   const [result, setResult] = useState<AiResponse>({
//     summary: "",
//     decisions: "",
//     todo: "",
//   });
//   const [loading, setLoading] = useState<boolean>(false);
//   const [error, setError] = useState<string>("");
//   const [isStreamingDone, setIsStreamingDone] = useState<boolean>(false);

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();
//     setLoading(true);
//     setError("");
//     setResult({ summary: "", decisions: "", todo: "" });
//     setIsStreamingDone(false);

//     let contentToSubmit = "";
//     if (mode === "free") {
//       if (!inputText.trim()) {
//         setError("회의록 내용을 입력해주세요.");
//         setLoading(false);
//         return;
//       }
//       contentToSubmit = inputText;
//     } else {
//       const { topic, attendees, discussion } = structuredInput;
//       if (!topic.trim() || !discussion.trim()) {
//         setError("회의 주제와 주요 논의 내용은 필수 항목입니다.");
//         setLoading(false);
//         return;
//       }
//       contentToSubmit = `회의 주제: ${topic}\n참석자: ${
//         attendees || "정보 없음"
//       }\n---\n[주요 논의 내용]\n${discussion}`;
//     }

//     const token = localStorage.getItem("accessToken");
//     if (!token) {
//       setError("로그인이 필요합니다.");
//       setLoading(false);
//       return;
//     }

//     try {
//       const response = await fetch(
//         "http://localhost:8080/api/summarize-stream",
//         {
//           method: "POST",
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//           body: JSON.stringify({ content: contentToSubmit }),
//         }
//       );

//       if (!response.ok) {
//         throw new Error("서버에서 오류가 발생했습니다.");
//       }

//       const reader = response.body?.getReader();
//       if (!reader) {
//         throw new Error("스트림을 읽을 수 없습니다.");
//       }
//       const decoder = new TextDecoder();
//       let buffer = "";
//       let sectionIndex = 0;

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) {
//           if (buffer) {
//             setResult((prev) => {
//               const sections = ["summary", "decisions", "todo"];
//               const currentSection = sections[sectionIndex] as keyof AiResponse;
//               return {
//                 ...prev,
//                 [currentSection]: prev[currentSection] + buffer,
//               };
//             });
//           }
//           break;
//         }

//         buffer += decoder.decode(value, { stream: true });
//         const parts = buffer.split("|||SECTION_BREAK|||");

//         for (let i = 0; i < parts.length - 1; i++) {
//           const part = parts[i];
//           setResult((prev) => {
//             const sections = ["summary", "decisions", "todo"];
//             const currentSection = sections[sectionIndex] as keyof AiResponse;
//             return { ...prev, [currentSection]: prev[currentSection] + part };
//           });
//           sectionIndex++;
//         }

//         buffer = parts[parts.length - 1];
//       }
//       setIsStreamingDone(true);
//     } catch (err) {
//       setError("요약 중 오류가 발생했습니다.");
//       console.error(err);
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (isStreamingDone) {
//       setLoading(false);
//       const token = localStorage.getItem("accessToken");
//       // [수정] let을 const로 변경했습니다.
//       const originalContent =
//         mode === "free"
//           ? inputText
//           : `회의 주제: ${structuredInput.topic}\n참석자: ${
//               structuredInput.attendees || "정보 없음"
//             }\n---\n[주요 논의 내용]\n${structuredInput.discussion}`;

//       if (token && result.summary) {
//         saveRecord(token, {
//           originalContent: originalContent,
//           ...result,
//         });
//       }
//     }
//   }, [isStreamingDone, result, inputText, structuredInput, mode]);

//   const handleInputChange = (
//     e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>
//   ) => {
//     const { name, value } = e.target;
//     if (mode === "structured") {
//       setStructuredInput((prev) => ({ ...prev, [name]: value }));
//     } else {
//       setInputText(value);
//     }
//   };

//   return (
//     <main>
//       <div className="mode-switcher">
//         <button
//           onClick={() => setMode("free")}
//           className={mode === "free" ? "active" : ""}
//         >
//           자유 양식
//         </button>
//         <button
//           onClick={() => setMode("structured")}
//           className={mode === "structured" ? "active" : ""}
//         >
//           구조화된 양식
//         </button>
//       </div>

//       <form onSubmit={handleSubmit}>
//         {mode === "free" ? (
//           <textarea
//             value={inputText}
//             onChange={handleInputChange}
//             placeholder="이곳에 회의록 내용을 자유롭게 붙여넣으세요..."
//             rows={15}
//             disabled={loading}
//           />
//         ) : (
//           <div className="structured-form">
//             <div className="form-group">
//               <label htmlFor="topic">회의 주제 (필수)</label>
//               <input
//                 type="text"
//                 id="topic"
//                 name="topic"
//                 value={structuredInput.topic}
//                 onChange={handleInputChange}
//                 disabled={loading}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="attendees">참석자</label>
//               <input
//                 type="text"
//                 id="attendees"
//                 name="attendees"
//                 value={structuredInput.attendees}
//                 onChange={handleInputChange}
//                 disabled={loading}
//               />
//             </div>
//             <div className="form-group">
//               <label htmlFor="discussion">주요 논의 내용 (필수)</label>
//               <textarea
//                 id="discussion"
//                 name="discussion"
//                 value={structuredInput.discussion}
//                 onChange={handleInputChange}
//                 rows={10}
//                 disabled={loading}
//               />
//             </div>
//           </div>
//         )}
//         <button type="submit" className="summarize-button" disabled={loading}>
//           {loading ? "요약하는 중..." : "요약하기"}
//         </button>
//       </form>

//       {error && <div className="error-message">{error}</div>}

//       {(result.summary || result.decisions || result.todo) && (
//         <div className="result-card">
//           <h2>요약 결과</h2>
//           <div className="result-section">
//             <h3>📝 핵심 요약</h3>
//             <p>
//               {result.summary}
//               <span
//                 className={!isStreamingDone && loading ? "blinking-cursor" : ""}
//               ></span>
//             </p>
//           </div>
//           <div className="result-section">
//             <h3>📌 결정 사항</h3>
//             <p>
//               {result.decisions}
//               <span
//                 className={
//                   !isStreamingDone && loading && result.summary
//                     ? "blinking-cursor"
//                     : ""
//                 }
//               ></span>
//             </p>
//           </div>
//           <div className="result-section">
//             <h3>✅ 할 일 목록</h3>
//             <p>
//               {result.todo}
//               <span
//                 className={
//                   !isStreamingDone && loading && result.decisions
//                     ? "blinking-cursor"
//                     : ""
//                 }
//               ></span>
//             </p>
//           </div>
//         </div>
//       )}
//     </main>
//   );
// };

// export default MainPage;
