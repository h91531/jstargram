export default function formatDate(dateString) {
  const timeZone = "Asia/Seoul";
  if (!dateString) return "날짜 오류";

  const date = new Date(dateString);
  if (isNaN(date)) return "날짜 오류";

  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone,
  }).format(date);
}
