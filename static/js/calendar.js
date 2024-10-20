// static/js/calendar.js

// import { shiftTypes } from './shifts.js';
import { getCalendarInfoFromCurrentMonth } from './utility.js';
import { currentMonth, userShifts, senjuShiftTypes } from './main.js';

const formatDateString = (year, month, day) => {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
};


const generateHeaderRow = (calendar) => {
    const headerRow = document.createElement("tr");
    const daysOfWeek = ["月", "火", "水", "木", "金", "土", "日"];
    daysOfWeek.forEach(day => {
        const th = document.createElement("th");
        th.textContent = day;
        th.classList.add("text-xs");
        headerRow.appendChild(th);
    });
    calendar.appendChild(headerRow);
};

const generateCalendar = (calendar, userShifts, selectedDates, removedDates, date) => {
    while (calendar.firstChild) {
        calendar.removeChild(calendar.firstChild);
    }

    generateHeaderRow(calendar);
    console.log("currentMonth", currentMonth)

    // グローバル関数から年、月、月の日数を取得
    const { year, month, daysInMonth, firstDayIndex, totalCells } = getCalendarInfoFromCurrentMonth(currentMonth + 3);

    let currentDay = 1;

    for (let i = 0; i < totalCells; i++) {
        if (i % 7 === 0) {
            var row = document.createElement("tr");
            calendar.appendChild(row);
        }
        // 日付セルの生成
        const cell = document.createElement("td");
        if (i >= firstDayIndex - 1 && currentDay <= daysInMonth) {
            const cellDay = currentDay;
            const dateStr = formatDateString(year, month, cellDay);
            cell.textContent = currentDay;

            // シフトの適用
            if (userShifts.has(dateStr)) {
                const shiftDetails = userShifts.get(dateStr);
                cell.className = `shift${shiftDetails.shift_id}`; // シフトの種類に対応するクラスを追加

            } else {

                // console.error(`Error: No shift type found for date ${dateStr}`);
            }

            // shiftTypes オブジェクトのキーをリストとして取得
            const shiftTypeKeys = senjuShiftTypes.map(([shiftType, _]) => shiftType);

            let nextShiftIndex = 8; // 初期値を8に設定
            let clickTimeout;

            // セルのクリックイベント
            cell.addEventListener("click", () => {
                clearTimeout(clickTimeout); // 既存のタイマーをクリア
                clickTimeout = setTimeout(() => {
                    // シングルクリックの処理をここに書く
                    if (userShifts.has(dateStr)) {
                        const currentShift = userShifts.get(dateStr);
                        console.log(nextShiftIndex)

                        if (nextShiftIndex >= shiftTypeKeys.length) {
                            nextShiftIndex = 0;
                        }


                        const nextShiftName = shiftTypeKeys[nextShiftIndex];
                        const nextShiftDetails = shiftTypes[nextShiftName];
                        userShifts.set(dateStr, {
                            shift_name: nextShiftName,
                            start_time: nextShiftDetails.start_time,
                            end_time: nextShiftDetails.end_time,
                            shift_id: nextShiftDetails.shift_id
                        });
                        cell.className = `shift${nextShiftDetails.shift_id}`;

                        nextShiftIndex++; // インクリメントして次のクリックに備える


                    } else {
                        const firstShiftName = shiftTypeKeys[0];
                        const firstShiftDetails = shiftTypes[firstShiftName];
                        userShifts.set(dateStr, {
                            shift_name: firstShiftName,
                            start_time: firstShiftDetails.start_time,
                            end_time: firstShiftDetails.end_time,
                            shift_id: firstShiftDetails.shift_id
                        });
                        cell.className = `shift${firstShiftDetails.shift_id}`;
                    }
                    console.log("User Shifts:", Array.from(userShifts.entries()));
                }, 200); // 300msの遅延後にシングルクリックを処理
            });

            let mouseoverDisabled = false;

            cell.addEventListener("mouseover", (event) => {
                if (mouseoverDisabled) return;

                const currentShiftInfo = document.getElementById("current-shift-info");
                if (userShifts.has(dateStr)) {
                    const shiftDetails = userShifts.get(dateStr);
                    // console.log(shiftDetails)
                    let shiftInfo = `日付: ${dateStr}, `;

                    if (shiftDetails.shift_name === "休") {
                        shiftInfo += `休み<br>`;
                    } else {
                        shiftInfo += `開始: ${shiftDetails.start_time}, 終了: ${shiftDetails.end_time}, <br>`;
                    }

                    shiftInfo += `勤務時間: ${shiftDetails.work_hours} 時間/日, `;
                    shiftInfo += `連勤: ${shiftDetails.max_consecutive_days} 日, `;
                    shiftInfo += `${shiftDetails.max_days_per_week} 日/週`;

                    currentShiftInfo.innerHTML = shiftInfo;
                    currentShiftInfo.style.display = "block";
                } else {
                    currentShiftInfo.style.display = "none";
                }
            });

            cell.addEventListener("mouseout", () => {
                if (mouseoverDisabled) return;

                const currentShiftInfo = document.getElementById("current-shift-info");
                currentShiftInfo.style.display = "none";
            });



            cell.addEventListener("dblclick", () => {
                clearTimeout(clickTimeout); // シングルクリックのタイマーをクリア
                mouseoverDisabled = true; // マウスオーバーを無効にする
                const currentShiftInfo = document.getElementById("current-shift-info");
                if (userShifts.has(dateStr)) {

                    const shiftDetails = userShifts.get(dateStr);
                    // console.log("Shift Details before update:", shiftDetails); // デバッグ用ログ

                    if (shiftDetails.shift_name === "休") {
                        currentShiftInfo.innerHTML = `日付: ${dateStr}, シフト: 休み`;
                    } else {
                        currentShiftInfo.innerHTML = `日付: ${dateStr}, 開始: <span id="start-time" contenteditable="true">${shiftDetails.start_time}</span>, 終了: <span id="end-time" contenteditable="true">${shiftDetails.end_time}</span><br>
                                          勤務時間: <span id="work-hours" contenteditable="true">${shiftDetails.work_hours}</span> 時間/日, 連勤: <span id="max-consecutive-days" contenteditable="true">${shiftDetails.max_consecutive_days}</span> 日, <span id="max-days-per-week" contenteditable="true">${shiftDetails.max_days_per_week}</span> 日/週`;

                        const startTimeElem = document.getElementById("start-time");
                        const endTimeElem = document.getElementById("end-time");
                        const workHoursElem = document.getElementById("work-hours");
                        const maxConsecutiveDaysElem = document.getElementById("max-consecutive-days");
                        const maxDaysPerWeekElem = document.getElementById("max-days-per-week");

                        const enableMouseover = () => {
                            mouseoverDisabled = false; // マウスオーバーを再度有効にする
                            startTimeElem.removeEventListener("keydown", handleKeydown);
                            endTimeElem.removeEventListener("keydown", handleKeydown);
                            workHoursElem.removeEventListener("keydown", handleKeydown);
                            maxConsecutiveDaysElem.removeEventListener("keydown", handleKeydown);
                            maxDaysPerWeekElem.removeEventListener("keydown", handleKeydown);
                        };

                        const handleKeydown = (event) => {
                            if (event.key === "Enter") {
                                event.preventDefault();
                                const targetId = event.target.id;
                                const newValue = event.target.textContent;
                                if (targetId === "start-time" || targetId === "end-time") {
                                    updateShiftTime(dateStr, targetId.replace("-", "_"), newValue);
                                } else {
                                    updateShiftDetails(dateStr, targetId.replace("-", "_"), newValue);
                                }
                                enableMouseover();
                            }
                        };

                        startTimeElem.addEventListener("keydown", handleKeydown);
                        endTimeElem.addEventListener("keydown", handleKeydown);
                        workHoursElem.addEventListener("keydown", handleKeydown);
                        maxConsecutiveDaysElem.addEventListener("keydown", handleKeydown);
                        maxDaysPerWeekElem.addEventListener("keydown", handleKeydown);
                    }
                } else {
                    currentShiftInfo.textContent = "シフト情報がありません";
                }
            });

            currentDay++;
        }

        row.appendChild(cell);
    }
};
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
