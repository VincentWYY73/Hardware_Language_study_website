/* ch01-figs.js — 第 01 章專屬互動圖
   投影片 p.22 的 8 個結構性質 × p.23 的 7 節點閘圖。
   點選性質按鈕後，在 SVG 上高亮對應的節點與邊，並更新說明文字。
   傳統 script，無模組、無網路存取。 */
(function () {
  'use strict';

  var PROPS = [
    {
      key: 'branches',
      label: 'Branches / Fanout',
      zh: '分支與扇出',
      nodes: [],
      edges: ['e-g3-g4', 'e-g3-g5', 'e-g3-g6'],
      note: 'G3 的輸出同時推動三個後繼閘，這三條線就是 branches；一個閘的後繼數量稱為 fanout（此處 G3 的 fanout = 3）。'
    },
    {
      key: 'stem',
      label: 'Stem',
      zh: '主幹',
      nodes: ['n-g3'],
      edges: [],
      note: '扇出大於 1 的那個訊號源稱為 stem（主幹）。本圖中只有 G3 是 stem。'
    },
    {
      key: 'fanout-free',
      label: 'Fanout-free',
      zh: '無扇出區',
      nodes: ['n-g1', 'n-g2'],
      edges: ['e-pi1-g1', 'e-pi2-g1', 'e-pi3-g2', 'e-pi4-g2', 'e-g1-g3', 'e-g2-g3'],
      note: 'G1 與 G2 的輸出都只接到一個後繼（fanout = 1），所以從主要輸入到 G3 這一段是 fanout-free 區域。這種區域的測試與分析最單純。'
    },
    {
      key: 'reconvergent',
      label: 'Reconvergent Fanout',
      zh: '重匯合扇出',
      nodes: ['n-g3', 'n-g5', 'n-g6', 'n-g7'],
      edges: ['e-g3-g5', 'e-g3-g6', 'e-g5-g7', 'e-g6-g7'],
      note: '由 G3 分出的兩條路徑（經 G5 與經 G6）在 G7 再度匯合，稱為 reconvergent fanout。它是突波 (hazard) 與測試困難的主要來源。'
    },
    {
      key: 'gate-type',
      label: 'Gate Type',
      zh: '閘型別',
      nodes: ['n-g1', 'n-g2', 'n-g3', 'n-g4', 'n-g5', 'n-g6', 'n-g7'],
      edges: [],
      note: '每個節點都帶有自己的閘型別（AND、OR、NAND、NOR、NOT …）。投影片 p.23 的圖只畫出拓樸，未標出各節點的型別。'
    },
    {
      key: 'inversion',
      label: 'Inversion',
      zh: '反相',
      nodes: ['n-g1', 'n-g2', 'n-g3', 'n-g4', 'n-g5', 'n-g6', 'n-g7'],
      edges: [],
      note: '每個閘是否會把訊號反相，是一個獨立的結構性質（NAND、NOR、NOT 會反相；AND、OR 不會）。'
    },
    {
      key: 'parity',
      label: 'Inversion Parity',
      zh: '反相同位',
      nodes: ['n-g3', 'n-g5', 'n-g7'],
      edges: ['e-g3-g5', 'e-g5-g7'],
      note: '沿著一條路徑把反相次數加總後取奇偶，稱為 inversion parity。圖中高亮的是 G3 → G5 → G7 這條路徑；同一對節點之間若有兩條 parity 不同的路徑，就容易產生突波。'
    },
    {
      key: 'level',
      label: 'Level of a Gate',
      zh: '閘的層級',
      nodes: ['n-g1', 'n-g2', 'n-g3', 'n-g4', 'n-g5', 'n-g6', 'n-g7'],
      edges: [],
      note: '閘的 level 是它與主要輸入的距離。本圖為：G1、G2 在第 1 層；G3 在第 2 層；G4、G5、G6 在第 3 層；G7 在第 4 層。level 決定了關鍵路徑長度。'
    }
  ];

  function clearHighlight(root) {
    var marked = root.querySelectorAll('.is-hl');
    for (var i = 0; i < marked.length; i++) {
      marked[i].classList.remove('is-hl');
    }
  }

  function init() {
    var btnBox = document.querySelector('[data-struct-btns]');
    var note = document.querySelector('[data-struct-note]');
    var fig = document.querySelector('.fig-struct');
    if (!btnBox || !note || !fig) { return; }

    var buttons = [];

    function select(index) {
      var prop = PROPS[index];
      clearHighlight(fig);
      var ids = prop.nodes.concat(prop.edges);
      for (var i = 0; i < ids.length; i++) {
        var el = fig.querySelector('#' + ids[i]);
        if (el) { el.classList.add('is-hl'); }
      }
      for (var b = 0; b < buttons.length; b++) {
        buttons[b].setAttribute('aria-pressed', b === index ? 'true' : 'false');
      }
      note.textContent = prop.label + '（' + prop.zh + '）：' + prop.note;
      if (window.HDL && typeof window.HDL.announce === 'function') {
        window.HDL.announce('已選擇結構性質：' + prop.label + '。' + prop.note);
      }
    }

    for (var i = 0; i < PROPS.length; i++) {
      (function (idx) {
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'btn btn-sm';
        btn.setAttribute('aria-pressed', 'false');
        btn.textContent = PROPS[idx].label;
        btn.addEventListener('click', function () { select(idx); });
        btnBox.appendChild(btn);
        buttons.push(btn);
      })(i);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
