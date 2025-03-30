// ローカルストレージキー
const STORAGE_KEY = {
    DROPDOWN_VALUES: "dropdownValues",
};

// グローバル変数として定義
window.daysOfWeek1 = [];
window.daysOfWeek2 = [];

// グローバルにドロップダウンリストのオプションを定義
const dropdownOptions = ["入学式", "ワールド", "アクティビティ", "外部講師", "休日", "卒業式"];


// カレンダーを生成する関数
function updateCalendar() {
    const weekInput = document.getElementById('week').value;
    if (!weekInput) return;

    const [year, week] = weekInput.split('-W');

    // その週の日曜日を取得
    const firstDayOfWeek = moment(`${year}-01-01`).week(parseInt(week)).startOf('week');

    // 1週目の日曜日から土曜日までの日付を取得
    daysOfWeek1 = [];
    for (let i = 0; i < 7; i++) {
        daysOfWeek1.push(firstDayOfWeek.clone().add(i, 'days'));
    }

    // 2週目（日曜日から土曜日まで）の日付を取得
    const firstDayOfNextWeek = firstDayOfWeek.clone().add(7, 'days');
    daysOfWeek2 = [];
    for (let i = 0; i < 7; i++) {
        daysOfWeek2.push(firstDayOfNextWeek.clone().add(i, 'days'));
    }

    // ドロップダウンの選択肢
    const options = ["入学式", "ワールド", "アクティビティ", "外部講師", "休日", "卒業式"];

    // ドロップダウンメニューを作成する関数
    function createDropdown(cellIndex, rowIndex) {
        const dropdown = document.createElement("select");
        dropdown.className = "customized styled"; // クラスを追加
        options.forEach(option => {
            const opt = document.createElement("option");
            opt.value = option;
            opt.textContent = option;
            dropdown.appendChild(opt);
        });

        // ローカルストレージから選択値を復元
        const savedValues = JSON.parse(localStorage.getItem(STORAGE_KEY.DROPDOWN_VALUES)) || {};
        const cellKey = `${rowIndex}-${cellIndex}`;
        if (savedValues[cellKey]) {
            dropdown.value = savedValues[cellKey];
        }

        // 値が変更されたときにローカルストレージに保存
        dropdown.addEventListener("change", () => {
            const updatedValues = JSON.parse(localStorage.getItem(STORAGE_KEY.DROPDOWN_VALUES)) || {};
            updatedValues[cellKey] = dropdown.value;
            localStorage.setItem(STORAGE_KEY.DROPDOWN_VALUES, JSON.stringify(updatedValues));
            drawCanvas(); // キャンバスを描画
        });

        return dropdown;
    }

    // 1週目と2週目の日付を縦方向に配置
    [...Array(7).keys()].forEach(dayIndex => {
        const dayRow = document.getElementById(`day${dayIndex + 1}`);

        // 既存の <td> をクリア（曜日列は固定なので削除しない）
        while (dayRow.children.length > 1) {
            dayRow.removeChild(dayRow.lastChild);
        }

        // 1週目の日付
        const cell1 = document.createElement('td');
        cell1.textContent = daysOfWeek1[dayIndex].date();
        const dropdown1 = createDropdown(dayIndex, 1); // ドロップダウンを作成
        cell1.appendChild(dropdown1);
        dayRow.appendChild(cell1);

        // 2週目の日付
        const cell2 = document.createElement('td');
        cell2.textContent = daysOfWeek2[dayIndex].date();
        const dropdown2 = createDropdown(dayIndex, 2); // ドロップダウンを作成
        cell2.appendChild(dropdown2);
        dayRow.appendChild(cell2);
    });
    drawCanvas(); // キャンバスを再描画
}

// カレンダーを初期化する関数
function initializeCalendar() {
    // 今日の日付を取得
    let today = moment();

    // 今日が日曜日（0）の場合は+1週する
    if (today.day() === 0) {
        today.add(1, 'week');
    }

    // 現在の年と週番号を取得（ISO-8601基準）
    const year = today.year();
    const weekNumber = today.isoWeek(); // ISO 8601の週番号を取得

    // フォーマット（YYYY-Www）に合わせて週を設定
    const weekValue = `${year}-W${String(weekNumber).padStart(2, '0')}`;

    // inputの値にセット
    document.getElementById('week').value = weekValue;
}

//ここから描画系＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝＝

const canvas = document.getElementById("posterCanvas");
const ctx = canvas.getContext("2d");

// キャンバスサイズ（A4比率に近い）
canvas.width = 2894;
canvas.height = 4093;

// オリジナルの画像データを保存する変数
let originalImage = null;

// 画像を挿入する関数
function insertImage(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            originalImage = img;
            drawCanvas(); // キャンバスを再描画

            // 画像データをローカルストレージに保存
            localStorage.setItem(STORAGE_KEY.IMAGE_DATA, e.target.result);
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// キャンバスを描画する関数

function drawCanvas() {
    console.log(localStorage.getItem(STORAGE_KEY.DROPDOWN_VALUES)); // 修正: 正しいキー名を使用
    console.log(window.daysOfWeek1, window.daysOfWeek2); // ここでデータが入っているか確認！

    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (originalImage) {
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    }

    // 表示する月のタイトルを生成
    let monthTitle = "";
    if (window.daysOfWeek1.length > 0 && window.daysOfWeek2.length > 0) {
        const startMonth = daysOfWeek1[0].month() + 1; // moment.jsは0始まりの月
        const endMonth = daysOfWeek2[6].month() + 1;
        monthTitle = startMonth === endMonth ? `${startMonth}月の予定表` : `${startMonth}~${endMonth}月の予定表`;
    }

    ctx.font = "100px 'Zen Maru Gothic', sans-serif";
    ctx.fillStyle = "#ff66b2";
    ctx.textAlign = "center";
    ctx.fillText(monthTitle, canvas.width / 2, 200); // 月のタイトルを描画

    drawCalendarOnCanvas(); // ここでカレンダー描画
}

function drawCalendarOnCanvas() {
    const startX = 200;  // 左のマージン
    const startY = 300;  // 上のマージン
    const dayColumnWidth = 300; // 曜日列の幅を小さく設定
    const cellWidth = 1100;  // 他のセルの幅
    const cellHeight = 300; // セルの高さ

    const days = ["日", "月", "火", "水", "木", "金", "土"];
    const dropdownValues = JSON.parse(localStorage.getItem(STORAGE_KEY.DROPDOWN_VALUES)) || {}; // ローカルストレージから取得

    // 表示変換マッピング
    const displayMapping = {
        "入学式": "入学式",
        "ワールド": "クラス内交流",
        "アクティビティ": "クラス内交流",
        "外部講師": "外部講師",
        "休日": "お休み",
        "卒業式": "卒業式"
    };

    // サブタイトル変換マッピング
    const subtitleMapping = {
        "入学式": "はじめまして！",
        "ワールド": "ワールド散策",
        "アクティビティ": "アクティビティ",
        "外部講師": "出演：",
        "休日": "寝ろ",
        "卒業式": "おつかれさま！"
    };

    ctx.font = "100px 'Zen Maru Gothic', sans-serif";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";

    // 背景色を描画
    for (let row = 0; row < 7; row++) {
        let y = startY + row * cellHeight;
        if (row === 0) {
            ctx.fillStyle = "#ffccdd"; // 一番上の行を赤
        } else if (row === 6) {
            ctx.fillStyle = "#cccfff"; // 一番下の行を青
        } else {
            ctx.fillStyle = "#fff"; // 他の行は白
        }
        ctx.fillRect(startX, y, dayColumnWidth + cellWidth * 2, cellHeight);
    }

    // 枠線を描画
    ctx.strokeStyle = "#000";
    for (let row = 0; row <= 7; row++) {
        let y = startY + row * cellHeight;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + dayColumnWidth + cellWidth * 2, y); // 横幅を調整
        ctx.stroke();
    }
    for (let col = 0; col <= 3; col++) {
        let x = startX + (col === 0 ? 0 : dayColumnWidth) + (col - 1) * cellWidth; // 曜日列の幅を適用
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + cellHeight * 7);
        ctx.stroke();
    }

    // 曜日を描画
    ctx.fillStyle = "#333";
    for (let i = 0; i < 7; i++) {
        ctx.fillText(days[i], startX + dayColumnWidth / 2, startY + cellHeight * (i + 1) - cellHeight / 2 + 50);
    }

    // 日付とドロップダウン値を描画（updateCalendar のデータを反映）
    if (window.daysOfWeek1 && window.daysOfWeek2) {
        for (let i = 0; i < 7; i++) {
            // 1週目の日付とドロップダウン値
            ctx.fillStyle = "#333"; // メインテキストの色
            ctx.textAlign = "left";
            ctx.font = "bold 150px 'Zen Maru Gothic', sans-serif"; // 大きめのフォントサイズと太字
            ctx.fillText(daysOfWeek1[i].date(), startX + dayColumnWidth + 70, startY + cellHeight * (i + 1) - cellHeight / 2 + 75);

            ctx.font = "100px 'Zen Maru Gothic', sans-serif"; // ドロップダウン値用フォントサイズ
            const dropdownValue1 = displayMapping[dropdownValues[`1-${i}`]] || ""; // 1週目の値を変換
            ctx.fillText(dropdownValue1, startX + dayColumnWidth + 300, startY + cellHeight * (i + 1) - cellHeight / 2 + 20);

            // サブタイトルを描画
            ctx.font = "80px 'Zen Maru Gothic', sans-serif"; // サブタイトル用フォントサイズ
            ctx.fillStyle = "#666"; // サブタイトルの色
            const subtitle1 = subtitleMapping[dropdownValues[`1-${i}`]] || ""; // 1週目のサブタイトルを変換
            ctx.fillText(subtitle1, startX + dayColumnWidth + 300, startY + cellHeight * (i + 1) - cellHeight / 2 + 110);

            // 2週目の日付とドロップダウン値
            ctx.fillStyle = "#333"; // メインテキストの色
            ctx.font = "bold 150px 'Zen Maru Gothic', sans-serif"; // 大きめのフォントサイズと太字
            ctx.fillText(daysOfWeek2[i].date(), startX + dayColumnWidth + cellWidth + 70, startY + cellHeight * (i + 1) - cellHeight / 2 + 75);

            ctx.font = "100px 'Zen Maru Gothic', sans-serif"; // ドロップダウン値用フォントサイズ
            const dropdownValue2 = displayMapping[dropdownValues[`2-${i}`]] || ""; // 2週目の値を変換
            ctx.fillText(dropdownValue2, startX + dayColumnWidth + cellWidth + 300, startY + cellHeight * (i + 1) - cellHeight / 2 + 20);

            // サブタイトルを描画
            ctx.font = "80px 'Zen Maru Gothic', sans-serif"; // サブタイトル用フォントサイズ
            ctx.fillStyle = "#666"; // サブタイトルの色
            const subtitle2 = subtitleMapping[dropdownValues[`2-${i}`]] || ""; // 2週目のサブタイトルを変換
            ctx.fillText(subtitle2, startX + dayColumnWidth + cellWidth + 300, startY + cellHeight * (i + 1) - cellHeight / 2 + 110);
        }
    }
}

// PNGダウンロード
document.getElementById("download-png").addEventListener("click", function () {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "poster.png";
    link.click();
});

document.addEventListener('DOMContentLoaded', function () {
    initializeCalendar();
    updateCalendar();
});