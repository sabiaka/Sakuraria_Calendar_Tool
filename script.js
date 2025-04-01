// ローカルストレージキー
const STORAGE_KEY = {
    DROPDOWN_VALUES: "dropdownValues",
    TEACHER_NAMES: "teacherNames",
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

    // ドロップダウンメニューを作成する関数
    function createDropdown(cellIndex, rowIndex) {
        const dropdown = document.createElement("select");
        dropdown.className = "customized styled"; // クラスを追加
        dropdownOptions.forEach(option => {
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
            updateExternalTeachers(); // 外部講師入力欄を更新
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
    updateExternalTeachers(); // 外部講師入力欄を更新
}

// 外部講師入力欄を更新する関数
function updateExternalTeachers() {
    const container = document.getElementById("external-teachers-container");
    container.innerHTML = ""; // コンテナをクリア

    const dropdownValues = JSON.parse(localStorage.getItem(STORAGE_KEY.DROPDOWN_VALUES)) || {};
    const externalTeacherCells = Object.entries(dropdownValues)
        .filter(([_, value]) => value === "外部講師") // "外部講師" のセルを抽出
        .map(([key]) => key); // セルキーを取得

    externalTeacherCells.forEach((cellKey, index) => {
        const label = document.createElement("label");
        label.setAttribute("for", `external-teacher${index + 1}`);
        label.textContent = `外部講師${index + 1}`;
        container.appendChild(label);

        const input = document.createElement("input");
        input.type = "text";
        input.id = `external-teacher${index + 1}`;
        input.placeholder = "講師名を入力";
        input.className = "external-teacher-input";

        // 入力イベントでキャンバスを再描画し、値をローカルストレージに保存
        input.addEventListener("input", () => {
            const teacherData = JSON.parse(localStorage.getItem(STORAGE_KEY.TEACHER_NAMES)) || {};
            teacherData[cellKey] = input.value; // セルキーに対応する講師名を保存
            localStorage.setItem(STORAGE_KEY.TEACHER_NAMES, JSON.stringify(teacherData));
            drawCanvas();
        });

        // ローカルストレージから値を復元
        const teacherData = JSON.parse(localStorage.getItem(STORAGE_KEY.TEACHER_NAMES)) || {};
        if (teacherData[cellKey]) {
            input.value = teacherData[cellKey];
        }

        container.appendChild(input);
    });
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
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// ページ読み込み時に画像をセットする関数
function setDefaultImage() {
    // デフォルトの画像パスを指定
    const defaultImagePath = "images/電脳楽舎-サクラリア (1).png"; // ここに画像のファイルパスを指定
    const img = new Image();
    img.onload = function () {
        originalImage = img;
        drawCanvas(); // キャンバスを再描画
    };
    img.src = defaultImagePath;
}

// キャンバスを描画する関数

function drawCanvas() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (originalImage) {
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    }

    // 表示する年を生成
    const weekInput = document.getElementById('week').value;
    const year = weekInput ? weekInput.split('-W')[0] : "";

    ctx.font = "bold 330px 'Zen Maru Gothic', sans-serif"; // 太字に変更
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "left";

    // 年を描画
    ctx.fillText(year + "", 1900, 1070);

    // 表示する月のタイトルを生成
    let monthTitle = "";
    if (window.daysOfWeek1.length > 0 && window.daysOfWeek2.length > 0) {
        const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
        const startMonth = monthNames[daysOfWeek1[0].month()]; // moment.jsは0始まりの月
        const endMonth = monthNames[daysOfWeek2[6].month()];
        monthTitle = startMonth === endMonth ? `${startMonth}` : `${startMonth},${endMonth} `;
    }

    ctx.font = "bold 200px 'Zen Maru Gothic', sans-serif"; // 太字に変更
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";

    ctx.fillText(monthTitle, 1900, 760);

    drawCalendarOnCanvas(canvas.height - 2500); // タイトルの下にテーブルを描画
}

function drawCalendarOnCanvas(startY) {
    const startX = 200;  // 左のマージン
    const dayColumnWidth = 300; // 曜日列の幅を小さく設定
    const cellWidth = 1100;  // 他のセルの幅
    const cellHeight = 300; // セルの高さ

    const days = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
    const dropdownValues = JSON.parse(localStorage.getItem(STORAGE_KEY.DROPDOWN_VALUES)) || {}; // ローカルストレージから取得
    const teacherData = JSON.parse(localStorage.getItem(STORAGE_KEY.TEACHER_NAMES)) || {}; // 外部講師名を取得

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

    // ストライプ背景を描画
    for (let i = 0; i < 7; i++) {
        ctx.fillStyle = i % 2 === 0 ? "hsla(174, 100.00%, 92.40%, 0.73)" : "rgba(255, 255, 255, 0.73)"; // ストライプの色を交互に設定
        ctx.fillRect(startX + dayColumnWidth, startY + i * cellHeight, cellWidth * 2, cellHeight); // 曜日列を除く部分を描画
    }

    // 一番左の行の背景色を設定
    for (let i = 0; i < 7; i++) {
        ctx.fillStyle = "#dfe642"; // 一番左の行の背景色を設定
        ctx.fillRect(startX, startY + i * cellHeight, dayColumnWidth, cellHeight);
    }

    // 曜日を描画
    ctx.font = "bold 100px 'Zen Maru Gothic', sans-serif"; // フォントサイズを大きく
    ctx.fillStyle = "#323232"; // 曜日を黒に設定
    ctx.textAlign = "center";
    for (let i = 0; i < 7; i++) {
        ctx.fillText(days[i], startX + dayColumnWidth / 2, startY + cellHeight * (i + 1) - cellHeight / 2 + 40);
    }

    // 日付とドロップダウン値を描画
    if (window.daysOfWeek1 && window.daysOfWeek2) {
        for (let i = 0; i < 7; i++) {
            // 1週目の日付とドロップダウン値
            ctx.fillStyle = "#323232"; // メインテキストを黒に設定
            ctx.textAlign = "left";
            ctx.font = "bold 150px 'Zen Maru Gothic', sans-serif";
            ctx.fillText(daysOfWeek1[i].date(), startX + dayColumnWidth + 50, startY + cellHeight * (i + 1) - cellHeight / 2 + 60);

            ctx.font = "100px 'Zen Maru Gothic', sans-serif";
            const dropdownValue1 = displayMapping[dropdownValues[`1-${i}`]] || "";
            ctx.fillText(dropdownValue1, startX + dayColumnWidth + 250, startY + cellHeight * (i + 1) - cellHeight / 2 + 20);

            // サブタイトルを描画
            ctx.font = "80px 'Zen Maru Gothic', sans-serif";
            ctx.fillStyle = "#666"; // サブタイトルを淡い色に変更
            let subtitle1 = subtitleMapping[dropdownValues[`1-${i}`]] || "";
            if (dropdownValues[`1-${i}`] === "外部講師") {
                subtitle1 += teacherData[`1-${i}`] || "";
            }
            ctx.fillText(subtitle1, startX + dayColumnWidth + 250, startY + cellHeight * (i + 1) - cellHeight / 2 + 100);

            // 2週目の日付とドロップダウン値
            ctx.fillStyle = "#323232";
            ctx.font = "bold 150px 'Zen Maru Gothic', sans-serif";
            ctx.fillText(daysOfWeek2[i].date(), startX + dayColumnWidth + cellWidth + 50, startY + cellHeight * (i + 1) - cellHeight / 2 + 60);

            ctx.font = "100px 'Zen Maru Gothic', sans-serif";
            const dropdownValue2 = displayMapping[dropdownValues[`2-${i}`]] || "";
            ctx.fillText(dropdownValue2, startX + dayColumnWidth + cellWidth + 250, startY + cellHeight * (i + 1) - cellHeight / 2 + 20);

            // サブタイトルを描画
            ctx.font = "80px 'Zen Maru Gothic', sans-serif";
            ctx.fillStyle = "#666";
            let subtitle2 = subtitleMapping[dropdownValues[`2-${i}`]] || "";
            if (dropdownValues[`2-${i}`] === "外部講師") {
                subtitle2 += teacherData[`2-${i}`] || "";
            }
            ctx.fillText(subtitle2, startX + dayColumnWidth + cellWidth + 250, startY + cellHeight * (i + 1) - cellHeight / 2 + 100);
        }
    }
}

// PNGダウンロード
document.getElementById("download-png").addEventListener("click", function () {
    const dropdownValues = JSON.parse(localStorage.getItem(STORAGE_KEY.DROPDOWN_VALUES)) || {};
    const teacherData = JSON.parse(localStorage.getItem(STORAGE_KEY.TEACHER_NAMES)) || {};

    // 外部講師セルを取得
    const externalTeacherCells = Object.entries(dropdownValues)
        .filter(([_, value]) => value === "外部講師")
        .map(([key]) => key);

    // 入力が不足しているか確認
    const missingTeachers = externalTeacherCells.some(cellKey => !teacherData[cellKey] || teacherData[cellKey].trim() === "");

    if (missingTeachers) {
        alert("外部講師がすべて入力されていないよ！");
        return;
    }

    // PNG出力処理
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "poster.png";
    link.click();
});

document.addEventListener('DOMContentLoaded', function () {
    initializeCalendar();
    setDefaultImage(); // デフォルト画像をセット
    document.fonts.ready.then(() => {
        updateCalendar(); // フォントが読み込まれてからカレンダーを更新
    });
});

window.addEventListener('pageshow', function () {
    document.fonts.ready.then(() => {
        updateCalendar(); // ブラウザバック時にもフォントが読み込まれてからカレンダーを更新
    });
});