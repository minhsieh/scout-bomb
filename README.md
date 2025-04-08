# 無線電拆彈 (Scout Bomb)

無線電拆彈是一款受 "Keep Talking and Nobody Explodes" 啟發的合作解謎遊戲，專為兩人協作設計。遊戲模擬了一個拆彈情境，需要玩家之間的有效溝通才能成功。

## 遊戲概述

在這個遊戲中，玩家分為兩個角色：
- **拆彈專家**：負責實際操作並拆除炸彈
- **指導員**：持有拆彈手冊，提供必要的指示

玩家必須在時間結束前成功拆除所有模組，否則炸彈將會爆炸。每次失誤都會使遊戲更加危險，達到最大失誤次數時遊戲結束。

## 遊戲特色

- **多種模組**：包含線路模組、按鈕模組和謎之鍵盤模組
- **可自定義設置**：調整模組數量、遊戲時間和最大失誤次數
- **隨機生成**：每次遊戲都有不同的序列號和模組配置
- **視覺和音效反饋**：包含爆炸動畫和音效

## 模組說明

### 線路模組
模組中會有3至6條不同顏色的線路（紅色、藍色、黃色、黑色或白色）。玩家需要根據線路的顏色、數量和序列號來決定應該剪斷哪一條線路。

### 按鈕模組
一個大型按鈕，可能是不同的顏色和文字。玩家需要決定是短按還是長按按鈕，以及在何時釋放按鈕。

### 謎之鍵盤模組
包含多個符號按鈕，玩家需要根據序列號和符號表來確定正確的按鍵順序。

## 如何遊戲

1. 開始遊戲前，拆彈專家和指導員應該分別使用不同的裝置
2. 指導員應該查看拆彈手冊，熟悉各種模組的規則
3. 拆彈專家開始遊戲，並將炸彈的序列號和模組情況告知指導員
4. 雙方通過溝通，指導員根據手冊提供指示，拆彈專家執行操作
5. 成功拆除所有模組即可獲勝

## 遊戲設置

可以在設置畫面調整以下參數：
- 線路模組數量（0-6）
- 按鈕模組數量（0-3）
- 謎之鍵盤模組數量（0-2）
- 遊戲時間（1-5分鐘）
- 最大失誤次數（1-5次）

## 技術實現

- 純前端實現，使用HTML、CSS和JavaScript
- 響應式設計，適配不同螢幕尺寸
- 本地存儲功能，保存用戶設置
- 動畫效果使用CSS動畫實現

## 本地運行

1. 克隆或下載本倉庫
2. 使用網頁伺服器（如Nginx）部署靜態文件
3. 或直接在瀏覽器中打開index.html文件

## 授權

本項目僅供學習和娛樂使用。

---

開發者：Min Hsieh
