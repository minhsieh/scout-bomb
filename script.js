document.addEventListener('DOMContentLoaded', () => {
    // 獲取DOM元素
    const startScreen = document.getElementById('start-screen');
    const settingsScreen = document.getElementById('settings-screen');
    const gameScreen = document.getElementById('game-screen');
    const manualScreen = document.getElementById('manual-screen');
    const resultScreen = document.getElementById('result-screen');
    
    const startGameBtn = document.getElementById('start-game');
    const showSettingsBtn = document.getElementById('show-settings');
    const showManualBtn = document.getElementById('show-manual');
    const startWithSettingsBtn = document.getElementById('start-with-settings');
    const backToMainBtn = document.getElementById('back-to-main');
    const backToStartBtn = document.getElementById('back-to-start');
    const backFromManualBtn = document.getElementById('back-from-manual');
    const playAgainBtn = document.getElementById('play-again');
    
    const wireModulesSelect = document.getElementById('wire-modules');
    const buttonModulesSelect = document.getElementById('button-modules');
    const keyboardModulesSelect = document.getElementById('keyboard-modules');
    const gameTimeSelect = document.getElementById('game-time');
    const maxFailuresSelect = document.getElementById('max-failures');
    
    const timerDisplay = document.getElementById('timer');
    const serialNumberDisplay = document.getElementById('serial-number');
    const failureCounterDisplay = document.getElementById('failure-counter');
    const wiresContainer = document.getElementById('wires');
    const cutWireBtn = document.getElementById('cut-wire');
    const bigButton = document.getElementById('big-button');
    const holdInstructions = document.getElementById('hold-instructions');
    const indicatorLight = document.getElementById('indicator-light');
    
    const resultTitle = document.getElementById('result-title');
    const resultMessage = document.getElementById('result-message');
    
    // 創建通知元素
    const notificationDiv = document.createElement('div');
    notificationDiv.className = 'notification';
    document.body.appendChild(notificationDiv);
    
    // 遊戲狀態
    let gameState = {
        timer: 180, // 預設3分鐘
        timerInterval: null,
        serialNumber: '',
        wireModulesCount: 1, // 預設1個線路模組
        buttonModulesCount: 1, // 預設1個按鈕模組
        keyboardModulesCount: 0, // 預設0個謎之鍵盤模組
        maxFailures: 3, // 預設最多可以失敗3次
        currentFailures: 0, // 目前失敗次數
        modules: {
            wires: [],
            buttons: [],
            keyboards: []
        },
        solvedModules: 0,
        totalModules: 2 // 預設總共2個模組
    };
    
    // 符號列表
    const symbolColumns = [
        ['Ф', 'Λ', 'λ', 'ɹ', 'ɯ', 'ʒ', 'ǝ'],
        ['Ə', 'Ф', 'ǝ', 'ω', '☆', 'ʒ', 'ɾ'],
        ['©', 'ω', 'Ω', 'Ж', 'Ʒ', 'λ', '☆'],
        ['б', 'ɥ', 'Ъ', 'ɯ', 'Ж', 'ɾ', 'ψ'],
        ['♦', 'ψ', 'Ъ', 'Є', 'ɥ', 'Ʒ', '★'],
        ['б', 'Ə', '#', 'æ', '♦', 'Й', 'Ω']
    ];
    
    // 從localStorage加載設置
    function loadSettings() {
        const savedSettings = localStorage.getItem('bombGameSettings');
        if (savedSettings) {
            const settings = JSON.parse(savedSettings);
            wireModulesSelect.value = settings.wireModules;
            buttonModulesSelect.value = settings.buttonModules;
            if (settings.keyboardModules) {
                keyboardModulesSelect.value = settings.keyboardModules;
            }
            gameTimeSelect.value = settings.gameTime;
            if (settings.maxFailures) {
                maxFailuresSelect.value = settings.maxFailures;
            }
            
            gameState.wireModulesCount = parseInt(settings.wireModules);
            gameState.buttonModulesCount = parseInt(settings.buttonModules);
            gameState.keyboardModulesCount = parseInt(settings.keyboardModules || 0);
            gameState.timer = parseInt(settings.gameTime) * 60;
            gameState.maxFailures = parseInt(settings.maxFailures || 3);
            gameState.totalModules = gameState.wireModulesCount + gameState.buttonModulesCount + gameState.keyboardModulesCount;
        }
    }
    
    // 保存設置到localStorage
    function saveSettings() {
        const settings = {
            wireModules: wireModulesSelect.value,
            buttonModules: buttonModulesSelect.value,
            keyboardModules: keyboardModulesSelect.value,
            gameTime: gameTimeSelect.value,
            maxFailures: maxFailuresSelect.value
        };
        localStorage.setItem('bombGameSettings', JSON.stringify(settings));
    }
    
    // 顯示通知
    function showNotification(message, type = 'success', duration = 3000) {
        // 清除之前的通知計時器
        if (window.notificationTimer) {
            clearTimeout(window.notificationTimer);
        }
        
        // 設置通知內容和樣式
        notificationDiv.textContent = message;
        notificationDiv.className = 'notification ' + type;
        
        // 顯示通知（使用 requestAnimationFrame 確保 DOM 更新）
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                notificationDiv.classList.add('show');
            });
        });
        
        // 設定自動隱藏
        window.notificationTimer = setTimeout(() => {
            notificationDiv.classList.remove('show');
            
            // 完全移除通知內容
            setTimeout(() => {
                notificationDiv.textContent = '';
                notificationDiv.className = 'notification';
            }, 400); // 等待淡出動畫完成
        }, duration);
    }
    
    // 初始化事件監聽器
    function initEventListeners() {
        startGameBtn.addEventListener('click', () => {
            // 檢查是否有已保存的設置
            const savedSettings = localStorage.getItem('bombGameSettings');
            if (savedSettings) {
                // 直接開始遊戲
                loadSettings();
                startGame();
            } else {
                // 首次遊戲，顯示設置畫面
                startScreen.classList.add('hidden');
                settingsScreen.classList.remove('hidden');
            }
        });
        
        showSettingsBtn.addEventListener('click', () => {
            startScreen.classList.add('hidden');
            settingsScreen.classList.remove('hidden');
        });
        
        showManualBtn.addEventListener('click', showManual);
        
        startWithSettingsBtn.addEventListener('click', () => {
            saveSettings();
            showNotification('設定已儲存成功！');
        });
        
        backToMainBtn.addEventListener('click', () => {
            settingsScreen.classList.add('hidden');
            startScreen.classList.remove('hidden');
        });
        
        backToStartBtn.addEventListener('click', backToStart);
        backFromManualBtn.addEventListener('click', backToStart);
        playAgainBtn.addEventListener('click', backToStart);
        
        cutWireBtn.addEventListener('click', cutSelectedWire);
        
        // 移除全局按鈕事件監聽器，因為每個按鈕模組都有自己的事件監聽器
        // bigButton.addEventListener('mousedown', holdButton);
        // bigButton.addEventListener('mouseup', releaseButton);
        // bigButton.addEventListener('mouseleave', releaseButton);
        
        // // 觸控設備支援
        // bigButton.addEventListener('touchstart', (e) => {
        //     e.preventDefault();
        //     holdButton();
        // });
        // bigButton.addEventListener('touchend', (e) => {
        //     e.preventDefault();
        //     releaseButton();
        // });
        
        // 設置變更時保存
        wireModulesSelect.addEventListener('change', saveSettings);
        buttonModulesSelect.addEventListener('change', saveSettings);
        keyboardModulesSelect.addEventListener('change', saveSettings);
        gameTimeSelect.addEventListener('change', saveSettings);
        maxFailuresSelect.addEventListener('change', saveSettings);
    }
    
    // 顯示手冊
    function showManual() {
        startScreen.classList.add('hidden');
        manualScreen.classList.remove('hidden');
    }
    
    // 返回主畫面
    function backToStart() {
        stopTimer();
        startScreen.classList.remove('hidden');
        settingsScreen.classList.add('hidden');
        gameScreen.classList.add('hidden');
        manualScreen.classList.add('hidden');
        resultScreen.classList.add('hidden');
    }
    
    // 開始遊戲
    function startGame() {
        // 確保主畫面和設置畫面都被隱藏
        startScreen.classList.add('hidden');
        settingsScreen.classList.add('hidden');
        gameScreen.classList.remove('hidden');
        
        // 如果是從設置畫面開始，獲取最新設置
        if (!settingsScreen.classList.contains('hidden')) {
            gameState.wireModulesCount = parseInt(wireModulesSelect.value);
            gameState.buttonModulesCount = parseInt(buttonModulesSelect.value);
            gameState.keyboardModulesCount = parseInt(keyboardModulesSelect.value);
            gameState.timer = parseInt(gameTimeSelect.value) * 60;
            gameState.maxFailures = parseInt(maxFailuresSelect.value);
            gameState.totalModules = gameState.wireModulesCount + gameState.buttonModulesCount + gameState.keyboardModulesCount;
        }
        
        // 檢查是否至少有一個模組
        if (gameState.totalModules === 0) {
            alert('請至少選擇一個模組！');
            settingsScreen.classList.remove('hidden');
            gameScreen.classList.add('hidden');
            return;
        }
        
        // 重置遊戲狀態
        resetGameState();
        
        // 生成序列號
        generateSerialNumber();
        
        // 生成模組
        generateModules();
        
        // 開始計時器
        startTimer();
    }
    
    // 重置遊戲狀態
    function resetGameState() {
        gameState.serialNumber = '';
        gameState.modules = {
            wires: [],
            buttons: [],
            keyboards: []
        };
        gameState.solvedModules = 0;
        gameState.currentFailures = 0;
        
        // 更新失敗次數顯示
        updateFailureDisplay();
        
        // 停止計時器（如果正在運行）
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
        
        // 重置計時器
        gameState.timer = parseInt(gameTimeSelect.value) * 60;
        updateTimerDisplay();
        
        // 清空模組容器
        const bombContainer = document.querySelector('.bomb-container');
        bombContainer.innerHTML = '';
        
        // 重新添加模組容器
        for (let i = 0; i < gameState.wireModulesCount; i++) {
            const wireModule = document.createElement('div');
            wireModule.className = 'module';
            wireModule.id = `wires-module-${i}`;
            wireModule.innerHTML = `
                <h3>線路模組 #${i+1}</h3>
                <div class="wires-container" id="wires-${i}"></div>
                <button class="cut-button" id="cut-wire-${i}">剪斷線路</button>
            `;
            bombContainer.appendChild(wireModule);
        }
        
        for (let i = 0; i < gameState.buttonModulesCount; i++) {
            const buttonModule = document.createElement('div');
            buttonModule.className = 'module';
            buttonModule.id = `button-module-${i}`;
            buttonModule.innerHTML = `
                <h3>按鈕模組 #${i+1}</h3>
                <div class="big-button-container">
                    <button id="big-button-${i}" class="big-button">按我</button>
                    <div id="indicator-light-${i}" class="indicator-light hidden"></div>
                </div>
            `;
            bombContainer.appendChild(buttonModule);
        }
        
        for (let i = 0; i < gameState.keyboardModulesCount; i++) {
            const keyboardModule = document.createElement('div');
            keyboardModule.className = 'module keyboard-module';
            keyboardModule.id = `keyboard-module-${i}`;
            keyboardModule.innerHTML = `
                <h3>謎之鍵盤模組 #${i+1}</h3>
                <div class="keyboard-grid" id="keyboard-grid-${i}">
                    <div class="keyboard-button" data-position="0"></div>
                    <div class="keyboard-button" data-position="1"></div>
                    <div class="keyboard-button" data-position="2"></div>
                    <div class="keyboard-button" data-position="3"></div>
                </div>
            `;
            bombContainer.appendChild(keyboardModule);
        }
    }
    
    // 生成序列號
    function generateSerialNumber() {
        const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZ'; // 排除容易混淆的I和O
        const numbers = '0123456789';
        let serial = '';
        
        // 生成格式為: 2字母 + 1數字 + 1字母 + 2數字
        serial += letters[Math.floor(Math.random() * letters.length)];
        serial += letters[Math.floor(Math.random() * letters.length)];
        serial += numbers[Math.floor(Math.random() * numbers.length)];
        serial += letters[Math.floor(Math.random() * letters.length)];
        serial += numbers[Math.floor(Math.random() * numbers.length)];
        serial += numbers[Math.floor(Math.random() * numbers.length)];
        
        gameState.serialNumber = serial;
        serialNumberDisplay.textContent = serial;
    }
    
    // 生成模組
    function generateModules() {
        // 生成線路模組
        for (let i = 0; i < gameState.wireModulesCount; i++) {
            generateWireModule(i);
        }
        
        // 生成按鈕模組
        for (let i = 0; i < gameState.buttonModulesCount; i++) {
            generateButtonModule(i);
        }
        
        // 生成謎之鍵盤模組
        for (let i = 0; i < gameState.keyboardModulesCount; i++) {
            generateKeyboardModule(i);
        }
    }
    
    // 生成線路模組
    function generateWireModule(moduleIndex) {
        // 清空容器
        const wiresContainer = document.getElementById(`wires-${moduleIndex}`);
        const cutWireBtn = document.getElementById(`cut-wire-${moduleIndex}`);
        
        // 決定線路數量 (3-6)
        const wireCount = Math.floor(Math.random() * 4) + 3;
        
        // 可能的線路顏色
        const wireColors = ['red', 'blue', 'yellow', 'black', 'white'];
        const colorNames = {
            'red': '紅色',
            'blue': '藍色',
            'yellow': '黃色',
            'black': '黑色',
            'white': '白色'
        };
        
        // 創建模組狀態
        const moduleState = {
            index: moduleIndex,
            solved: false,
            wires: [],
            correctWire: null,
            selectedWire: null
        };
        
        // 生成線路
        for (let i = 0; i < wireCount; i++) {
            const color = wireColors[Math.floor(Math.random() * wireColors.length)];
            const wire = document.createElement('div');
            wire.className = `wire ${color}`;
            wire.dataset.index = i;
            wire.dataset.color = color;
            wire.dataset.moduleIndex = moduleIndex;
            
            // 點擊線路選擇它
            wire.addEventListener('click', () => {
                if (!moduleState.solved) {
                    // 移除之前的選擇
                    document.querySelectorAll(`#wires-${moduleIndex} .wire`).forEach(w => {
                        w.style.border = '';
                    });
                    
                    // 標記新選擇
                    wire.style.border = '2px solid #27ae60';
                    moduleState.selectedWire = i;
                }
            });
            
            wiresContainer.appendChild(wire);
            
            // 添加到模組狀態
            moduleState.wires.push({
                index: i,
                color: color,
                colorName: colorNames[color]
            });
        }
        
        // 決定正確的線路
        determineCorrectWire(moduleState);
        
        // 添加剪線按鈕事件
        cutWireBtn.addEventListener('click', () => {
            cutWire(moduleState);
        });
        
        // 添加到遊戲狀態
        gameState.modules.wires.push(moduleState);
    }
    
    // 決定正確的線路
    function determineCorrectWire(moduleState) {
        const wires = moduleState.wires;
        const wireCount = wires.length;
        const serialLastDigit = parseInt(gameState.serialNumber.charAt(5));
        const isSerialOdd = serialLastDigit % 2 === 1;
        
        let correctWireIndex = 0;
        
        // 根據線路數量應用不同規則
        if (wireCount === 3) {
            // 3條線路規則
            const hasRed = wires.some(w => w.color === 'red');
            const lastWireWhite = wires[2].color === 'white';
            const blueWires = wires.filter(w => w.color === 'blue');
            
            if (!hasRed) {
                correctWireIndex = 1; // 第二條線
            } else if (lastWireWhite) {
                correctWireIndex = 2; // 最後一條線
            } else if (blueWires.length > 1) {
                correctWireIndex = wires.findIndex((w, i) => w.color === 'blue' && i > wires.findIndex(wire => wire.color === 'blue'));
            } else {
                correctWireIndex = 2; // 最後一條線
            }
        } else if (wireCount === 4) {
            // 4條線路規則
            const redWires = wires.filter(w => w.color === 'red');
            const lastWireYellow = wires[3].color === 'yellow';
            const blueWires = wires.filter(w => w.color === 'blue');
            const yellowWires = wires.filter(w => w.color === 'yellow');
            
            if (redWires.length > 1 && isSerialOdd) {
                correctWireIndex = wires.findIndex((w, i) => w.color === 'red' && i > wires.findIndex(wire => wire.color === 'red'));
            } else if (redWires.length === 0 && lastWireYellow) {
                correctWireIndex = 0; // 第一條線
            } else if (blueWires.length === 1) {
                correctWireIndex = 0; // 第一條線
            } else if (yellowWires.length > 1) {
                correctWireIndex = 3; // 最後一條線
            } else {
                correctWireIndex = 1; // 第二條線
            }
        } else if (wireCount === 5) {
            // 5條線路規則
            const lastWireBlack = wires[4].color === 'black';
            const redWires = wires.filter(w => w.color === 'red');
            const yellowWires = wires.filter(w => w.color === 'yellow');
            const blackWires = wires.filter(w => w.color === 'black');
            
            if (lastWireBlack && isSerialOdd) {
                correctWireIndex = 3; // 第四條線
            } else if (redWires.length === 1 && yellowWires.length > 1) {
                correctWireIndex = 0; // 第一條線
            } else if (blackWires.length === 0) {
                correctWireIndex = 1; // 第二條線
            } else {
                correctWireIndex = 0; // 第一條線
            }
        } else if (wireCount === 6) {
            // 6條線路規則
            const yellowWires = wires.filter(w => w.color === 'yellow');
            const whiteWires = wires.filter(w => w.color === 'white');
            const redWires = wires.filter(w => w.color === 'red');
            
            if (yellowWires.length === 0 && isSerialOdd) {
                correctWireIndex = 2; // 第三條線
            } else if (yellowWires.length === 1 && whiteWires.length > 1) {
                correctWireIndex = 3; // 第四條線
            } else if (redWires.length === 0) {
                correctWireIndex = 5; // 最後一條線
            } else {
                correctWireIndex = 3; // 第四條線
            }
        }
        
        moduleState.correctWire = correctWireIndex;
    }
    
    // 剪斷線路
    function cutWire(moduleState) {
        const selectedWire = moduleState.selectedWire;
        
        if (selectedWire === null) {
            alert('請先選擇一條線路！');
            return;
        }
        
        if (moduleState.solved) {
            return; // 模組已解決
        }
        
        const wireElement = document.querySelector(`#wires-${moduleState.index} .wire[data-index="${selectedWire}"]`);
        
        // 視覺效果 - 剪斷線路
        wireElement.classList.add('cut');
        
        // 檢查是否正確
        if (selectedWire === moduleState.correctWire) {
            moduleState.solved = true;
            gameState.solvedModules++;
            
            // 添加視覺反饋
            const wireModule = document.getElementById(`wires-module-${moduleState.index}`);
            const cutWireBtn = document.getElementById(`cut-wire-${moduleState.index}`);
            
            wireModule.classList.add('module-solved');
            cutWireBtn.classList.add('button-solved');
            cutWireBtn.disabled = true;
            
            checkGameCompletion();
        } else {
            // 錯誤 - 處理失敗
            if (handleFailure('剪錯線路！')) {
                return; // 如果炸彈爆炸，直接返回
            }
        }
    }
    
    // 處理失敗
    function handleFailure(message) {
        gameState.currentFailures++;
        updateFailureDisplay();
        
        // 視覺反饋 - 讓失敗計數器閃爍
        failureCounterDisplay.parentElement.classList.add('failure-flash');
        setTimeout(() => {
            failureCounterDisplay.parentElement.classList.remove('failure-flash');
        }, 1000);
        
        // 檢查是否達到最大失敗次數
        if (gameState.currentFailures >= gameState.maxFailures) {
            endGame(false, message || '失敗次數過多，炸彈爆炸！');
            return true;
        }
        
        // 未達到最大失敗次數，顯示警告
        showNotification(`${message || '操作錯誤！'} (失誤: ${gameState.currentFailures}/${gameState.maxFailures})`, 'error');
        return false;
    }
    
    // 更新失敗次數顯示
    function updateFailureDisplay() {
        failureCounterDisplay.textContent = `${gameState.currentFailures}/${gameState.maxFailures}`;
    }
    
    // 生成按鈕模組
    function generateButtonModule(moduleIndex) {
        const buttonColors = ['red', 'blue', 'yellow', 'white'];
        const buttonTexts = ['按我', '按下', '點擊', '壓下'];
        
        const color = buttonColors[Math.floor(Math.random() * buttonColors.length)];
        const text = buttonTexts[Math.floor(Math.random() * buttonTexts.length)];
        
        // 獲取元素
        const bigButton = document.getElementById(`big-button-${moduleIndex}`);
        const indicatorLight = document.getElementById(`indicator-light-${moduleIndex}`);
        const buttonModule = document.getElementById(`button-module-${moduleIndex}`);
        
        // 設置按鈕外觀
        bigButton.className = `big-button ${color}`;
        bigButton.textContent = text;
        
        // 創建模組狀態
        const moduleState = {
            index: moduleIndex,
            solved: false,
            color: color,
            text: text,
            isHolding: false,
            correctAction: '',
            indicatorColor: ''
        };
        
        // 決定正確的操作
        determineCorrectButtonAction(moduleState);
        
        // 添加按鈕事件
        bigButton.addEventListener('mousedown', () => {
            holdButton(moduleState);
        });
        
        bigButton.addEventListener('mouseup', () => {
            releaseButton(moduleState);
        });
        
        bigButton.addEventListener('mouseleave', () => {
            releaseButton(moduleState);
        });
        
        // 觸控設備支援
        bigButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            holdButton(moduleState);
        });
        
        bigButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            releaseButton(moduleState);
        });
        
        // 添加到遊戲狀態
        gameState.modules.buttons.push(moduleState);
    }
    
    // 決定正確的按鈕操作
    function determineCorrectButtonAction(moduleState) {
        const { color, text } = moduleState;
        const hasK = gameState.serialNumber.includes('K');
        const hasA = gameState.serialNumber.includes('A');
        
        if (color === 'red') {
            if (text === '按下') {
                moduleState.correctAction = 'tap';
            } else {
                moduleState.correctAction = 'hold';
            }
        } else if (color === 'blue') {
            if (text === '點擊' && hasK) {
                moduleState.correctAction = 'hold';
            } else {
                moduleState.correctAction = 'tap';
            }
        } else if (color === 'yellow') {
            if (text === '壓下') {
                moduleState.correctAction = 'hold';
            } else {
                moduleState.correctAction = 'tap';
            }
        } else if (color === 'white') {
            if (hasA && text === '按我') {
                moduleState.correctAction = 'tap';
            } else {
                moduleState.correctAction = 'hold';
            }
        }
        
        // 如果需要按住，預先設定指示燈顏色
        if (moduleState.correctAction === 'hold') {
            const indicatorColors = ['blue', 'yellow', 'white'];
            moduleState.indicatorColor = indicatorColors[Math.floor(Math.random() * indicatorColors.length)];
        }
    }
    
    // 按住按鈕
    function holdButton(moduleState) {
        if (moduleState.solved) {
            return; // 模組已解決
        }
        
        const indicatorLight = document.getElementById(`indicator-light-${moduleState.index}`);
        
        moduleState.isHolding = true;
        
        // 如果正確操作是點擊，則立即檢查
        if (moduleState.correctAction === 'tap') {
            moduleState.solved = true;
            gameState.solvedModules++;
            
            // 添加視覺反饋
            const bigButton = document.getElementById(`big-button-${moduleState.index}`);
            const buttonModule = document.getElementById(`button-module-${moduleState.index}`);
            buttonModule.classList.add('module-solved');
            bigButton.classList.add('button-solved');
            bigButton.disabled = true;
            
            checkGameCompletion();
            return;
        }
        
        // 顯示指示燈並設置顏色 (使用預先設定的顏色)
        indicatorLight.classList.remove('hidden');
        indicatorLight.className = `indicator-light ${moduleState.indicatorColor}`;
    }
    
    // 釋放按鈕
    function releaseButton(moduleState) {
        if (!moduleState.isHolding || moduleState.solved) {
            return;
        }
        
        const bigButton = document.getElementById(`big-button-${moduleState.index}`);
        const indicatorLight = document.getElementById(`indicator-light-${moduleState.index}`);
        const buttonModule = document.getElementById(`button-module-${moduleState.index}`);
        
        moduleState.isHolding = false;
        indicatorLight.classList.add('hidden');
        
        // 如果正確操作是按住，則檢查釋放時機
        if (moduleState.correctAction === 'hold') {
            const seconds = gameState.timer % 60;
            const lastDigit = seconds % 10; // 取得秒數的最後一位數
            const indicatorColor = moduleState.indicatorColor;
            
            let correctRelease = false;
            
            if (indicatorColor === 'blue' && lastDigit === 4) {
                correctRelease = true;
            } else if (indicatorColor === 'yellow' && lastDigit === 5) {
                correctRelease = true;
            } else if (lastDigit === 3) {
                correctRelease = true;
            }
            
            if (correctRelease) {
                moduleState.solved = true;
                gameState.solvedModules++;
                
                // 添加視覺反饋
                buttonModule.classList.add('module-solved');
                bigButton.classList.add('button-solved');
                bigButton.disabled = true;
                
                checkGameCompletion();
            } else {
                // 處理失敗
                if (handleFailure('在錯誤的時間放開按鈕！')) {
                    return; // 如果炸彈爆炸，直接返回
                }
            }
        }
    }
    
    // 生成謎之鍵盤模組
    function generateKeyboardModule(moduleIndex) {
        // 決定使用哪一列符號
        let columnIndex = 5; // 預設使用最後一列
        const serialNumber = gameState.serialNumber;
        
        if (serialNumber.includes('A') || serialNumber.includes('Z')) {
            columnIndex = 0;
        } else if (serialNumber.includes('1') || serialNumber.includes('7')) {
            columnIndex = 1;
        } else if (serialNumber.includes('K') || serialNumber.includes('P')) {
            columnIndex = 2;
        } else if (serialNumber.includes('3') || serialNumber.includes('9')) {
            columnIndex = 3;
        } else if (serialNumber.includes('M') || serialNumber.includes('T')) {
            columnIndex = 4;
        }
        
        // 從選定的列中隨機選擇4個符號位置
        const symbolsInColumn = symbolColumns[columnIndex];
        
        // 隨機選擇4個不重複的符號
        const availableSymbols = [...symbolsInColumn];
        const selectedSymbols = [];
        
        // 隨機選擇4個符號
        for (let i = 0; i < 4; i++) {
            const randomIndex = Math.floor(Math.random() * availableSymbols.length);
            selectedSymbols.push(availableSymbols[randomIndex]);
            availableSymbols.splice(randomIndex, 1); // 移除已選擇的符號
        }
        
        // 打亂順序
        const shuffledSymbols = [...selectedSymbols];
        for (let i = shuffledSymbols.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffledSymbols[i], shuffledSymbols[j]] = [shuffledSymbols[j], shuffledSymbols[i]];
        }
        
        console.log("Selected symbols:", selectedSymbols);
        console.log("Shuffled symbols:", shuffledSymbols);
        
        // 找出每個符號在原始列中的索引
        const symbolIndices = shuffledSymbols.map(symbol => symbolsInColumn.indexOf(symbol));
        console.log("Symbol indices in column:", symbolIndices);
        
        // 創建正確的按鍵順序 (按照符號在原始列中的索引從小到大排序)
        const indexToPositionMap = {};
        symbolIndices.forEach((index, position) => {
            indexToPositionMap[index] = position;
        });
        
        // 排序索引
        const sortedIndices = [...symbolIndices].sort((a, b) => a - b);
        
        // 建立正確的按鍵順序
        const correctSequence = sortedIndices.map(index => indexToPositionMap[index]);
        console.log("Correct sequence:", correctSequence);
        
        // 創建模組狀態
        const moduleState = {
            index: moduleIndex,
            solved: false,
            correctSequence: correctSequence,
            pressedButtons: [], // 已按下的按鍵
            symbols: shuffledSymbols
        };
        
        gameState.modules.keyboards.push(moduleState);
        
        // 設置按鈕
        const keyboardGrid = document.getElementById(`keyboard-grid-${moduleIndex}`);
        const buttons = keyboardGrid.querySelectorAll('.keyboard-button');
        
        buttons.forEach((button, index) => {
            button.textContent = shuffledSymbols[index];
            
            button.addEventListener('click', () => {
                if (moduleState.solved) return;
                
                // 記錄按下的按鍵
                moduleState.pressedButtons.push(parseInt(button.dataset.position));

                console.log(moduleState.pressedButtons);
                
                // 視覺反饋
                button.classList.add('pressed');
                setTimeout(() => {
                    button.classList.remove('pressed');
                }, 200);
                
                // 檢查是否按對順序
                if (moduleState.pressedButtons.length === 4) {
                    checkKeyboardSequence(moduleState);
                }
            });
        });
    }
    
    // 檢查謎之鍵盤按鍵順序
    function checkKeyboardSequence(moduleState) {
        const pressedSequence = moduleState.pressedButtons;
        const correctSequence = moduleState.correctSequence;
        const keyboardGrid = document.getElementById(`keyboard-grid-${moduleState.index}`);
        const buttons = keyboardGrid.querySelectorAll('.keyboard-button');

        console.log(correctSequence);
        
        // 檢查順序是否正確
        let isCorrect = true;
        for (let i = 0; i < 4; i++) {
            if (pressedSequence[i] !== correctSequence[i]) {
                isCorrect = false;
                break;
            }
        }
        
        if (isCorrect) {
            // 順序正確，模組解除
            moduleState.solved = true;
            gameState.solvedModules++;
            
            // 視覺反饋
            buttons.forEach(button => {
                button.classList.add('correct');
            });
            
            // 檢查是否完成所有模組
            checkGameCompletion();
        } else {
            // 順序錯誤，處理失敗
            if (handleFailure('按鍵順序錯誤！')) {
                return; // 如果炸彈爆炸，直接返回
            }
            
            // 視覺反饋
            buttons.forEach(button => {
                button.classList.add('wrong');
            });
            
            setTimeout(() => {
                buttons.forEach(button => {
                    button.classList.remove('wrong');
                });
            }, 500);
        }
    }
    
    // 檢查遊戲是否完成
    function checkGameCompletion() {
        if (gameState.solvedModules === gameState.totalModules) {
            endGame(true, '恭喜！你成功拆除了所有炸彈模組！');
        }
    }
    
    // 開始計時器
    function startTimer() {
        updateTimerDisplay();
        gameState.timerInterval = setInterval(() => {
            gameState.timer--;
            updateTimerDisplay();
            
            if (gameState.timer <= 0) {
                endGame(false, '時間到！炸彈爆炸！');
            }
        }, 1000);
    }
    
    // 停止計時器
    function stopTimer() {
        if (gameState.timerInterval) {
            clearInterval(gameState.timerInterval);
            gameState.timerInterval = null;
        }
    }
    
    // 更新計時器顯示
    function updateTimerDisplay() {
        const minutes = Math.floor(gameState.timer / 60);
        const seconds = gameState.timer % 60;
        timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // 當時間少於1分鐘時變紅
        if (gameState.timer < 60) {
            timerDisplay.style.color = '#e74c3c';
        } else {
            timerDisplay.style.color = '';
        }
    }
    
    // 結束遊戲
    function endGame(success, message) {
        stopTimer();
        
        if (success) {
            resultTitle.textContent = '任務成功！';
            resultTitle.style.color = '#27ae60';
            
            // 直接顯示結果畫面
            gameScreen.classList.add('hidden');
            resultScreen.classList.remove('hidden');
        } else {
            // 爆炸音效
            playExplosionSound();

            // 爆炸動畫
            const explosionContainer = document.getElementById('explosion-container');
            const explosion = explosionContainer.querySelector('.explosion');
            
            // 震動效果
            gameScreen.classList.add('shake');
            
            // 顯示爆炸動畫
            explosionContainer.classList.remove('hidden');
            
            // 添加動畫類別
            explosion.classList.add('animate');
            
            // 創建爆炸粒子
            createExplosionParticles(explosionContainer);
            
            // 延遲顯示結果畫面
            setTimeout(() => {
                gameScreen.classList.remove('shake');
                gameScreen.classList.add('hidden');
                explosionContainer.classList.add('hidden');
                explosion.classList.remove('animate'); // 移除動畫類別以便下次使用
                resultScreen.classList.remove('hidden');
                
                resultTitle.textContent = '任務失敗！';
                resultTitle.style.color = '#e74c3c';
            }, 1500);
        }
        
        resultMessage.textContent = message;
    }
    
    // 創建爆炸粒子
    function createExplosionParticles(container) {
        // 創建20個爆炸粒子
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'explosion-particle';
            
            // 隨機大小
            const size = Math.random() * 15 + 5;
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            
            // 隨機顏色
            const colors = ['#ff5722', '#ff9800', '#ffc107', '#ffeb3b'];
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            
            // 隨機位置
            particle.style.left = '50%';
            particle.style.top = '50%';
            
            // 隨機方向
            const angle = Math.random() * Math.PI * 2;
            const distance = 50 + Math.random() * 150;
            const tx = Math.cos(angle) * distance;
            const ty = Math.sin(angle) * distance;
            
            // 設置CSS變數用於動畫
            particle.style.setProperty('--tx', `${tx}px`);
            particle.style.setProperty('--ty', `${ty}px`);
            
            container.appendChild(particle);
            
            // 動畫結束後移除粒子
            particle.addEventListener('animationend', () => {
                particle.remove();
            });
        }
    }
    
    // 播放爆炸音效
    function playExplosionSound() {
        try {
            const audio = new Audio('sounds/explosion.mp3');
            audio.volume = 0.5;
            audio.play().catch(e => console.log('無法播放音效:', e));
        } catch (e) {
            console.log('音效播放錯誤:', e);
        }
    }
    
    // 初始化遊戲
    initEventListeners();
});
