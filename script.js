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

    // テーブルの行を取得
    const weekRow1 = document.getElementById('week1');
    const weekRow2 = document.getElementById('week2');

    // 既存の <td> をクリア
    weekRow1.innerHTML = '';
    weekRow2.innerHTML = '';

    // 1週目のカレンダーを生成
    daysOfWeek1.forEach(date => {
        const cell = document.createElement('td');
        cell.textContent = date.date();
        weekRow1.appendChild(cell);
    });

    // 2週目のカレンダーを生成
    daysOfWeek2.forEach(date => {
        const cell = document.createElement('td');
        cell.textContent = date.date();
        weekRow2.appendChild(cell);
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
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
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


