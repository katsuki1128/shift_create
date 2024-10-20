// static/js/main.js
import { generateCalendar, generateShiftCalendar } from './calendar.js';


export let currentMonth = '';  // 現在選択されている「月」を保持する変数

export let senjuShiftTypes = []; // グローバル変数として宣言

const date = new Date();
const calendar = document.getElementById("calendar");
const selectedDates = new Set();
const removedDates = new Set();
export const userShifts = new Map();


// 指定されたURLからシフトデータを取得し、カレンダーを生成する非同期処理を行う
const initializeCalendar = async () => {
    try {
        const response = await fetch(`/get_login_employee_shifts?currentMonth=${currentMonth}`);

        // レスポンスからシフトデータを取得
        const shifts = await response.json();

        userShifts.clear();
        Object.entries(shifts).forEach(([date, shiftDetails]) => {
            userShifts.set(date, shiftDetails);
        });
        console.log("userShifts", userShifts)

        generateCalendar(calendar, userShifts, selectedDates, removedDates, date);

    } catch (error) {
        console.error("Error:", error);
    }
};


// シフトレジェンドを表示する関数
const renderShiftLegend = () => {
    const shiftLegend = document.getElementById("shift-legend");
    shiftLegend.innerHTML = '';  // 既存の内容をクリア

    // const senjuShiftTypes = getSenjuShiftTypes();
    // console.log(senjuShiftTypes);

    senjuShiftTypes.forEach(([shiftType, { start_time, end_time, shift_id, senjyu_name, shift_name }]) => {
        const legendItem = document.createElement("li");
        legendItem.classList.add("shift-legend-item");

        const colorBox = document.createElement("div");
        colorBox.classList.add("shift-legend-color");
        colorBox.classList.add(`shift${shift_id}`);  // shift_idに基づくクラスを追加
        colorBox.style.border = "1px solid black";  // 黒枠を追加

        const labelText = document.createElement("span");
        if (shiftType === "休") {
            labelText.textContent = "休み";
        } else {
            labelText.textContent = `${shift_name} (${start_time}-${end_time})`;  // シフト名と時間を表示
        }

        legendItem.appendChild(colorBox);
        legendItem.appendChild(labelText);
        shiftLegend.appendChild(legendItem);
    });
};

// プルダウンメニューにシフト名を追加する関数
const pulldownMenuShift = () => {
    const shiftSelect = document.getElementById("shift-select");
    shiftSelect.innerHTML = '';  // プルダウンメニューの既存の内容をクリア

    // const senjuShiftTypes = getSenjuShiftTypes();

    senjuShiftTypes.forEach(([shiftType, { shift_name }]) => {
        const option = document.createElement("option");
        option.value = shiftType;
        option.textContent = shift_name;
        shiftSelect.appendChild(option);
    });
};

document.getElementById("shift-form").addEventListener("submit", async (event) => {
    event.preventDefault();

    const dates = {};
    userShifts.forEach((shiftDetails, date) => {
        dates[date] = {
            shift_id: shiftDetails.shift_id,
            start_time: shiftDetails.start_time,
            end_time: shiftDetails.end_time
        };
    });

    try {
        const response = await fetch("/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ dates: dates })
        });
        const data = await response.json();

        generateCalendar(calendar, userShifts, selectedDates, removedDates, date);
    } catch (error) {
        console.error("Error:", error);
    }
});


// プルダウンメニューの変更イベントをリッスンする
document.getElementById("shift-select").addEventListener("change", () => {
    const selectedShift = document.getElementById("shift-select").value;

    // 選択されたシフトの詳細情報を取得
    const shiftDetails = shiftTypes[selectedShift];
    // console.log(shiftDetails)

    const today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;  // 次の月を取得するために +1
    // console.log("month:", month);

    if (month > 11) {
        month = 0;  // 12月を超えたら1月に戻す
        year += 1;  // 年を+1する
    }
    const daysInMonth = new Date(year, month + 1, 0).getDate();  // 次の月の日数を取得
    // console.log("next month:", month, "daysInMonth:", daysInMonth);

    userShifts.clear();

    for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);

        const correctMonth = date.getMonth() + 1; // 月を1から12に修正
        const dateStr = `${year}-${String(correctMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        // console.log(dateStr)
        // 全ての日付に選択されたシフトの詳細情報を設定
        userShifts.set(dateStr, {
            shift_name: selectedShift,
            start_time: shiftDetails.start_time,
            end_time: shiftDetails.end_time,
            shift_id: shiftDetails.shift_id  // shift_id を追加
        });
    }

    // console.log("userShifts", Array.from(userShifts.entries()));
    console.log("userShifts", userShifts);
    generateCalendar(calendar, userShifts, selectedDates, removedDates, new Date(year, month - 1));

});



document.getElementById('work-hours-display').addEventListener('keydown', function (event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        var newWorkHours = this.textContent.replace(/[^\d]/g, ''); // 数字以外を削除
        var display = this;

        // データベースを更新するためにAJAXリクエストを送信
        fetch('/update_work_hours', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': '{{ csrf_token() }}'  // Flask-WTFのCSRFトークンを使っている場合
            },
            body: JSON.stringify({ work_hours: newWorkHours })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    display.textContent = `◽️${newWorkHours} 時間/日`;
                } else {
                    alert('Failed to update work hours');
                    display.textContent = `◽️{{ work_hours }} 時間/日`; // 元の値に戻す
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update work hours');
                display.textContent = `◽️{{ work_hours }} 時間/日`; // 元の値に戻す
            });

        this.blur(); // 編集を終了
    }
});


// 先月の月を自動的に設定する関数
const setDefaultMonth = () => {
    const shiftMonthInput = document.getElementById('shift-month');
    const today = new Date();
    // 先月の日付を取得
    const Month = new Date(today.getFullYear(), today.getMonth() - 1);
    // 年と月をフォーマット YYYY-MM にして value に設定
    const formattedMonth = Month.toISOString().slice(0, 7);
    shiftMonthInput.value = formattedMonth;
    currentMonth = formattedMonth;  // ここでグローバル変数にも値を保持
};

const init = async () => {
    setDefaultMonth();
    initializeCalendar();
    renderShiftLegend();
    pulldownMenuShift();
};

document.addEventListener("DOMContentLoaded", init);

