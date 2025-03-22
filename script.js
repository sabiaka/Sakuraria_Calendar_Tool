
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

// ダウンロードボタンのクリックイベント
document.getElementById('download-png').addEventListener('click', function () {
    const poster = document.querySelector('.poster'); // ポスターの要素を取得

    // ポスターのサイズを取得
    let width = 2894;
    let height = 4093;

    // ウィンドウのサイズを取得
    const screenWidth = window.innerWidth;  // 横幅
    const screenHeight = window.innerHeight; // 縦幅

    let offsetY = 0; // オフセット高さ

    if (screenWidth < 1260) {
        offsetY = 8;
    }

    // ポスター要素の現在のサイズ（横幅と高さ）を取得
    const posterWidth = poster.offsetWidth;
    const posterHeight = poster.offsetHeight;

    // スケール倍率を計算（ポスターサイズを出力サイズに合わせるため）
    const scaleX = width / posterWidth;
    const scaleY = height / posterHeight;
    const scale = Math.min(scaleX, scaleY); // 横と縦で小さい方の倍率を選択

    width = poster.offsetWidth * (scale * 0.984); // 幅をスケールに合わせて再計算
    height = poster.offsetHeight * (scale * 0.988); // 高さをスケールに合わせて再計算

    // ポスターをスケール調整
    poster.style.transform = `scale(${scale})`;
    poster.style.transformOrigin = 'top left';

    // 枠線、ボーダー、シャドウ、丸みを消す
    poster.style.border = 'none';         // 枠線を消す
    poster.style.borderRadius = '0';      // 角丸を消す
    poster.style.boxShadow = 'none';      // シャドウを消す
    poster.style.background = '#00FF00';     // テスト背景色

    // html2canvasでキャプチャ
    html2canvas(poster, {
        scale: 1, // キャプチャ自体はそのまま
        logging: true,
        width: width, // 指定サイズ
        height: height, // 指定サイズ
        x: 0,          // キャプチャの開始位置（左上）
        y: offsetY           // キャプチャの開始位置（上端）
    }).then(function (canvas) {
        // CanvasをPNGデータURLに変換
        const image = canvas.toDataURL('image/png'); // PNGデータURLに変換

        // ダウンロードリンクを作成
        const link = document.createElement('a');
        link.href = image;
        link.download = 'poster.png'; // 出力するファイル名
        link.click(); // クリックしてダウンロード
    });

    // スケーリングを元に戻す
    poster.style.transform = 'scale(1)';

    // 枠線、ボーダー、シャドウ、丸みを元に戻す（必要な場合）
    poster.style.border = '5px solid #ff66b2'; // 元の枠線を戻す
    poster.style.borderRadius = '20px';        // 元の角丸を戻す
    poster.style.boxShadow = '0px 0px 15px rgba(255, 105, 180, 0.6)'; // 元のシャドウを戻す
    poster.style.background = '#FFFFFF';     // テスト背景色を戻す

});

document.addEventListener('DOMContentLoaded', function () {
    initializeCalendar();
    updateCalendar();
});

