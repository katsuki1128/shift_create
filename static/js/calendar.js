// static/js/calendar.js
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
                    shiftInfo.style.fontSize = "8px"; // ⚪️をさらに小さく表示
                    // クリックイベントを別関数に切り分け
                    cellElement.addEventListener("click", () => showShiftDetails(cell.dateStr, userShifts));

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

// シフト情報を表示する関数
const showShiftDetails = (dateStr, userShifts) => {
    const shiftDetails = Array.from(userShifts.values()).find(shift => shift.date === dateStr);

    if (shiftDetails) {
        // 日付をフォーマット (例: 2024年10月6日 (火))
        const date = new Date(shiftDetails.date);
        const formattedDate = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 (${['日', '月', '火', '水', '木', '金', '土'][date.getDay()]})`;

        // シフト詳細をDOMに挿入
        document.querySelector('.shift-date').textContent = formattedDate;

        // 開始時間と終了時間を設定
        document.querySelector('.start-time').textContent = shiftDetails.start_time;
        document.querySelector('.end-time').textContent = shiftDetails.end_time;

        // `shift-content` に `dateStr` を保存
        document.querySelector('.shift-content').dataset.dateStr = dateStr;

        // シフトの説明や勤務時間を設定 (必要に応じて詳細を追加)
        document.querySelector('.shift-description').innerHTML = `
            ${shiftDetails.work_hours}時間勤務
        `;
        // 編集ボタンを表示
        document.querySelector(".edit-button").style.display = "inline-block";
        console.log("Shift Details:", shiftDetails);  // shiftDetailsをコンソールに表示

    } else {
        console.log("No shift details for this day.");
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // shift-contentをクリックした時にモーダルを表示する
    document.querySelector('.shift-content').addEventListener('click', function () {
        const startTimeElem = this.querySelector('.start-time');
        const endTimeElem = this.querySelector('.end-time');

        // クリックした時にモーダルを開く
        openShiftEditModal(startTimeElem, endTimeElem);
    });

    // 「変更」ボタンをクリックした時にもモーダルを表示する
    document.querySelector('.edit-button').addEventListener('click', function () {
        const startTimeElem = document.querySelector('.shift-content .start-time');
        const endTimeElem = document.querySelector('.shift-content .end-time');

        // 変更ボタンをクリックした時にもモーダルを開く
        openShiftEditModal(startTimeElem, endTimeElem);
    });

    // モーダルを閉じる
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
    });
});

// shift-contentまたはedit-buttonをクリックした時にモーダルを表示する関数
const openShiftEditModal = (startTimeElem, endTimeElem) => {
    // モーダルを表示する
    const modal = document.getElementById('modal');
    modal.style.display = 'block';

    // モーダルに現在の時間をセット
    document.getElementById('start-time').value = startTimeElem.textContent;
    document.getElementById('end-time').value = endTimeElem.textContent;

    // 保存ボタンがクリックされたときの処理
    document.getElementById('save-button').addEventListener('click', () => {
        const newStartTime = document.getElementById('start-time').value;
        const newEndTime = document.getElementById('end-time').value;

        // サーバーにAJAXでリクエストを送る
        updateShiftTimes(newStartTime, newEndTime, startTimeElem, endTimeElem);

        // モーダルを閉じる
        modal.style.display = 'none';
    });
};

// shift-contentをクリックした時にモーダルを表示する
document.querySelector('.shift-content').addEventListener('click', function () {
    const startTimeElem = this.querySelector('.start-time');
    const endTimeElem = this.querySelector('.end-time');

    // クリックした時にモーダルを開く
    openShiftEditModal(startTimeElem, endTimeElem);
});

// 「変更」ボタンをクリックした時にもモーダルを表示する
document.querySelector('.edit-button').addEventListener('click', function () {
    const startTimeElem = document.querySelector('.shift-content .start-time');
    const endTimeElem = document.querySelector('.shift-content .end-time');

    // 変更ボタンをクリックした時にもモーダルを開く
    openShiftEditModal(startTimeElem, endTimeElem);
});

// AJAXでサーバーにリクエストを送信
function updateShiftTimes(newStartTime, newEndTime, startTimeElem, endTimeElem) {
    const shiftDate = document.querySelector('.shift-content').dataset.dateStr;  // `dateStr`を取得

    fetch('/update_shift_times', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            date: shiftDate,
            start_time: newStartTime,
            end_time: newEndTime
        })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // 時間を更新
                startTimeElem.textContent = newStartTime;
                endTimeElem.textContent = newEndTime;
                console.log("シフト時間が更新されました。");
            } else {
                console.error("更新エラー:", data.error);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

// モーダルを閉じる
document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('modal').style.display = 'none';
});

export { generateCalendar };
