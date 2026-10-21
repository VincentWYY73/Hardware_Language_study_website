/* =============================================================
   site.js -- 全站共用行為（傳統 script，無模組、無網路存取）

   提供給各章頁面的 API（全域物件 window.HDL）：
     HDL.chapters                  章節清單 [{id,num,file,title}]
     HDL.getChapter(id)            取得單一章節資料
     HDL.getProgress()             取得整體進度物件
     HDL.getChapterProgress(id)    取得 {done:Boolean, best:Number|null}
     HDL.setChapterDone(id, bool)  設定完成狀態，回傳是否寫入成功
     HDL.recordScore(id, score)    記錄測驗分數（只保留最高分），回傳最佳分數
     HDL.resetProgress()           清除所有進度
     HDL.announce(text)            以 aria-live 宣告一句話給螢幕閱讀器
     HDL.storageWorks              localStorage 是否可用

   頁面上的掛點（屬性）：
     body[data-chapter="chNN"]     本頁所屬章節（首頁與術語表不加）
     [data-toc]                    TOC 容器；內含 <details>
     [data-toc-action="expand|collapse"]   TOC 全部展開 / 全部收起
     [data-pager]                  上下章導覽（由本檔產生內容）
     [data-progress-panel]         章節進度面板（由本檔產生內容）
     [data-chapter-card="chNN"]    首頁章節卡，內含 [data-badge]
     [data-action="toggle-theme"]  深色模式切換
     [data-action="reset-progress"] 重設學習進度（二次確認）
   ============================================================= */

(function (window, document) {
  'use strict';

  var THEME_KEY = 'hdl.theme.v1';
  var PROGRESS_KEY = 'hdl.progress.v1';
  var NARROW = 860;

  var CHAPTERS = [
    { id: 'ch01', num: '01', file: 'ch01-overview.html', title: 'HDL 的全貌 (Overview)' },
    { id: 'ch02', num: '02', file: 'ch02-ychart.html', title: '階層設計與 Y 圖 (Y-chart)' },
    { id: 'ch03', num: '03', file: 'ch03-grammar.html', title: 'Verilog 基本語法 (Basic Grammar)' },
    { id: 'ch04', num: '04', file: 'ch04-asm.html', title: '演算法狀態機 (ASM)' },
    { id: 'ch05', num: '05', file: 'ch05-fsm.html', title: '有限狀態機 (FSM)' }
  ];

  /* ------------------------------------------------ localStorage ---- */

  var storageWorks = false;
  try {
    window.localStorage.setItem('hdl.probe', '1');
    window.localStorage.removeItem('hdl.probe');
    storageWorks = true;
  } catch (e) {
    storageWorks = false;
  }

  function readRaw(key) {
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  function writeRaw(key, value) {
    try {
      window.localStorage.setItem(key, value);
      return true;
    } catch (e) {
      return false;
    }
  }

  function removeRaw(key) {
    try {
      window.localStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }

  /* ------------------------------------------------------ 進度 ------ */

  function getProgress() {
    var raw = readRaw(PROGRESS_KEY);
    if (!raw) { return {}; }
    try {
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') { return parsed; }
      return {};
    } catch (e) {
      return {};
    }
  }

  function saveProgress(progress) {
    try {
      return writeRaw(PROGRESS_KEY, JSON.stringify(progress));
    } catch (e) {
      return false;
    }
  }

  function getChapterProgress(id) {
    var entry = getProgress()[id];
    var done = !!(entry && entry.done);
    var best = (entry && typeof entry.best === 'number') ? entry.best : null;
    return { done: done, best: best };
  }

  function setChapterDone(id, done) {
    var progress = getProgress();
    if (!progress[id] || typeof progress[id] !== 'object') { progress[id] = {}; }
    progress[id].done = !!done;
    var ok = saveProgress(progress);
    refreshProgressUI();
    return ok;
  }

  function recordScore(id, score) {
    var value = Math.round(Number(score));
    if (isNaN(value)) { return getChapterProgress(id).best; }
    var progress = getProgress();
    if (!progress[id] || typeof progress[id] !== 'object') { progress[id] = {}; }
    var prev = (typeof progress[id].best === 'number') ? progress[id].best : -1;
    if (value > prev) { progress[id].best = value; }
    saveProgress(progress);
    refreshProgressUI();
    return progress[id].best;
  }

  function resetProgress() {
    var ok = removeRaw(PROGRESS_KEY);
    refreshProgressUI();
    return ok;
  }

  function getChapter(id) {
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].id === id) { return CHAPTERS[i]; }
    }
    return null;
  }

  function currentChapterId() {
    return (document.body && document.body.getAttribute('data-chapter')) || null;
  }

  /* -------------------------------------------------- 主題切換 ------ */

  function storedTheme() {
    var value = readRaw(THEME_KEY);
    return (value === 'dark' || value === 'light') ? value : null;
  }

  function currentTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
  }

  function applyTheme(theme) {
    var value = (theme === 'dark') ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', value);
    var buttons = document.querySelectorAll('[data-action="toggle-theme"]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', value === 'dark' ? 'true' : 'false');
      var label = buttons[i].querySelector('[data-theme-label]');
      var text = (value === 'dark') ? '深色模式：開' : '深色模式：關';
      if (label) { label.textContent = text; } else { buttons[i].textContent = text; }
    }
  }

  // 在 <head> 載入時立刻套用，避免切換時閃一下白底
  applyTheme(storedTheme() || 'light');

  /* ------------------------------------------------ aria-live ------- */

  var liveRegion = null;

  function announce(text) {
    if (!liveRegion) {
      liveRegion = document.getElementById('hdl-live');
      if (!liveRegion) {
        liveRegion = document.createElement('div');
        liveRegion.id = 'hdl-live';
        liveRegion.className = 'visually-hidden';
        liveRegion.setAttribute('aria-live', 'polite');
        liveRegion.setAttribute('role', 'status');
        document.body.appendChild(liveRegion);
      }
    }
    liveRegion.textContent = '';
    // 先清空再寫入，確保重複的訊息也會被宣告
    window.setTimeout(function () { liveRegion.textContent = text; }, 30);
  }

  /* ----------------------------------------------------- TOC -------- */

  function setupToc() {
    var tocs = document.querySelectorAll('[data-toc]');
    for (var i = 0; i < tocs.length; i++) {
      var toc = tocs[i];
      var groups = toc.querySelectorAll('details');
      if (window.innerWidth <= NARROW) {
        for (var g = 0; g < groups.length; g++) { groups[g].open = false; }
      }
    }

    var buttons = document.querySelectorAll('[data-toc-action]');
    for (var b = 0; b < buttons.length; b++) {
      buttons[b].addEventListener('click', function (ev) {
        var action = ev.currentTarget.getAttribute('data-toc-action');
        var scope = ev.currentTarget.closest ? ev.currentTarget.closest('[data-toc]') : null;
        if (!scope) { scope = document.querySelector('[data-toc]'); }
        if (!scope) { return; }
        var items = scope.querySelectorAll('details');
        for (var k = 0; k < items.length; k++) { items[k].open = (action === 'expand'); }
        announce(action === 'expand' ? '目錄已全部展開' : '目錄已全部收起');
      });
    }
  }

  /* -------------------------------------------------- 上下章導覽 ---- */

  function pagerLink(href, labelText, title) {
    var a = document.createElement('a');
    a.href = href;
    var label = document.createElement('span');
    label.className = 'pager-label';
    label.textContent = labelText;
    a.appendChild(label);
    a.appendChild(document.createTextNode(title));
    return a;
  }

  function setupPager() {
    var holders = document.querySelectorAll('[data-pager]');
    if (!holders.length) { return; }
    var id = currentChapterId();
    var index = -1;
    for (var i = 0; i < CHAPTERS.length; i++) {
      if (CHAPTERS[i].id === id) { index = i; }
    }
    for (var h = 0; h < holders.length; h++) {
      var holder = holders[h];
      holder.textContent = '';
      holder.setAttribute('aria-label', '上下章導覽');
      if (index <= 0) {
        holder.appendChild(pagerLink('index.html', '回到', '課程首頁'));
      } else {
        holder.appendChild(pagerLink(CHAPTERS[index - 1].file, '上一章',
          CHAPTERS[index - 1].num + ' ' + CHAPTERS[index - 1].title));
      }
      if (index >= 0 && index < CHAPTERS.length - 1) {
        holder.appendChild(pagerLink(CHAPTERS[index + 1].file, '下一章',
          CHAPTERS[index + 1].num + ' ' + CHAPTERS[index + 1].title));
      } else {
        holder.appendChild(pagerLink('glossary.html', '接著看', '全站術語表'));
      }
    }
  }

  /* -------------------------------------------------- 進度面板 ------ */

  function setupProgressPanels() {
    var panels = document.querySelectorAll('[data-progress-panel]');
    var id = currentChapterId();
    for (var i = 0; i < panels.length; i++) {
      var panel = panels[i];
      var chapter = getChapter(id);
      if (!chapter) { continue; }
      panel.textContent = '';
      panel.className = 'progress-panel';

      var heading = document.createElement('h2');
      heading.textContent = '本章學習進度';
      panel.appendChild(heading);

      var row = document.createElement('div');
      row.className = 'row';

      var box = document.createElement('input');
      box.type = 'checkbox';
      box.id = 'chapter-done-' + chapter.id;
      box.setAttribute('data-chapter-done', chapter.id);

      var label = document.createElement('label');
      label.setAttribute('for', box.id);
      label.textContent = '我已讀完本章';

      var best = document.createElement('span');
      best.className = 'badge';
      best.setAttribute('data-best', chapter.id);

      row.appendChild(box);
      row.appendChild(label);
      row.appendChild(best);
      panel.appendChild(row);

      var note = document.createElement('p');
      note.className = 'progress-note';
      note.textContent = storageWorks
        ? '進度與測驗分數只存在這台電腦的瀏覽器（localStorage），不會上傳到任何地方。'
        : '此瀏覽器不允許儲存本機資料，進度無法保存，但其他功能都能正常使用。';
      panel.appendChild(note);

      box.disabled = !storageWorks;
      box.addEventListener('change', function (ev) {
        var chapterId = ev.currentTarget.getAttribute('data-chapter-done');
        setChapterDone(chapterId, ev.currentTarget.checked);
        announce(ev.currentTarget.checked ? '已標記本章完成' : '已取消本章完成標記');
      });
    }
  }

  /* ------------------------------------------- 進度相關 UI 更新 ---- */

  function refreshProgressUI() {
    var progress = getProgress();

    var cards = document.querySelectorAll('[data-chapter-card]');
    for (var i = 0; i < cards.length; i++) {
      var cardId = cards[i].getAttribute('data-chapter-card');
      var badge = cards[i].querySelector('[data-badge]');
      if (!badge) { continue; }
      var entry = progress[cardId] || {};
      var hasScore = (typeof entry.best === 'number');
      badge.className = 'badge';
      if (entry.done) {
        badge.classList.add('is-done');
        badge.textContent = hasScore ? '✔ 已完成 ・ 最佳 ' + entry.best + ' 分' : '✔ 已完成';
      } else if (hasScore) {
        badge.classList.add('has-score');
        badge.textContent = '進行中 ・ 最佳 ' + entry.best + ' 分';
      } else {
        badge.textContent = '尚未開始';
      }
    }

    var boxes = document.querySelectorAll('[data-chapter-done]');
    for (var b = 0; b < boxes.length; b++) {
      var boxId = boxes[b].getAttribute('data-chapter-done');
      boxes[b].checked = !!(progress[boxId] && progress[boxId].done);
    }

    var bests = document.querySelectorAll('[data-best]');
    for (var k = 0; k < bests.length; k++) {
      var bestId = bests[k].getAttribute('data-best');
      var bestEntry = progress[bestId] || {};
      if (typeof bestEntry.best === 'number') {
        bests[k].className = 'badge has-score';
        bests[k].textContent = '最佳測驗分數：' + bestEntry.best + ' 分';
      } else {
        bests[k].className = 'badge';
        bests[k].textContent = '最佳測驗分數：尚未測驗';
      }
    }
  }

  /* ------------------------------------------------- 重設進度 ------ */

  function setupResetButtons() {
    var buttons = document.querySelectorAll('[data-action="reset-progress"]');
    for (var i = 0; i < buttons.length; i++) {
      var button = buttons[i];
      button.setAttribute('data-reset-label', button.textContent);
      button.addEventListener('click', function (ev) {
        var btn = ev.currentTarget;
        if (btn.getAttribute('data-armed') === 'true') {
          window.clearTimeout(Number(btn.getAttribute('data-timer')) || 0);
          btn.removeAttribute('data-armed');
          btn.textContent = btn.getAttribute('data-reset-label');
          var ok = resetProgress();
          announce(ok ? '學習進度已全部清除' : '清除進度失敗，瀏覽器不允許存取本機儲存空間');
          var status = document.querySelector('[data-reset-status]');
          if (status) {
            status.textContent = ok ? '學習進度已全部清除。' : '清除失敗：此瀏覽器不允許存取本機儲存空間。';
          }
          return;
        }
        btn.setAttribute('data-armed', 'true');
        btn.textContent = '確定要清除？再按一次確認';
        announce('再按一次即會清除所有章節的完成狀態與測驗分數');
        var timer = window.setTimeout(function () {
          btn.removeAttribute('data-armed');
          btn.textContent = btn.getAttribute('data-reset-label');
        }, 6000);
        btn.setAttribute('data-timer', String(timer));
      });
    }
  }

  /* ------------------------------------------------- 主題按鈕 ------ */

  function setupThemeButtons() {
    var buttons = document.querySelectorAll('[data-action="toggle-theme"]');
    for (var i = 0; i < buttons.length; i++) {
      buttons[i].addEventListener('click', function () {
        var next = (currentTheme() === 'dark') ? 'light' : 'dark';
        applyTheme(next);
        writeRaw(THEME_KEY, next);
        announce(next === 'dark' ? '已切換為深色模式' : '已切換為淺色模式');
      });
    }
    applyTheme(currentTheme());
  }

  /* ----------------------------------------------------- 啟動 ------ */

  function init() {
    setupThemeButtons();
    setupToc();
    setupPager();
    setupProgressPanels();
    setupResetButtons();
    refreshProgressUI();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HDL = {
    chapters: CHAPTERS,
    getChapter: getChapter,
    getProgress: getProgress,
    getChapterProgress: getChapterProgress,
    setChapterDone: setChapterDone,
    recordScore: recordScore,
    resetProgress: resetProgress,
    announce: announce,
    refreshProgressUI: refreshProgressUI,
    storageWorks: storageWorks
  };
}(window, document));
