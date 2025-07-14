document.addEventListener('DOMContentLoaded', () => {

    // --- 遊戲設定 ---
    const TOTAL_TIME = 600; // 10分鐘 = 600秒
    const WIRE_COLORS = ['red', 'blue', 'yellow', 'green', 'purple', 'black'];
    
    // --- 元素獲取 ---
    const timerDisplay = document.getElementById('timer-display');
    const wires = document.querySelectorAll('.wire');
    const gameOverOverlay = document.getElementById('game-over-overlay');
    const gameWinOverlay = document.getElementById('game-win-overlay');
    const resetButtons = document.querySelectorAll('.reset-button');
    const gameContainer = document.querySelector('.game-container');

    // --- 音效獲取 ---
    // 如何更新音效:
    // 如果您想更換音效，最簡單的方法就是將新的音效檔
    // 命名為 explosion.mp3, cut.mp3 等，然後替換掉 audio 資料夾中的舊檔案。
    const sounds = {
        explosion: document.getElementById('sound-explosion'),
        defuse: document.getElementById('sound-defuse'),
        cut: document.getElementById('sound-cut'),
        tick: document.getElementById('sound-tick')
    };
    
    // --- 遊戲狀態變數 ---
    let timeLeft = TOTAL_TIME;
    let timerInterval = null;
    let gameActive = false;
    let defuseWireColor = '';

    // --- 功能函式 ---

    function playSound(soundName) {
        const sound = sounds[soundName];
        if (sound) {
            sound.currentTime = 0; // 重置音效，以便連續觸發
            sound.play();
        }
    }

    function stopSound(soundName) {
        const sound = sounds[soundName];
        if (sound) {
            sound.pause();
            sound.currentTime = 0;
        }
    }

    function formatTime(seconds) {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
    }

    function updateTimer() {
        timeLeft--;
        timerDisplay.textContent = formatTime(timeLeft);
        if (timeLeft <= 0) {
            endGame(false); // 時間到，爆炸
        }
    }

    function cutWire(event) {
        if (!gameActive) return;

        const wire = event.target;
        if (wire.classList.contains('cut')) return;
        
        playSound('cut');
        wire.classList.add('cut');

        // 延遲一點判斷結果，讓剪線動畫更流暢
        setTimeout(() => {
            const wireColor = wire.dataset.color;
            if (wireColor === defuseWireColor) {
                endGame(true); // 剪對了，拆除成功
            } else {
                endGame(false); // 剪錯了，爆炸
            }
        }, 200);
    }

    function endGame(isWin) {
        if (!gameActive) return;
        gameActive = false;
        clearInterval(timerInterval);
        stopSound('tick');

        if (isWin) {
            playSound('defuse');
            timerDisplay.style.color = '#0f0'; // 計時器變綠色
            gameWinOverlay.style.display = 'flex';
        } else {
            playSound('explosion');
            gameContainer.classList.add('shake');
            timerDisplay.textContent = '00:00';
            // 延遲顯示爆炸畫面
            setTimeout(() => {
                gameOverOverlay.style.display = 'flex';
            }, 300);
        }
    }

    function initGame() {
        // 重置狀態
        gameActive = true;
        timeLeft = TOTAL_TIME;
        
        // 重置介面
        gameOverOverlay.style.display = 'none';
        gameWinOverlay.style.display = 'none';
        gameContainer.classList.remove('shake');
        timerDisplay.style.color = '#ff1a1a';
        
        // /***** 如何更改觸發線 *****/
        // --------------------------------------------------------------------
        // 方法一：隨機選擇一條線作為觸發線 (目前使用的方法)
        defuseWireColor = WIRE_COLORS[Math.floor(Math.random() * WIRE_COLORS.length)];
        
        // 方法二：手動指定觸發線顏色。
        // 若要手動指定，請註解掉上面那行，並取消註解下面這行。
        // 將 'blue' 改成您想要的顏色 (必須是 WIRE_COLORS 陣列中的一種)。
        // defuseWireColor = 'blue'; 
        // --------------------------------------------------------------------
        
        console.log(`提示：本局的正確拆除線是【${defuseWireColor}】`);

        // 洗牌並分配顏色
        const shuffledColors = [...WIRE_COLORS].sort(() => 0.5 - Math.random());
        wires.forEach((wire, index) => {
            // 重置外觀和事件
            wire.classList.remove('cut');
            WIRE_COLORS.forEach(color => wire.classList.remove(`color-${color}`));
            
            const newColor = shuffledColors[index];
            wire.classList.add(`color-${newColor}`);
            wire.dataset.color = newColor;
            
            wire.removeEventListener('click', cutWire);
            wire.addEventListener('click', cutWire);
        });

        // 啟動計時器
        timerDisplay.textContent = formatTime(timeLeft);
        clearInterval(timerInterval); // 清除舊的計時器
        timerInterval = setInterval(updateTimer, 1000);
        playSound('tick');
    }

    // 綁定重置按鈕事件
    resetButtons.forEach(button => button.addEventListener('click', initGame));

    // 遊戲開始
    initGame();
});