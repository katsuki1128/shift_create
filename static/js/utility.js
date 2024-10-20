// static/js/utility.js

// 現在の年と月を取得し、YYYY-MMの形式で返す関数
export const getCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');  // 月は0から始まるので+1
    return `${year}-${month}`;//YYYY-MM形式
};

export const setDefaultMonth = (shiftMonthInput) => {
    const currentMonth = getCurrentMonth();
    shiftMonthInput.value = currentMonth;
    return currentMonth;
};

export const getCalendarInfoFromCurrentMonth = (currentMonth) => {
    const [year, month] = currentMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const totalCells = Math.ceil((daysInMonth + firstDayIndex) / 7) * 7;
    return { year, month, daysInMonth, firstDayIndex, totalCells };
};
