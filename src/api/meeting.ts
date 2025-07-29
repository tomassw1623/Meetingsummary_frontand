// export async function fetchMeetingRecords(token: string) {
//   const response = await fetch("http://localhost:8080/ai/records", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });

//   if (!response.ok) {
//     throw new Error("기록을 불러오는 데 실패했습니다");
//   }

//   return response.json();
// }

// src/api/meeting.ts

const API_BASE_URL = "http://localhost:8080/api/me";

// 모든 기록 조회
export async function fetchMeetingRecords(token: string) {
  const response = await fetch(`${API_BASE_URL}/records`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("기록을 불러오는 데 실패했습니다");
  }

  return response.json();
}

// 단일 기록 조회
export async function fetchMeetingRecordById(token: string, recordId: number) {
  const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  if (!response.ok) {
    throw new Error("기록을 불러오는데 실패했습니다.");
  }
  return response.json();
}

// 기록 수정
export async function updateMeetingRecord(
  token: string,
  recordId: number,
  data: { summary: string; decisions: string; todo: string }
) {
  const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("기록 수정에 실패했습니다.");
  }

  return response.json();
}

// 기록 삭제 (이 부분이 중요합니다!)
export async function deleteMeetingRecord(token: string, recordId: number) {
  const response = await fetch(`${API_BASE_URL}/records/${recordId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 204) {
      return;
    }
    throw new Error("기록 삭제에 실패했습니다.");
  }
}
