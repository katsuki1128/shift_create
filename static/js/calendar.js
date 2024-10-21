// static/js/calendar.js

// import { shiftTypes } from './shifts.js';
import { getCalendarInfoFromCurrentMonth } from './utility.js';
import { currentMonth, userShifts, senjuShiftTypes } from './main.js';

const formatDateString = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};

// 曜日の行を生成する関数
const generateHeaderRow = (employee_calendar) => {
    const headerRow = document.createElement("tr");
    const daysOfWeek = ["月", "火", "水", "木", "金", "土", "日"];
    daysOfWeek.forEach(day => {
        const th = document.createElement("th");
        th.textContent = day;
        th.classList.add("text-xs");
        headerRow.appendChild(th);
    });
    employee_calendar.appendChild(headerRow);
};

// ベースのカレンダーを生成する関数
const generateBaseCalendar = (year, month, daysInMonth, firstDayIndex, totalCells) => {
    const calendar = [];
    let currentDay = 1;
    for (let i = 0; i < totalCells; i++) {
        // 新しい行を作成
        if (i % 7 === 0) {
            calendar.push([]);
        }
        const row = calendar[calendar.length - 1]; // 現在の行

        if (i >= firstDayIndex - 1 && currentDay <= daysInMonth) {
            row.push({
                day: currentDay,
                dateStr: formatDateString(year, month, currentDay),
            });
            currentDay++;
        } else {
            row.push({ day: null, dateStr: null }); // 空セル
        }
    }

    return calendar;
};

// シフト情報をカレンダーに紐付けて表示する関数
const bindShiftsToCalendar = (calendar, userShifts) => {
    calendar.forEach(row => {
        row.forEach(cell => {
            // `cell.dateStr` が存在する場合に処理を行う
            if (cell.dateStr) {
                // `userShifts` 内のシフトの `date` プロパティと `cell.dateStr` を比較する
                const shiftDetails = Array.from(userShifts.values()).find(shift => {
                    return shift.date === cell.dateStr;
                });
                if (shiftDetails) {

                    // シフトが見つかった場合、シフトIDなどの情報を `cell` にバインド
                    cell.shiftInfo = `${shiftDetails.shift_id}`;
                    const shiftId = shiftDetails.shift_id;
                    cell.class = `shift-color-${shiftId}`;
                    console.log(cell)
                }
            }
        });
    });

    return calendar;
};

// カレンダーをDOMに描画する関数
const renderCalendar = (employee_calendar, calendar) => {
    while (employee_calendar.firstChild) {
        employee_calendar.removeChild(employee_calendar.firstChild);
    }

    // ヘッダーを生成
    generateHeaderRow(employee_calendar);

    // 各行とセルを描画
    calendar.forEach(row => {
        const rowElement = document.createElement("tr");
        row.forEach(cell => {
            const cellElement = document.createElement("td");
            cellElement.classList.add("text-xl");

            if (cell.day !== null) {
                cellElement.textContent = cell.day;

                // シフト情報があれば表示
                if (cell.shiftInfo) {
                    const shiftInfo = document.createElement("div");
                    // shiftInfo.textContent = cell.shiftInfo;
                    shiftInfo.innerHTML = "&#x25CF;"; // ⚪️ のUnicode

                    // シフトIDに基づいてクラスを追加 (ここでシフトの色を指定)
                    if (cell.class) {
                        shiftInfo.classList.add(cell.class);  // `shift-color-` クラスを追加
                    }
                    shiftInfo.style.fontSize = "10px"; // ⚪️をさらに小さく表示
                    cellElement.appendChild(shiftInfo);
                }
            }

            rowElement.appendChild(cellElement);
        });
        employee_calendar.appendChild(rowElement);
    });
};

const generateCalendar = (employee_calendar, userShifts, currentMonth) => {
    // 現在の月の情報を取得
    const { year, month, daysInMonth, firstDayIndex, totalCells } = getCalendarInfoFromCurrentMonth(currentMonth);

    // ベースのカレンダーを生成
    let baseCalendar = generateBaseCalendar(year, month, daysInMonth, firstDayIndex, totalCells);

    // シフト情報をカレンダーに紐付ける
    const calendarWithShifts = bindShiftsToCalendar(baseCalendar, userShifts);

    // カレンダーを描画
    renderCalendar(employee_calendar, calendarWithShifts);
};


// const generateCalendar = (employee_calendar, userShifts, selectedDates, removedDates, date) => {
//     while (employee_calendar.firstChild) {
//         employee_calendar.removeChild(employee_calendar.firstChild);
//     }

//     generateHeaderRow(employee_calendar);

//     // グローバル関数から年、月、月の日数を取得
//     const { year, month, daysInMonth, firstDayIndex, totalCells } = getCalendarInfoFromCurrentMonth(currentMonth);

//     let currentDay = 1;

//     for (let i = 0; i < totalCells; i++) {
//         if (i % 7 === 0) {
//             var row = document.createElement("tr");
//             calendar.appendChild(row);
//         }
//         // 日付セルの生成
//         const cell = document.createElement("td");

//         // Tailwindでテキストサイズを大きくする
//         cell.classList.add("text-xl");

//         if (i >= firstDayIndex - 1 && currentDay <= daysInMonth) {
//             const cellDay = currentDay;
//             const dateStr = formatDateString(year, month, cellDay);
//             cell.textContent = currentDay;
//             currentDay++;
//         }

//         row.appendChild(cell);
//     }
// };
// 時間をクリックして編集し、エンターキーを押すと userShifts が更新される
const updateShiftTime = async (dateStr, timeType, newTime) => {
    if (userShifts.has(dateStr)) {
        const shiftDetails = userShifts.get(dateStr);
        shiftDetails[timeType] = newTime;
        userShifts.set(dateStr, shiftDetails);
        console.log(`Updated ${timeType} for ${dateStr} to ${newTime}`);
        console.log(userShifts)
        // サーバーにリクエストを送信してデータベースを更新
        try {
            const dates = Object.fromEntries(userShifts); // userShiftsをオブジェクトに変換

            const response = await fetch("/submit", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ dates: dates })
            });

            const data = await response.json();
            if (response.ok) {
                console.log("Database updated successfully:", data);
            } else {
                console.error("Error updating database:", data);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }
};

const updateShiftDetails = (dateStr, field, value) => {
    fetch('/update_shift_details', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': '{{ csrf_token() }}'  // Flask-WTFのCSRFトークンを使用している場合
        },
        body: JSON.stringify({ date: dateStr, field: field, value: value })
    })
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert('Failed to update shift details');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Failed to update shift details');
        });
};


// シフトカレンダーを生成する関数
const generateShiftCalendar = async (shifts) => {
    const shiftCalendar = document.getElementById("shift-calendar");
    // console.log("shiftCalendar", shiftCalendar);
    shiftCalendar.innerHTML = ''; // 既存のカレンダーをクリア

    // 曜日の配列（日本語）
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];

    // グローバル関数から年、月、月の日数を取得
    // const { year, month, daysInMonth } = getYearMonthDaysFromCurrentMonth();
    const { year, month, daysInMonth, firstDayIndex, totalCells } = getCalendarInfoFromCurrentMonth();

    // ヘッダー行を生成
    const headerRow = document.createElement("tr");
    const headerCell = document.createElement("th");
    headerCell.textContent = "従業員";
    headerRow.appendChild(headerCell);

    for (let day = 1; day <= daysInMonth; day++) {
        const th = document.createElement("th");
        th.textContent = day;
        headerRow.appendChild(th);
    }

    // 「合計」列を追加
    const totalHeaderCell = document.createElement("th");
    totalHeaderCell.textContent = "合計";
    headerRow.appendChild(totalHeaderCell);

    shiftCalendar.appendChild(headerRow);

    // 2行目のヘッダー行（曜日）
    const weekdaysRow = document.createElement("tr");
    const emptyCell = document.createElement("th"); // 従業員名セルに対応する空セル
    weekdaysRow.appendChild(emptyCell);

    for (let day = 1; day <= daysInMonth; day++) {
        const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const dateObj = new Date(dateStr);
        const weekdayIndex = dateObj.getDay(); // 0 (日曜日) 〜 6 (土曜日)
        const weekday = weekdays[weekdayIndex];

        const th = document.createElement("th");
        th.textContent = weekday;
        weekdaysRow.appendChild(th);
    }

    // 「合計」列に空セルまたは特定の文字を追加（オプション）
    const totalWeekdayCell = document.createElement("th");
    totalWeekdayCell.textContent = ""; // 空白にする場合
    // totalWeekdayCell.textContent = "合計"; // 「合計」と表示する場合
    weekdaysRow.appendChild(totalWeekdayCell);

    shiftCalendar.appendChild(weekdaysRow);

    // 従業員ごとの行を生成
    Object.entries(shifts).forEach(([fullName, employeeShifts]) => {
        // console.log(fullName, employeeShifts)
        const row = document.createElement("tr");

        // 従業員名のセルを生成
        const employeeCell = document.createElement("td");
        employeeCell.textContent = fullName;

        employeeCell.addEventListener("click", () => {
            // クリックされた従業員のシフトカレンダーを生成
            generateEmployeeCalendar(fullName, employeeShifts);
            console.log("click")
        });

        row.appendChild(employeeCell);

        // durationの合計を計算する変数
        let totalDuration = 0;

        // 日付ごとのシフトセルを生成
        for (let day = 1; day <= daysInMonth; day++) {
            const date = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const cell = document.createElement("td");

            if (employeeShifts[date]) {
                const shiftDetails = employeeShifts[date];
                // durationがundefinedでない場合にのみ表示
                cell.textContent = shiftDetails.duration !== undefined
                    ? `${shiftDetails.shift_name}${shiftDetails.duration}`
                    : `${shiftDetails.shift_name}`;
                cell.classList.add(`shift${shiftDetails.shift_id}`);

                // durationを合計
                totalDuration += shiftDetails.duration !== undefined ? shiftDetails.duration : 0;
            }
            row.appendChild(cell);
        }

        // 「合計」セルを生成して合計値を表示
        const totalCell = document.createElement("td");
        totalCell.textContent = totalDuration > 0 ? `${totalDuration}` : "";
        totalCell.classList.add("total-duration");
        row.appendChild(totalCell);

        shiftCalendar.appendChild(row);
    });
};


const generateEmployeeCalendar = (fullName, employeeShifts) => {
    console.log(employeeShifts)
    // generateCalendar関数を呼び出して特定の従業員のシフトカレンダーを生成
    const calendar = document.getElementById("calendar");
    const selectedDates = new Set();
    const removedDates = new Set();
    const userShifts = new Map();

    Object.entries(employeeShifts).forEach(([date, shiftDetails]) => {
        userShifts.set(date, shiftDetails);
    });
    console.log("test")

    generateCalendar(calendar, userShifts, selectedDates, removedDates, new Date());
};

export { generateCalendar, generateShiftCalendar };
