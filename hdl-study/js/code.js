/* =============================================================
   code.js -- 程式碼區塊的複製按鈕與自寫關鍵字 highlight

   頁面寫法（章節頁只要寫這樣，其餘由本檔處理）：

     <div class="codeblock" data-title="投影片 p.8 的 Verilog 片段">
       <pre><code data-lang="verilog">...照抄的原文...</code></pre>
     </div>

   data-lang 可為 verilog | c | asm | spice | text（text 不上色）。
   沒有外層 .codeblock 時本檔會自動補上。

   重要：highlight 一律以 code 元素的 textContent 為輸入，先轉義 & < >
   再組字串，所以投影片原文的全形引號、Tab、大小寫瑕疵都會原樣保留；
   複製按鈕複製的也是轉成 HTML 之前的原始文字。
   ============================================================= */

(function (window, document) {
  'use strict';

  var LANG_LABEL = {
    verilog: 'Verilog',
    c: 'C',
    asm: '組合語言',
    spice: 'SPICE netlist',
    text: '文字'
  };

  var VERILOG_KEYWORDS = ('module endmodule input output inout wire reg integer real time ' +
    'parameter localparam defparam assign always initial begin end case casex casez endcase ' +
    'if else for repeat while forever generate endgenerate genvar function endfunction ' +
    'task endtask specify endspecify posedge negedge edge wait disable force release ' +
    'and or not nand nor xor xnor buf bufif0 bufif1 notif0 notif1 nmos pmos cmos rnmos rpmos ' +
    'tran tranif0 tranif1 rtran pullup pulldown supply0 supply1 strong0 strong1 weak0 weak1 ' +
    'highz0 highz1 primitive table endtable config endconfig signed unsigned default ' +
    'fork join event tri triand trior trireg scalared vectored small medium large ' +
    'macromodule specparam deassign').split(' ');

  var C_KEYWORDS = ('auto break case char const continue default do double else enum extern ' +
    'float for goto if inline int long register return short signed sizeof static struct ' +
    'switch typedef union unsigned void volatile while bool true false main printf scanf ' +
    'putchar getchar malloc free exit').split(' ');

  var ASM_KEYWORDS = ('mov movb movw add adc sub sbb mul imul div idiv and or xor not neg ' +
    'shl shr sal sar rol ror rcl rcr cmp test inc dec push pop call ret jmp je jne jz jnz ' +
    'jc jnc ja jae jb jbe jg jge jl jle loop nop int iret cld std lodsb stosb org db dw dd ' +
    'equ end proc endp segment ends assume lea').split(' ');

  function toSet(list) {
    var set = {};
    for (var i = 0; i < list.length; i++) { set[list[i]] = true; }
    return set;
  }

  var SETS = {
    verilog: toSet(VERILOG_KEYWORDS),
    c: toSet(C_KEYWORDS),
    asm: toSet(ASM_KEYWORDS),
    spice: toSet(('ac dc tran op model subckt ends end include lib print plot options ' +
      'measure param global save ic nodeset').split(' '))
  };

  function esc(text) {
    return String(text)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function span(className, text) {
    return '<span class="' + className + '">' + esc(text) + '</span>';
  }

  /* 依語言組出一條總表達式。群組順序固定：
     1 區塊註解 / 2 行註解 / 3 字串 / 4 編譯指令 / 5 系統函式 /
     6 帶基底的數值常數（含全形引號） / 7 一般數值 / 8 識別字 */
  function buildPattern(lang) {
    var blockComment = '(\\/\\*[\\s\\S]*?\\*\\/)';
    var lineComment;
    if (lang === 'asm') {
      lineComment = '((?:;|\\/\\/)[^\\n]*)';
    } else if (lang === 'spice') {
      lineComment = '(^[ \\t]*\\*[^\\n]*)';
    } else {
      lineComment = '(\\/\\/[^\\n]*)';
    }
    var str = '("(?:\\\\[\\s\\S]|[^"\\\\\\n])*")';
    var directive = (lang === 'c') ? '(#[A-Za-z_][A-Za-z0-9_]*)' : '(`[A-Za-z_][A-Za-z0-9_]*)';
    var sysTask = '(\\$[A-Za-z_][A-Za-z0-9_]*)';
    var based = '((?:\\d+)?[\'\u2019\u2018][sS]?[bBoOdDhHxX][0-9a-fA-FxXzZ?_]+)';
    var number = '(\\b\\d+(?:\\.\\d+)?\\b)';
    var ident = '([A-Za-z_][A-Za-z0-9_]*)';
    return [blockComment, lineComment, str, directive, sysTask, based, number, ident].join('|');
  }

  var patternCache = {};

  function highlight(text, lang) {
    if (lang === 'text') { return esc(text); }
    if (!patternCache[lang]) { patternCache[lang] = buildPattern(lang); }
    var re = new RegExp(patternCache[lang], 'gm');
    var keywords = SETS[lang] || {};
    var out = '';
    var last = 0;
    var m;
    while ((m = re.exec(text)) !== null) {
      if (m[0].length === 0) { re.lastIndex++; continue; }
      if (m.index > last) { out += esc(text.slice(last, m.index)); }
      if (m[1] || m[2]) {
        out += span('tok-com', m[0]);
      } else if (m[3]) {
        out += span('tok-str', m[0]);
      } else if (m[4] || m[5]) {
        out += span('tok-sys', m[0]);
      } else if (m[6] || m[7]) {
        out += span('tok-num', m[0]);
      } else if (m[8]) {
        if (keywords[m[8]] || keywords[m[8].toLowerCase()]) {
          out += span('tok-kw', m[0]);
        } else {
          out += esc(m[0]);
        }
      } else {
        out += esc(m[0]);
      }
      last = m.index + m[0].length;
    }
    out += esc(text.slice(last));
    return out;
  }

  function copyWithFallback(text, onDone) {
    var done = false;
    function finish(ok) {
      if (done) { return; }
      done = true;
      onDone(ok);
    }
    function legacy() {
      var area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', 'readonly');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      var ok = false;
      try {
        ok = document.execCommand('copy');
      } catch (e) {
        ok = false;
      }
      document.body.removeChild(area);
      finish(ok);
    }
    if (window.navigator && window.navigator.clipboard && window.navigator.clipboard.writeText) {
      try {
        window.navigator.clipboard.writeText(text).then(function () {
          finish(true);
        }, function () {
          legacy();
        });
        return;
      } catch (e) {
        legacy();
        return;
      }
    }
    legacy();
  }

  function enhance(codeEl, index) {
    if (codeEl.getAttribute('data-code-ready') === 'true') { return; }
    var pre = codeEl.parentNode;
    if (!pre || pre.tagName.toLowerCase() !== 'pre') { return; }

    var lang = (codeEl.getAttribute('data-lang') || 'text').toLowerCase();
    if (!LANG_LABEL[lang]) { lang = 'text'; }
    var raw = codeEl.textContent;

    var block = pre.parentNode;
    if (!block || block.className.indexOf('codeblock') === -1) {
      var wrapper = document.createElement('div');
      wrapper.className = 'codeblock';
      pre.parentNode.insertBefore(wrapper, pre);
      wrapper.appendChild(pre);
      block = wrapper;
    }

    var title = block.getAttribute('data-title') || '';

    var bar = document.createElement('div');
    bar.className = 'codeblock-bar';

    var label = document.createElement('span');
    label.className = 'codeblock-title';
    label.textContent = title ? title : LANG_LABEL[lang];
    bar.appendChild(label);

    var tools = document.createElement('div');
    tools.className = 'codeblock-tools';

    var langTag = document.createElement('span');
    langTag.textContent = title ? LANG_LABEL[lang] : '';
    tools.appendChild(langTag);

    var status = document.createElement('span');
    status.className = 'copy-status';
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');

    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-sm';
    button.textContent = '複製';
    button.setAttribute('aria-label', '複製程式碼' + (title ? '：' + title : ''));
    button.addEventListener('click', function () {
      copyWithFallback(raw, function (ok) {
        status.className = 'copy-status ' + (ok ? 'ok' : 'err');
        status.textContent = ok ? '已複製' : '複製失敗';
        window.setTimeout(function () {
          status.textContent = '';
          status.className = 'copy-status';
        }, 2500);
      });
    });

    tools.appendChild(status);
    tools.appendChild(button);
    bar.appendChild(tools);
    block.insertBefore(bar, pre);

    // 鍵盤可以水平捲動長程式碼
    pre.setAttribute('tabindex', '0');
    pre.setAttribute('role', 'group');
    pre.setAttribute('aria-label', (title ? title + ' ' : '') + LANG_LABEL[lang] + ' 程式碼，可用方向鍵捲動');

    codeEl.innerHTML = highlight(raw, lang);
    codeEl.setAttribute('data-code-ready', 'true');
    if (!codeEl.id) { codeEl.id = 'code-' + (index + 1); }
  }

  function init() {
    var blocks = document.querySelectorAll('pre > code[data-lang]');
    for (var i = 0; i < blocks.length; i++) { enhance(blocks[i], i); }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HDL_CODE = { highlight: highlight, init: init };
}(window, document));
