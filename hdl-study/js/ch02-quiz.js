/* ch02-quiz.js — 第 02 章自我測驗題庫
   題目全部出自 HDL02_Ychart 投影片；answer 為 0-based 索引。 */
window.HDL_QUIZ = {
  chapter: 'ch02',
  questions: [
    {
      id: 'ch02-q1',
      type: 'single',
      stem: '在測試平台 (testbench) 的概念圖中，左端負責產生輸入刺激的是哪一種 Verilog 結構？',
      options: ['always 區塊', 'initial 區塊', 'assign 連續指定', 'generate 區塊'],
      answer: 1,
      explain: '投影片把左側的訊號產生器標為 initial block as signal generator；右端則用 $display、$monitor 與波形觀察輸出，像一台示波器或邏輯分析儀。',
      src: '投影片 p.4'
    },
    {
      id: 'ch02-q2',
      type: 'single',
      stem: '投影片把哪一種設計方向稱為「Ideal EDA Flow」？',
      options: ['Bottom-up', 'Top-down', 'Middle-out', 'Ends-In'],
      answer: 1,
      explain: 'p.5 把 Top-down 的特性列為 Shorten design phase、Should be modularized carefully、Ideal EDA Flow。Bottom-up 的好處則是長期建立程式庫與容易模組化。',
      src: '投影片 p.5'
    },
    {
      id: 'ch02-q3',
      type: 'single',
      stem: '4 位元加法器有 A3–A0、B3–B0 與 Ci 共 9 個輸入。若硬要用單一真值表實作，需要多少列？',
      options: ['64 列', '256 列', '512 列', '1024 列'],
      answer: 2,
      explain: '2^9 = 512 列。投影片用這個數字說明 Time Complexity: Incredibly exponentially increasing，也就是為什麼必須改用階層設計。',
      src: '投影片 p.6'
    },
    {
      id: 'ch02-q4',
      type: 'single',
      stem: '在由上而下 (top-down) 的分解樹中，遞迴在什麼時候停止？',
      options: [
        '分解到單一電晶體時',
        '分解到可在實體程式庫找到的單元（例如 AND、XOR）時',
        '分解到 4 層時',
        '分解到只剩行為描述時'
      ],
      answer: 1,
      explain: '投影片在葉節點 AND 與 XOR 旁註明 Can be found in physical library — 既然程式庫已有現成單元，就不需要再往下展開。',
      src: '投影片 p.7'
    },
    {
      id: 'ch02-q5',
      type: 'single',
      stem: '依投影片 p.13 的畫法，一個全加器 (Full Adder) 是由什麼組成的？',
      options: [
        '兩個半加器加一個 OR 閘',
        '兩個半加器加一個 AND 閘',
        '一個半加器加一個 XOR 閘',
        '四個 NAND 閘'
      ],
      answer: 0,
      explain: '兩個 Half Adder 的和串接，兩個進位輸出送進一個 OR 閘得到最終進位，也就是 FA = HA + HA + OR。',
      src: '投影片 p.13'
    },
    {
      id: 'ch02-q6',
      type: 'single',
      stem: '在 Y 圖上，同心圓（圓環）這個座標代表什麼？越靠圓心代表什麼？',
      options: [
        '代表觀點；越靠圓心越抽象',
        '代表抽象層級；越靠圓心越細節，圓心是程式庫',
        '代表 EDA 工具；越靠圓心越新',
        '代表設計時間；越靠圓心越早'
      ],
      answer: 1,
      explain: '三條軸是觀點，同心圓才是抽象層級：離圓心越遠越抽象，越靠圓心越細節，圓心正是 library 標籤所在。注意投影片並未為各圓環命名。',
      src: '投影片 p.17'
    },
    {
      id: 'ch02-q7',
      type: 'single',
      stem: '在 Y 圖的六個流程標籤中，哪一個是由結構軸往實體軸移動？',
      options: ['modularization', 'partitioning', 'synthesize', 'ver'],
      answer: 2,
      explain: 'synthesize（合成）畫在右側，從結構軸跨向實體軸並同時往內。modularization 與 partitioning 都在行為與結構之間，ver 則留在較高抽象層的行為側。',
      src: '投影片 p.17'
    },
    {
      id: 'ch02-q8',
      type: 'tf',
      stem: '攤平式合成 (flattened synthesis) 會保留設計原本的模組階層。',
      answer: false,
      explain: '錯誤。攤平正好是把階層丟掉，結果是一片沒有層次的標準單元海、照列擺放。好處是合成器能跨模組邊界最佳化，代價是難讀、難除錯、失去模組重用。',
      src: '投影片 p.16'
    },
    {
      id: 'ch02-q9',
      type: 'single',
      stem: 'p.21 在 EDA 工具地圖上疊了三條虛線箭頭，指向 S、B、P 三個字母。它們分別代表什麼？',
      options: [
        'System、Board、Physics 三個層級',
        'Structural、Behavioral、Physical 三個觀點',
        'Synthesis、Build、Place 三個階段',
        'SPICE、BDD、PLA 三種工具'
      ],
      answer: 1,
      explain: 'S = Structural、B = Behavioral、P = Physical。這一頁的作用是把 p.18–20 的具體工具流程接回 p.17 Y 圖的三個觀點。',
      src: '投影片 p.21'
    }
  ]
};
