/* ch01-quiz.js — 第 01 章自我測驗題庫
   題目全部出自 HDL01_Overview 投影片；answer 為 0-based 索引。
   由 js/quiz.js 讀取並渲染。 */
window.HDL_QUIZ = {
  chapter: 'ch01',
  questions: [
    {
      id: 'ch01-q1',
      type: 'single',
      stem: '在廣義 HDL 的 2×2 分類中，「閘級以上」且以「文字」描述的那一格叫什麼？',
      options: ['SCHEMATICS', 'HDL', 'NETLIST', 'Layout'],
      answer: 1,
      explain: '同一列的圖與文字描述同一件事。閘級以上的文字形式稱為 HDL；到了電晶體級，同樣是文字就改稱 NETLIST（例如 SPICE）。',
      src: '投影片 p.8'
    },
    {
      id: 'ch01-q2',
      type: 'single',
      stem: '投影片的 Levels & Views 表格有 7 個層級與 3 個觀點，格子刻意留空。這張表代表多少種表示法？',
      options: ['10 種', '14 種', '21 種', '42 種'],
      answer: 2,
      explain: '7 個層級 × 3 個觀點 = 21 種表示法。格子留空本身就是教學重點：表格要傳達的是「層級」與「觀點」是兩個獨立座標。',
      src: '投影片 p.13'
    },
    {
      id: 'ch01-q3',
      type: 'single',
      stem: '在 Gajski 的 Y 圖中，同心圓環代表什麼？',
      options: ['觀點 (view)', '抽象層級 (level)', 'EDA 工具', '訊號寬度'],
      answer: 1,
      explain: 'Y 圖是把層級／觀點表格改畫成放射狀：三條軸各代表一個觀點（行為、結構、實體），同心圓環代表抽象層級，每個扇形就是某一層級的某一個觀點。',
      src: '投影片 p.14'
    },
    {
      id: 'ch01-q4',
      type: 'tf',
      stem: '依投影片 p.15 的講法，EDA 工具相當於 Y 圖上連接各軸的弧線，負責把設計從一個觀點或層級搬到另一個。',
      answer: true,
      explain: '正確。p.15 把 modularization、partitioning、synthesize、library、sim、ver 等工作標在弧線上，每條弧線就是一個 EDA 工具所做的轉換。',
      src: '投影片 p.15'
    },
    {
      id: 'ch01-q5',
      type: 'single',
      stem: '實務上 Verilog 使用者常用的三種 coding 模式，不包含下列哪一個？',
      options: ['Behavioral Mode', 'RTL Mode', 'Gate-Level', 'Transistor-Level Mode'],
      answer: 3,
      explain: 'p.16 用三個斜向橢圓圈出的是 Behavioral Mode（系統層行為）、RTL Mode（暫存器層）、Gate-Level（邏輯層結構與實體）。電晶體級屬於 SPICE/NETLIST 的範圍，不是這三種模式之一。',
      src: '投影片 p.16'
    },
    {
      id: 'ch01-q6',
      type: 'tf',
      stem: '在結構模型的定義中，最底層的 primitive elements（如 and、nand、or、nor、not）其功能模型被視為已知，不需再往下展開。',
      answer: true,
      explain: '正確。結構觀點是遞迴定義的：節點可以再展開成下一層結構，但展到 primitive 就停，因為 primitive 的功能被假設為已知。',
      src: '投影片 p.19'
    },
    {
      id: 'ch01-q7',
      type: 'single',
      stem: '在 p.23 的 7 節點閘圖中，G3 扇出到 G4、G5、G6，而 G5 與 G6 又在 G7 匯合。G3 這個節點在結構性質上稱為什麼？',
      options: ['Branch', 'Stem', 'Primary Input', 'Fanout-free'],
      answer: 1,
      explain: '扇出大於 1 的訊號源稱為 stem（主幹），它扇出的那幾條線才叫 branches。G5 與 G6 在 G7 重新匯合的現象則稱為 reconvergent fanout。',
      src: '投影片 p.22–23'
    },
    {
      id: 'ch01-q8',
      type: 'single',
      stem: '在 Huffman 模型中，若用 M 個 D 型正反器儲存狀態，狀態數 S 的上限是多少？',
      options: ['S ≤ M', 'S ≤ 2M', 'S ≤ 2^M', 'S ≤ M^2'],
      answer: 2,
      explain: 'M 個正反器能編出 2^M 種不同的位元組合，所以 State Count S ≤ 2^M，這正是投影片右下角的方程式。',
      src: '投影片 p.29'
    },
    {
      id: 'ch01-q9',
      type: 'single',
      stem: '在密碼 1011 的 Mealy 狀態圖中，唯一輸出為 1 的轉移是哪一條？',
      options: ['00 --1/1--> 01', '01 --1/1--> 10', '11 --1/1--> 01', '10 --1/1--> 11'],
      answer: 2,
      explain: '只有狀態 11（Waiting for 1）收到輸入 1 時才算比對成功，轉移到 01 並輸出 1。其餘七條邊的輸出都是 0。Mealy 機的輸出同時取決於現態與輸入，所以標在邊上。',
      src: '投影片 p.30'
    },
    {
      id: 'ch01-q10',
      type: 'tf',
      stem: 'Verilog 模組本體內的那些敘述（閘級網表、階層實體、always 與 initial 等 block）是由上往下依序執行的。',
      answer: false,
      explain: '錯誤。p.39 在模組本體旁特別標註 parallel statements — 模組內的敘述是並行的。只有 initial 或 always 區塊「內部」的敘述才有順序性。',
      src: '投影片 p.39'
    }
  ]
};
