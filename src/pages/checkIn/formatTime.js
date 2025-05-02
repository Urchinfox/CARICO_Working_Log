export const formatPunchTime = (time) => {
    if (!time) return "載入中...";
    const date = new Date(time); // ISO string
    if (isNaN(date.getTime())) return "載入中..."; // prevent invalid date
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}/${month}/${day} - ${hours}:${minutes}`;
};