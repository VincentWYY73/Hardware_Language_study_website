/* ch02-ychart.js — 第 02 章專屬互動元件
   1) §2.9 的互動 Y 圖：點選觀點／層級／流程弧線即高亮並說明。
   2) §2.7 的八步步進器：漸進顯示 p.8–15 的動畫分鏡。
   漸進增強寫法：沒有 JS 時八張圖全部顯示，功能不會消失。
   傳統 script，無模組、無網路存取。 */
(function () {
  'use strict';

  /* ---------------------------------------------------------- 互動 Y 圖 ---- */

  var Y_ITEMS = [
    {
      label: 'Behavioral（行為觀點）',
      ids: ['axis-b', 'lbl-b'],
      note: '左上那條軸。回答「這個電路做什麼」，例如一句 {Co, S} = A + B 的式子，或一段狀態轉移描述。'
    },
    {
      label: 'Structural（結構觀點）',
      ids: ['axis-s', 'lbl-s'],
      note: '右上那條軸。回答「這個電路由什麼組成」，例如半加器由一個 AND 加一個 XOR 接成。'
    },
    {
      label: 'Physical（實體觀點）',
      ids: ['axis-p', 'lbl-p'],
      note: '正下方那條軸。回答「這個電路長什麼樣子、怎麼擺」，例如標準單元的佈局與繞線。'
    },
    {
      label: '抽象層級（同心圓）',
      ids: ['ring-1', 'ring-2', 'ring-3'],
      note: '三個同心圓代表抽象層級：離圓心越遠越抽象，越靠圓心越細節，圓心就是程式庫裡的葉單元。投影片沒有為各圓環命名，所以這裡也不替它們取名。'
    },
    {
      label: 'modularization',
      ids: ['arc-mod', 'lbl-mod'],
      note: '最外圈的弧線，在行為軸與結構軸之間。把一份抽象的行為描述切成模組 — 這是流程的第一步，也是最高抽象層的動作。'
    },
    {
      label: 'partitioning',
      ids: ['arc-part', 'lbl-part'],
      note: '往內一層的同方向弧線。模組化之後再做更細的分割，仍然是行為到結構的轉換，但已經降了一個抽象層級。'
    },
    {
      label: 'synthesize',
      ids: ['arc-syn', 'lbl-syn'],
      note: '右側的弧線，由結構軸往實體軸、同時往內。這就是合成：把結構描述變成可以實作的實體單元組合。'
    },
    {
      label: 'library',
      ids: ['arc-lib', 'lbl-lib'],
      note: '圓心附近的短弧。流程最終會碰到程式庫 — 所有分解到最後都落在程式庫既有的葉單元上，不再往下展開。'
    },
    {
      label: 'sim',
      ids: ['arc-sim', 'lbl-sim'],
      note: '圓心附近的短弧。模擬是「同一層級內的檢查」，所以它的弧線很短，不跨層級。'
    },
    {
      label: 'ver',
      ids: ['arc-ver', 'lbl-ver'],
      note: '左側外圈的弧線。驗證發生在較高的抽象層級，確認設計仍符合原本的行為規格。'
    }
  ];

  function initYChart() {
    var box = document.querySelector('[data-y-btns]');
    var note = document.querySelector('[data-y-note]');
    var svg = document.querySelector('.ychart svg');
    if (!box || !note || !svg) { return; }

    var buttons = [];

    function select(index) {
      var item = Y_ITEMS[index];
      var marked = svg.querySelectorAll('.is-hl');
      for (var m = 0; m < marked.length; m++) { marked[m].classList.remove('is-hl'); }
      for (var i = 0; i < item.ids.length; i++) {
        var el = svg.querySelector('#' + item.ids[i]);
        if (el) { el.classList.add('is-hl'); }
      }
      for (var b = 0; b < buttons.length; b++) {
        buttons[b].setAttribute('aria-pressed', b === index ? 'true' : 'false');
      }
      note.textContent = item.label + '：' + item.note;
      if (window.HDL && typeof window.HDL.announce === 'function') {
        window.HDL.announce(item.label + '。' + item.note);
      }
    }

    for (var i = 0; i < Y_ITEMS.length; i++) {
      (function (idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-sm';
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = Y_ITEMS[idx].label;
        btn.addEventListener('click', function () { select(idx); });
        box.appendChild(btn);
        buttons.push(btn);
      })(i);
    }
  }

  /* ------------------------------------------------------- 八步步進器 ---- */

  function initStepper() {
    var root = document.querySelector('[data-stepper]');
    if (!root) { return; }
    var body = root.querySelector('.stepper-body');
    if (!body) { return; }
    var steps = body.querySelectorAll('[data-step]');
    if (steps.length < 2) { return; }

    var current = 0;

    var controls = document.createElement('div');
    controls.className = 'stepper-controls';

    var prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'btn btn-sm';
    prev.textContent = '← 上一步';

    var next = document.createElement('button');
    next.type = 'button';
    next.className = 'btn btn-sm btn-primary';
    next.textContent = '下一步 →';

    var status = document.createElement('span');
    status.className = 'stepper-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    var showAll = document.createElement('button');
    showAll.type = 'button';
    showAll.className = 'btn btn-sm';
    showAll.setAttribute('aria-pressed', 'false');
    showAll.textContent = '一次看全部';

    controls.appendChild(prev);
    controls.appendChild(next);
    controls.appendChild(status);
    controls.appendChild(showAll);

    var dots = document.createElement('div');
    dots.className = 'stepper-dots';
    var dotBtns = [];
    for (var d = 0; d < steps.length; d++) {
      (function (idx) {
        var dot = document.createElement('button');
        dot.type = 'button';
        dot.className = 'btn btn-sm';
        dot.setAttribute('aria-pressed', 'false');
        dot.setAttribute('aria-label', '跳到步驟 ' + (idx + 1));
        dot.textContent = String(idx + 1);
        dot.addEventListener('click', function () { expanded = false; showAll.setAttribute('aria-pressed', 'false'); show(idx); });
        dots.appendChild(dot);
        dotBtns.push(dot);
      })(d);
    }

    root.insertBefore(controls, body);
    root.insertBefore(dots, body);

    var expanded = false;

    function show(index) {
      current = Math.max(0, Math.min(steps.length - 1, index));
      for (var i = 0; i < steps.length; i++) {
        steps[i].hidden = expanded ? false : (i !== current);
        dotBtns[i].setAttribute('aria-pressed', (!expanded && i === current) ? 'true' : 'false');
      }
      prev.disabled = expanded || current === 0;
      next.disabled = expanded || current === steps.length - 1;
      status.textContent = expanded
        ? '已展開全部 ' + steps.length + ' 個步驟'
        : '步驟 ' + (current + 1) + ' / ' + steps.length;
    }

    prev.addEventListener('click', function () { show(current - 1); });
    next.addEventListener('click', function () { show(current + 1); });
    showAll.addEventListener('click', function () {
      expanded = !expanded;
      showAll.setAttribute('aria-pressed', expanded ? 'true' : 'false');
      showAll.textContent = expanded ? '改成逐步看' : '一次看全部';
      show(current);
    });

    show(0);
  }

  function init() {
    initYChart();
    initStepper();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
