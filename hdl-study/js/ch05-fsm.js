/* ch05-fsm.js — 第 05 章的互動狀態機步進器
   兩台機器：
     lock   = §5.4 的 1011 Mealy 密碼鎖（投影片 p.5）
     recent = §5.7 的 Recent Ones Moore 機（投影片 p.8）
   轉移關係取自投影片的狀態圖；recent 刻意採用狀態圖的正確轉移，
   而不是 p.10 程式中印錯的 case（詳見該小節的說明）。
   傳統 script，無模組、無網路存取。 */
(function () {
  'use strict';

  var MACHINES = {
    lock: {
      type: 'mealy',
      title: '1011 密碼鎖（Mealy）',
      start: '00',
      nodePrefix: 'st-',
      names: { '00': '等 1011', '01': '等 011', '10': '等 11', '11': '等 1' },
      table: {
        '00': { '0': { to: '00', out: 0, edge: 'e-00-0' }, '1': { to: '01', out: 0, edge: 'e-00-1' } },
        '01': { '0': { to: '10', out: 0, edge: 'e-01-0' }, '1': { to: '01', out: 0, edge: 'e-01-1' } },
        '10': { '0': { to: '00', out: 0, edge: 'e-10-0' }, '1': { to: '11', out: 0, edge: 'e-10-1' } },
        '11': { '0': { to: '10', out: 0, edge: 'e-11-0' }, '1': { to: '01', out: 1, edge: 'e-11-1' } }
      },
      hint: '試著餵入 1011011：會成功偵測兩次（可重疊）。'
    },
    recent: {
      type: 'moore',
      title: 'Recent Ones（Moore）',
      start: 'S0',
      nodePrefix: 'st-',
      names: { 'S0': '最近兩位 00', 'S1': '最近兩位 01', 'S2': '最近兩位 10', 'S3': '最近兩位 11' },
      outputs: { 'S0': 0, 'S1': 1, 'S2': 1, 'S3': 2 },
      table: {
        'S0': { '0': { to: 'S0', edge: 'r-S0-0' }, '1': { to: 'S1', edge: 'r-S0-1' } },
        'S1': { '0': { to: 'S2', edge: 'r-S1-0' }, '1': { to: 'S3', edge: 'r-S1-1' } },
        'S2': { '0': { to: 'S0', edge: 'r-S2-0' }, '1': { to: 'S1', edge: 'r-S2-1' } },
        'S3': { '0': { to: 'S2', edge: 'r-S3-0' }, '1': { to: 'S3', edge: 'r-S3-1' } }
      },
      hint: '輸出就是「最近兩個輸入位元裡 1 的個數」。'
    }
  };

  function buildPanel(key) {
    var cfg = MACHINES[key];
    var panel = document.querySelector('[data-fsm-panel="' + key + '"]');
    var figure = document.querySelector('[data-fsm="' + key + '"]');
    if (!cfg || !panel || !figure) { return; }
    var svg = figure.querySelector('svg');
    if (!svg) { return; }

    var state = cfg.start;
    var tape = [];
    var lastOut = (cfg.type === 'moore') ? cfg.outputs[state] : null;
    var hits = 0;

    var controls = document.createElement('div');
    controls.className = 'fsm-controls';

    var readout = document.createElement('div');
    readout.setAttribute('role', 'status');
    readout.setAttribute('aria-live', 'polite');

    function render(lastEdge) {
      var marked = svg.querySelectorAll('.is-now');
      for (var m = 0; m < marked.length; m++) { marked[m].classList.remove('is-now'); }
      var node = svg.querySelector('#' + cfg.nodePrefix + state);
      if (node) { node.classList.add('is-now'); }
      if (lastEdge) {
        var ed = svg.querySelector('#' + lastEdge);
        if (ed) { ed.classList.add('is-now'); }
      }

      var out = (cfg.type === 'moore') ? cfg.outputs[state] : lastOut;
      var tapeText = tape.length ? tape.join(' ') : '（尚未輸入）';
      var parts = [];
      parts.push('<p class="fsm-tape">輸入序列：' + tapeText + '</p>');
      parts.push('<p class="fsm-readout">目前狀態：<strong>' + state + '</strong>（' + cfg.names[state] + '）</p>');
      if (cfg.type === 'moore') {
        parts.push('<p class="fsm-readout">目前輸出 Z = <strong>' + out + '</strong>　（Moore：輸出由現態決定）</p>');
      } else if (out === null) {
        parts.push('<p class="fsm-readout">目前輸出 Z = －　（還沒有任何轉移）</p>');
      } else {
        parts.push('<p class="fsm-readout">上一次轉移的輸出 Z = <strong>' + out + '</strong>'
          + (out === 1 ? '　<span class="fsm-hit">← 偵測到 1011！</span>' : '') + '</p>');
      }
      if (cfg.type === 'mealy') {
        parts.push('<p class="fsm-readout">累計偵測成功次數：<strong>' + hits + '</strong></p>');
      }
      readout.innerHTML = parts.join('');
    }

    function feed(bit) {
      var rule = cfg.table[state][bit];
      if (!rule) { return; }
      tape.push(bit);
      state = rule.to;
      if (cfg.type === 'mealy') {
        lastOut = rule.out;
        if (rule.out === 1) { hits++; }
      }
      render(rule.edge);
      if (window.HDL && typeof window.HDL.announce === 'function') {
        var out = (cfg.type === 'moore') ? cfg.outputs[state] : lastOut;
        window.HDL.announce('輸入 ' + bit + '，進入狀態 ' + state + '，輸出 ' + out);
      }
    }

    function reset() {
      state = cfg.start;
      tape = [];
      hits = 0;
      lastOut = (cfg.type === 'moore') ? cfg.outputs[state] : null;
      render(null);
      if (window.HDL && typeof window.HDL.announce === 'function') {
        window.HDL.announce('已重設到起始狀態 ' + cfg.start);
      }
    }

    function mkBtn(label, cls, handler) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'btn btn-sm' + (cls ? ' ' + cls : '');
      b.textContent = label;
      b.addEventListener('click', handler);
      controls.appendChild(b);
      return b;
    }

    mkBtn('餵入 0', 'btn-primary', function () { feed('0'); });
    mkBtn('餵入 1', 'btn-primary', function () { feed('1'); });
    mkBtn('重設', null, reset);
    mkBtn('自動跑 1011', null, function () {
      reset();
      var seq = '1011'.split('');
      var i = 0;
      (function step() {
        if (i >= seq.length) { return; }
        feed(seq[i]);
        i++;
        window.setTimeout(step, 450);
      })();
    });

    panel.appendChild(controls);
    panel.appendChild(readout);

    var hint = document.createElement('p');
    hint.textContent = '提示：' + cfg.hint;
    panel.appendChild(hint);

    render(null);
  }

  function init() {
    buildPanel('lock');
    buildPanel('recent');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
