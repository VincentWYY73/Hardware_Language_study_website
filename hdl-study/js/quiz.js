/* =============================================================
   quiz.js -- 自我測驗引擎（傳統 script，資料來自全域變數）

   題庫由各章的 js\chNN-quiz.js 以全域變數提供，必須在本檔之前載入：

     window.HDL_QUIZ = {
       chapter: 'ch01',
       questions: [
         {
           id: 'ch01-q1',
           type: 'single',              // 'single' 單選 | 'tf' 是非
           stem: '題目敘述',
           options: ['選項 A', '選項 B', '選項 C', '選項 D'],
           answer: 2,                   // 0-based 索引（'tf' 也可用 true/false）
           explain: '解析文字',
           src: '投影片 p.8'            // 出處，顯示為 .srcref 標籤
         }
       ]
     };

   'tf' 題可以省略 options，預設為 ['是', '否']，answer 用 true/false 或 0/1。

   頁面上的掛點：<div class="quiz" data-quiz-root></div>
   （章節頁的「自我測驗」小節放一個空的 data-quiz-root 容器即可。）
   ============================================================= */

(function (window, document) {
  'use strict';

  var TF_OPTIONS = ['是', '否'];

  function el(tag, className, text) {
    var node = document.createElement(tag);
    if (className) { node.className = className; }
    if (text !== undefined && text !== null) { node.textContent = text; }
    return node;
  }

  function optionsOf(question) {
    if (question.options && question.options.length) { return question.options; }
    if (question.type === 'tf') { return TF_OPTIONS.slice(); }
    return [];
  }

  function answerIndexOf(question) {
    var answer = question.answer;
    if (typeof answer === 'boolean') { return answer ? 0 : 1; }
    if (typeof answer === 'number') { return answer; }
    var options = optionsOf(question);
    for (var i = 0; i < options.length; i++) {
      if (options[i] === answer) { return i; }
    }
    return -1;
  }

  function buildQuestion(question, index) {
    var name = 'hdl-q-' + index;
    var box = el('fieldset');
    box.setAttribute('data-q', String(index));

    var legend = el('legend');
    legend.appendChild(el('span', 'q-no', '第 ' + (index + 1) + ' 題'));
    legend.appendChild(document.createTextNode(question.stem || ''));
    if (question.src) {
      legend.appendChild(el('span', 'srcref', question.src));
    }
    box.appendChild(legend);

    var options = optionsOf(question);
    for (var i = 0; i < options.length; i++) {
      var row = el('div', 'opt');
      var input = document.createElement('input');
      input.type = 'radio';
      input.name = name;
      input.id = name + '-o' + i;
      input.value = String(i);
      var label = el('label', null, options[i]);
      label.setAttribute('for', input.id);
      row.appendChild(input);
      row.appendChild(label);
      box.appendChild(row);
    }

    var feedback = el('div', 'quiz-feedback');
    feedback.hidden = true;
    box.appendChild(feedback);

    return box;
  }

  function selectedIndex(index) {
    var inputs = document.getElementsByName('hdl-q-' + index);
    for (var i = 0; i < inputs.length; i++) {
      if (inputs[i].checked) { return Number(inputs[i].value); }
    }
    return -1;
  }

  function lockInputs(form, locked) {
    var inputs = form.querySelectorAll('input[type="radio"]');
    for (var i = 0; i < inputs.length; i++) { inputs[i].disabled = locked; }
  }

  function render(root, data) {
    root.textContent = '';
    root.classList.add('quiz');

    var questions = (data && data.questions) ? data.questions : [];
    if (!questions.length) {
      root.appendChild(el('p', 'quiz-empty', '本章的題庫尚未載入。'));
      return;
    }

    var form = el('form', 'quiz-form');
    form.setAttribute('novalidate', 'novalidate');

    for (var i = 0; i < questions.length; i++) {
      form.appendChild(buildQuestion(questions[i], i));
    }

    var row = el('div', 'btn-row');
    var submit = el('button', 'btn btn-primary', '送出答案');
    submit.type = 'submit';
    var retry = el('button', 'btn', '再試一次');
    retry.type = 'button';
    retry.hidden = true;
    row.appendChild(submit);
    row.appendChild(retry);
    form.appendChild(row);

    var result = el('div', 'quiz-result');
    result.setAttribute('role', 'status');
    result.setAttribute('aria-live', 'polite');
    result.hidden = true;

    root.appendChild(form);
    root.appendChild(result);

    form.addEventListener('submit', function (ev) {
      ev.preventDefault();
      grade(root, data, form, result, submit, retry);
    });

    retry.addEventListener('click', function () {
      render(root, data);
      var first = root.querySelector('input[type="radio"]');
      if (first) { first.focus(); }
      if (window.HDL && window.HDL.announce) { window.HDL.announce('測驗已重設，可以重新作答'); }
    });
  }

  function grade(root, data, form, result, submit, retry) {
    var questions = data.questions;
    var correctCount = 0;
    var unanswered = 0;

    for (var i = 0; i < questions.length; i++) {
      var question = questions[i];
      var box = form.querySelector('fieldset[data-q="' + i + '"]');
      var feedback = box.querySelector('.quiz-feedback');
      var options = optionsOf(question);
      var right = answerIndexOf(question);
      var picked = selectedIndex(i);

      box.classList.remove('is-correct', 'is-wrong');
      feedback.textContent = '';
      feedback.hidden = false;

      var verdict = el('p', 'quiz-verdict');
      if (picked === right && picked >= 0) {
        correctCount++;
        box.classList.add('is-correct');
        verdict.textContent = '✔ 正確';
      } else {
        box.classList.add('is-wrong');
        if (picked < 0) {
          unanswered++;
          verdict.textContent = '✘ 錯誤（未作答）';
        } else {
          verdict.textContent = '✘ 錯誤';
        }
      }
      feedback.appendChild(verdict);

      if (right >= 0 && options[right] !== undefined) {
        feedback.appendChild(el('p', 'quiz-answer', '正確答案：' + options[right]));
      }
      if (question.explain) {
        feedback.appendChild(el('p', 'quiz-explain', '解析：' + question.explain));
      }
      if (question.src) {
        var srcLine = el('p', 'quiz-answer');
        srcLine.appendChild(document.createTextNode('出處：'));
        srcLine.appendChild(el('span', 'srcref', question.src));
        feedback.appendChild(srcLine);
      }
    }

    var total = questions.length;
    var score = Math.round((correctCount / total) * 100);
    var summary = '答對 ' + correctCount + ' / ' + total + ' 題，得分 ' + score + ' 分。';
    if (unanswered > 0) { summary += '（其中 ' + unanswered + ' 題未作答）'; }

    var best = null;
    if (data.chapter && window.HDL && window.HDL.recordScore) {
      best = window.HDL.recordScore(data.chapter, score);
    }
    if (typeof best === 'number') { summary += ' 本章最佳成績：' + best + ' 分。'; }

    result.textContent = summary;
    result.hidden = false;

    lockInputs(form, true);
    submit.disabled = true;
    retry.hidden = false;
    retry.focus();
  }

  function init() {
    var roots = document.querySelectorAll('[data-quiz-root]');
    if (!roots.length) { return; }
    for (var i = 0; i < roots.length; i++) {
      render(roots[i], window.HDL_QUIZ);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.HDL_QUIZ_ENGINE = { render: render };
}(window, document));
