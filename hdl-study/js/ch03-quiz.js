/* ch03-quiz.js — 第 03 章自我測驗題庫
   題目全部出自 HDL03_Basic-Grammar 投影片；answer 為 0-based 索引。 */
window.HDL_QUIZ = {
  chapter: 'ch03',
  questions: [
    {
      id: 'ch03-q1',
      type: 'single',
      stem: '常數 8’haf 代表什麼？',
      options: [
        '8 進位、數值 af',
        '8 位元寬的十六進位常數',
        '第 8 個十六進位暫存器',
        '8 位元的十進位常數 af'
      ],
      answer: 1,
      explain: '格式是「位寬 + 單引號 + 基底字母 + 數值」。8 是位寬 (#bits)，h 是基底 (radix) 代表十六進位，af 是數值。投影片用放大的 13’ h1A2F 標出這兩個部分。',
      src: '投影片 p.5'
    },
    {
      id: 'ch03-q2',
      type: 'single',
      stem: '反引號 ` 與單引號 ’ 在 Verilog 中的用途分別是什麼？',
      options: [
        '反引號用於常數位寬，單引號用於編譯指令',
        '反引號用於編譯指令，單引號用於常數位寬',
        '兩者可以互換使用',
        '反引號用於字串，單引號用於註解'
      ],
      answer: 1,
      explain: '反引號 ` 用於 `define、`include、`timescale 等編譯指令；單引號 ’ 用於有位寬的常數如 8’hAF。投影片特別在鍵盤照片上把兩個鍵分開標示，因為這是初學最常打錯的地方。',
      src: '投影片 p.4'
    },
    {
      id: 'ch03-q3',
      type: 'single',
      stem: '投影片列出 Verilog 的四種模型，由高抽象到低抽象的正確順序是？',
      options: [
        '開關級 → 閘級 → RTL → 行為',
        '行為 → RTL → 閘級 → 開關級',
        'RTL → 行為 → 開關級 → 閘級',
        '閘級 → 開關級 → RTL → 行為'
      ],
      answer: 1,
      explain: 'p.12 由上而下排列為 Behavioral（計數器）→ RTL（加法器）→ Gate Level（SR 閂鎖器）→ Switch Level（多工器）。實務上只常用前兩種，閘級多半是合成工具的輸出。',
      src: '投影片 p.12'
    },
    {
      id: 'ch03-q4',
      type: 'single',
      stem: '原式 assign F=(A&B)|(~A&C); 會產生突波。投影片加上哪一項來消除它？',
      options: ['A&C', 'B&C', '~B&C', 'A&~C'],
      answer: 1,
      explain: '加上共識項 B&C 後變成 assign F=(A&B)|(~A&C)|B&C;。當 B=C=1 時這一項恆為 1，F 被固定住，A 跳變時的空檔被填滿。這個多餘項不改變真值表，純粹消除時序毛刺。',
      src: '投影片 p.13'
    },
    {
      id: 'ch03-q5',
      type: 'tf',
      stem: '在行為模式中宣告為 reg 的變數，合成後一定會產生硬體暫存器。',
      answer: false,
      explain: '錯誤。投影片明確寫著 reg in behavioral mode may not necessarily be a register。reg 只是「可在程序式區塊中被指定的變數型別」；會不會合成出正反器取決於寫法 — 用 always@(posedge Clk) 才會。',
      src: '投影片 p.24'
    },
    {
      id: 'ch03-q6',
      type: 'single',
      stem: '假設 X==3、Y==6。執行 always@(posedge Clk) begin X = Y + 1; Y = X << 1; end 之後，X 與 Y 各是多少？',
      options: ['X=7, Y=6', 'X=7, Y=14', 'X=3, Y=6', 'X=4, Y=8'],
      answer: 1,
      explain: '阻塞指定會立刻生效：先算 Y+1=7 給 X，第二行用的是「已經變成 7」的 X，所以 7<<1=14 給 Y。這也說明阻塞指定的結果會隨兩行的先後順序而改變。',
      src: '投影片 p.32'
    },
    {
      id: 'ch03-q7',
      type: 'single',
      stem: '同樣 X==3、Y==6，改用非阻塞 X <= Y + 1; Y <= X << 1; 之後的結果是？',
      options: ['X=7, Y=14', 'X=7, Y=6', 'X=3, Y=6', '無法預測'],
      answer: 1,
      explain: '非阻塞指定先用舊值算出所有右式（X’=Y+1=7、Y’=X<<1=6），第二階段才一起寫入，所以 X=7、Y=6。投影片也指出把兩行對調結果相同 — 與書寫順序無關，因此可以合成。',
      src: '投影片 p.32'
    },
    {
      id: 'ch03-q8',
      type: 'single',
      stem: '想交換兩個正反器的值，寫成 begin F1=F2; F2=F1; end 會發生什麼事？',
      options: [
        'F1 與 F2 正確互換',
        '兩者最後都等於原本的 F2',
        '兩者最後都等於原本的 F1',
        '編譯錯誤'
      ],
      answer: 1,
      explain: '阻塞指定下，第一行讓 F1 變成 F2；第二行再把「已經是 F2」的 F1 寫回 F2，於是兩者都成為原本的 F2，交換失敗。要真正互換必須用非阻塞：F1<=F2; F2<=F1;，因為它取的是交換前的舊值。',
      src: '投影片 p.33'
    },
    {
      id: 'ch03-q9',
      type: 'single',
      stem: 'casex 與 casez 的差別是什麼？',
      options: [
        'casez 把 x 也視為不比對，casex 不會',
        'casex 除了 z 與 ? 之外，連 x 也視為不比對',
        '兩者完全相同，只是舊寫法與新寫法',
        'casex 只能用於十六進位常數'
      ],
      answer: 1,
      explain: 'casez 只把 z 與 ? 當成不比對；casex 的範圍更寬，連 x 也一併視為不比對。投影片用范氏圖表示：內圈是 0 與 1，外圈是 z 與 ?，而 x 被 casex 一起納入。',
      src: '投影片 p.34'
    },
    {
      id: 'ch03-q10',
      type: 'single',
      stem: '同步重置與非同步重置的 DFF，程式上的差別在哪裡？',
      options: [
        '差在 reg 的宣告位置',
        '差在敏感度列表：非同步版把 posedge Rst 也列入 always@(...)',
        '差在使用 = 還是 <=',
        '差在 Rst 是 input 還是 output'
      ],
      answer: 1,
      explain: '非同步版寫 always@(posedge Clk or posedge Rst)，重置不必等時脈就生效；同步版只寫 always@(posedge Clk)，重置要等到下一個時脈正緣才生效。其餘程式完全相同。',
      src: '投影片 p.35'
    }
  ]
};
