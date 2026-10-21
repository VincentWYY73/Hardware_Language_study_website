/* ch05-quiz.js — 第 05 章自我測驗題庫
   題目全部出自 HDL05_FSM 投影片；answer 為 0-based 索引。 */
window.HDL_QUIZ = {
  chapter: 'ch05',
  questions: [
    {
      id: 'ch05-q1',
      type: 'single',
      stem: '依投影片的定義，Moore 機的輸出相依於什麼？',
      options: [
        '現態與輸入',
        '只有現態',
        '只有輸入',
        '次態與輸入'
      ],
      answer: 1,
      explain: '原文：Moore Machine: The outputs are dependent on only the present state. 而 Mealy 的輸出同時相依於狀態與輸入。這個差別讓 Moore 機需要一個獨立的輸出解碼器。',
      src: '投影片 p.4'
    },
    {
      id: 'ch05-q2',
      type: 'single',
      stem: '在狀態圖上，Mealy 與 Moore 的輸出分別標在哪裡？',
      options: [
        'Mealy 標在狀態圈內，Moore 標在邊上',
        'Mealy 標在邊上（輸入/輸出），Moore 標在狀態圈內',
        '兩者都標在邊上',
        '兩者都標在狀態圈內'
      ],
      answer: 1,
      explain: 'Mealy 的輸出取決於邊（狀態加輸入），所以寫成 1/1 這種「輸入/輸出」形式標在邊上。Moore 的輸出只取決於狀態，所以標在圈內（p.8 把圈用橫線切開，上半狀態名、下半輸出），邊上只標輸入值。',
      src: '投影片 p.5、p.8'
    },
    {
      id: 'ch05-q3',
      type: 'single',
      stem: '1011 密碼鎖偵測成功後，為什麼下一個狀態是 01（等 011）而不是 00（等 1011）？',
      options: [
        '因為程式寫錯了',
        '因為它是可重疊的偵測器 — 結尾的 1 可以當成下一次密碼的開頭',
        '因為 00 是保留狀態',
        '因為要等重置訊號才能回到 00'
      ],
      answer: 1,
      explain: '這是「可重疊 (overlapping)」序列偵測器。密碼 1011 的最後一個 1 同時也可以是下一組 1011 的第一個 1，所以回到 01（已看到一個 1）而不是從頭開始。餵入 1011011 會成功偵測兩次。',
      src: '投影片 p.5'
    },
    {
      id: 'ch05-q4',
      type: 'single',
      stem: '在 Huffman 模型中，PPI 與 PPO 分別代表什麼？',
      options: [
        '主要輸入與主要輸出',
        '偽主要輸入（現態 y）與偽主要輸出（次態 Y）',
        '正反器的時脈與重置',
        '輸入緩衝與輸出緩衝'
      ],
      answer: 1,
      explain: 'PPI = Pseudo PI = Present State (y)，是正反器的 Q 回授進組合邏輯的那一組；PPO = Pseudo PO = Next State (Y)，是組合邏輯算出來要寫回正反器 D 端的那一組。真正對外的才叫 PI (X) 與 PO (Z)。',
      src: '投影片 p.2'
    },
    {
      id: 'ch05-q5',
      type: 'single',
      stem: 'JTAG / IEEE 1149.1 需要哪四支額外接腳？',
      options: [
        'TDI、TDO、TCK、TMS',
        'TDI、TDO、VDD、GND',
        'SCAN_IN、SCAN_OUT、Shift、Update',
        'TMS、TCK、Mode、Clock'
      ],
      answer: 0,
      explain: 'TMS (Test Mode Signal) 是 TAP 控制器唯一的輸入、TCK (Test Clock) 是測試專用時脈、TDI (Test Data Input) 與 TDO (Test Data Output) 則是掃描鏈的序列進出口。投影片把 Signal 誤拼為 Singal。',
      src: '投影片 p.14'
    },
    {
      id: 'ch05-q6',
      type: 'single',
      stem: '不論 TAP 控制器目前在哪個狀態，把 TMS 維持在 1 連續幾個時脈一定會回到 TestReset？',
      options: ['3 個', '4 個', '5 個', '8 個'],
      answer: 2,
      explain: '五個。這是 JTAG 最重要的性質之一：外部設備不必知道晶片目前的狀態，只要拉高 TMS 五個 TCK 就能重新同步。從最遠的 PauseDR 驗算：Exit2DR → UpdateDR → SelectDR → SelectIR → TestReset，正好五步。',
      src: '投影片 p.17、p.18'
    },
    {
      id: 'ch05-q7',
      type: 'single',
      stem: 'TAP 控制器的 ShiftDR / ShiftIR 狀態為什麼要有自迴圈？',
      options: [
        '為了等待時脈穩定',
        '停留在該狀態 N 個時脈就能序列移進／移出 N 個位元',
        '為了避免進入 TestReset',
        '為了同時更新所有接腳'
      ],
      answer: 1,
      explain: 'Shift 狀態是實際搬資料的地方：TMS 保持 0 就留在原地，每個 TCK 移動一個位元，所以要移幾個位元就停留幾個時脈。另外 Pause 狀態的自迴圈則是讓外部設備可以中途暫停，再經 Exit2 回到 Shift 繼續。',
      src: '投影片 p.18'
    },
    {
      id: 'ch05-q8',
      type: 'single',
      stem: '一個邊界掃描單元裡為什麼需要兩個正反器（擷取／移位正反器與更新正反器）？',
      options: [
        '為了提高時脈頻率',
        '為了讓移位期間輸出腳不會跟著變動，等 Update 時才一次生效',
        '為了同時支援 Mealy 與 Moore',
        '為了儲存兩個測試圖樣'
      ],
      answer: 1,
      explain: '第一個正反器負責擷取與移位，第二個（更新正反器）只在 Update 脈衝到來時才把值推到輸出多工器。這樣整條鏈可以安靜地把資料移完，再一次同步生效，避免移位過程中輸出亂跳。',
      src: '投影片 p.16'
    },
    {
      id: 'ch05-q9',
      type: 'single',
      stem: '環形計數器、強生計數器與 LFSR 的結構差別在哪裡？',
      options: [
        '正反器的數量不同',
        '時脈頻率不同',
        '只差在回授路徑：直接回授、經反相器、經 XOR',
        '只有 LFSR 需要時脈'
      ],
      answer: 2,
      explain: '三者的移位鏈完全相同，差別只在回授：環形直接把末級接回首級（產生一熱碼）；強生經一個反相器回授（N 級可得 2N 個狀態）；LFSR 經 XOR 回授（產生偽隨機序列，當計數器用時需要解碼器）。',
      src: '投影片 p.20'
    },
    {
      id: 'ch05-q10',
      type: 'single',
      stem: '某個狀態需要「等待 n 個時脈」才能離開。投影片建議的最佳做法是什麼？',
      options: [
        '畫 n 個串接的狀態',
        '用一個共用的可重置計數器加比較器，一個狀態自迴圈到 c==n',
        '把時脈降頻 n 倍',
        '改用 Moore 機'
      ],
      answer: 1,
      explain: 'p.22 列出三層細化：抽象的 delay n cycles 只是需求；展開成 n 個串接狀態要花 n 個狀態；最好的做法是進入時把計數器清零，在一個狀態裡自迴圈遞增，c<n 就留著、c==n 才離開 — 只要一個狀態，而且計數器可以被多處共用。',
      src: '投影片 p.22'
    }
  ]
};
