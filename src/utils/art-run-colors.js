// 협동 러닝에서 참가자별 경로(trail)를 구분하기 위한 색상 팔레트.
// 시인성이 좋고 서로 잘 구분되는 색으로 구성한다.
const PARTICIPANT_COLORS = [
  '#ff5a1f', // 주황
  '#42a5f5', // 파랑
  '#4caf50', // 초록
  '#ab47bc', // 보라
  '#ff7043', // 코랄
  '#26c6da', // 청록
  '#ec407a', // 분홍
  '#ffca28', // 노랑
];

/**
 * userId 를 고정 색상에 매핑한다. 같은 userId 는 항상 같은 색을 돌려준다.
 * @param {number} userId 참가자 사용자 ID
 * @returns {string} 헥스 색상 코드
 */
export function getParticipantColor(userId) {
  const index = Math.abs(Number(userId)) % PARTICIPANT_COLORS.length;
  return PARTICIPANT_COLORS[index];
}
