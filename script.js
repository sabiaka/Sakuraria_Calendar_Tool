// カレンダーを生成する関数
function updateCalendar() {
    const weekInput = document.getElementById('week').value;
    if (!weekInput) return;

    const [year, week] = weekInput.split('-W');

    // その週の日曜日を取得
    const firstDayOfWeek = moment(`${year}-01-01`).week(parseInt(week)).startOf('week');

    // 1週目の日曜日から土曜日までの日付を取得
    const daysOfWeek1 = [];
    for (let i = 0; i < 7; i++) {
        daysOfWeek1.push(firstDayOfWeek.clone().add(i, 'days'));
    }

    // 2週目（日曜日から土曜日まで）の日付を取得
    const firstDayOfNextWeek = firstDayOfWeek.clone().add(7, 'days');
    const daysOfWeek2 = [];
    for (let i = 0; i < 7; i++) {
        daysOfWeek2.push(firstDayOfNextWeek.clone().add(i, 'days'));
    }

    // ドロップダウンの選択肢
    const options = ["入学式", "ワールド", "アクティビティ", "外部講師", "休日", "卒業式"];

    // ローカルストレージキー
    const STORAGE_KEY = {
        DROPDOWN_VALUES: "dropdownValues",
        IMAGE_DATA: "imageData"
    };

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

document.addEventListener('DOMContentLoaded', function () {
    initializeCalendar();
    updateCalendar();
    restoreImage(); // 画像を復元
});

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

// ページ読み込み時にローカルストレージから画像を復元
function restoreImage() {
    const savedImageData = localStorage.getItem(STORAGE_KEY.IMAGE_DATA);
    if (savedImageData) {
        const img = new Image();
        img.onload = function () {
            originalImage = img;
            drawCanvas(); // キャンバスを再描画
        };
        img.src = savedImageData;
    }
}

// キャンバスを描画する関数
function drawCanvas() {
    // 背景を白にする
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 画像がある場合、描画
    if (originalImage) {
        ctx.drawImage(originalImage, 0, 0, canvas.width, canvas.height);
    }

    // テキストを描画（仮）
    ctx.font = "100px 'Zen Maru Gothic', sans-serif";
    ctx.fillStyle = "#ff66b2";
    ctx.textAlign = "center";
    ctx.fillText("ポスタープレビュー", canvas.width / 2, 200);
}

// PNGダウンロード
document.getElementById("download-png").addEventListener("click", function () {
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "poster.png";
    link.click();
});

// 初期描画
drawCanvas();


