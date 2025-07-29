// AI의 응답 데이터 구조를 정의하는 인터페이스
export interface AiResponse {
  summary: string;
  decisions: string;
  todo: string;
}

// --- [추가된 부분] 회의록 기록 데이터의 구조를 정의하는 인터페이스 ---
export interface MeetingRecord {
  id: number;
  originalContent: string;
  summary: string;
  decisions: string;
  todo: string;
  createdAt: string; // 날짜/시간은 문자열로 받아옵니다.
}
