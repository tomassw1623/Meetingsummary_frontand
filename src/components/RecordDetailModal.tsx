import type { MeetingRecord } from "../interfaces";

// 모달 컴포넌트에 필요한 props 타입을 정의합니다.
interface ModalProps {
  record: MeetingRecord | null; // 표시할 기록 데이터 또는 null
  onClose: () => void; // 모달을 닫는 함수
}

const RecordDetailModal = ({ record, onClose }: ModalProps) => {
  // 표시할 기록이 없으면 아무것도 렌더링하지 않습니다.
  if (!record) {
    return null;
  }

  return (
    // 모달의 배경(오버레이)입니다. 클릭하면 닫힙니다.
    <div className="modal-overlay" onClick={onClose}>
      {/* 모달의 실제 콘텐츠 부분입니다. 오버레이 클릭이 전파되지 않도록 막습니다. */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>
        <h2>원본 회의록 내용</h2>
        <div className="original-content-wrapper">
          {/* pre 태그를 사용해 줄바꿈과 공백을 그대로 표시합니다. */}
          <pre>{record.originalContent}</pre>
        </div>
      </div>
    </div>
  );
};

export default RecordDetailModal;
