// static/js/main.js
import { generateCalendar } from './calendar.js';
import { setDefaultMonth, getCurrentMonth } from './utility.js';

// export let currentMonth = '';  // 現在選択されている「月」を保持する変数
export let currentMonth = getCurrentMonth();  // 初期値を現在の年月（YYYY-MM形式）で設定
// 月選択のイベントリスナーを設定

const monthPicker = document.getElementById("shift-month");
monthPicker.addEventListener("change", (event) => {
    currentMonth = event.target.value;  // 選択された月を currentMonth に反映
    console.log(currentMonth)
    initializeCalendar();  // 月が変更されたらカレンダーを生成
});


export let senjuShiftTypes = []; // グローバル変数として宣言

const date = new Date();
const employee_calendar = document.getElementById("calendar");
const selectedDates = new Set();
const removedDates = new Set();
export const userShifts = new Map();



// 指定されたURLからシフトデータを取得し、カレンダーを生成する非同期処理を行う
const initializeCalendar = async () => {
    try {
        const response = await fetch(`/get_login_employee_shifts?currentMonth=${currentMonth}`);
        const shifts = await response.json();
        userShifts.clear();
        Object.entries(shifts).forEach(([date, shiftDetails]) => {
            userShifts.set(date, shiftDetails);
        });
        console.log("userShifts", userShifts)

        // generateCalendar(employee_calendar, userShifts, selectedDates, removedDates, date);
        // カレンダーを生成
        generateCalendar(employee_calendar, userShifts, currentMonth);

    } catch (error) {
        console.error("Error:", error);
    }
};



// document.getElementById("shift-form").addEventListener("submit", async (event) => {
//     event.preventDefault();

//     const dates = {};
//     userShifts.forEach((shiftDetails, date) => {
//         dates[date] = {
//             shift_id: shiftDetails.shift_id,
//             start_time: shiftDetails.start_time,
//             end_time: shiftDetails.end_time
//         };
//     });

//     try {
//         const response = await fetch("/submit", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ dates: dates })
//         });
//         const data = await response.json();

//         generateCalendar(calendar, userShifts, selectedDates, removedDates, date);
//     } catch (error) {
//         console.error("Error:", error);
//     }
// });



const init = async () => {
    // デフォルトの日付をYYYY-MM形式で設定・呼び込み
    currentMonth = setDefaultMonth(monthPicker);
    initializeCalendar();
};

document.addEventListener("DOMContentLoaded", init);

