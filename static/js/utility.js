// static/js/utility.js

// 現在の年と月を取得し、YYYY-MMの形式で返す関数
export const getCurrentMonth = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');  // 月は0から始まるので+1
    return `${year}-${month}`;//YYYY-MM形式
};

export const setDefaultMonth = (monthPicker) => {
    const currentMonth = getCurrentMonth();
    monthPicker.value = currentMonth;
    return currentMonth;
};

export const getCalendarInfoFromCurrentMonth = (currentMonth) => {
    const [year, month] = currentMonth.split("-").map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();
    const firstDayIndex = new Date(year, month - 1, 1).getDay();
    const totalCells = Math.ceil((daysInMonth + firstDayIndex) / 7) * 7;
    return { year, month, daysInMonth, firstDayIndex, totalCells };
};

// サーバーからカレンダー情報を取得して処理する関数
export const fetchCalendarInfo = async () => {
    try {
        // サーバーから現在のカレンダー情報を取得
        const response = await fetch('/get_calendar_info');
        const calendarInfo = await response.json();

        // カレンダー情報を処理する
        const { year, month, daysInMonth, firstDayIndex, totalCells } = calendarInfo;
        return { year, month, daysInMonth, firstDayIndex, totalCells };
    } catch (error) {
        console.error("Error fetching calendar info:", error);
        return null;
    }
};

// カレンダーを生成する関数
export const generateCalendarFromServer = async () => {
    const calendarInfo = await fetchCalendarInfo();
    if (!calendarInfo) return;

    const { year, month, daysInMonth, firstDayIndex, totalCells } = calendarInfo;

    // ここで、カレンダーを生成するための処理を実行
    console.log("カレンダー情報:", year, month, daysInMonth, firstDayIndex, totalCells);

    // 生成されたカレンダーをDOMに反映する処理を追加
    // 例: generateCalendar(calendarElement, year, month, daysInMonth, firstDayIndex, totalCells);
};