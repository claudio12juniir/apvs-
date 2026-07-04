(function () {
  'use strict';

  var WHATSAPP_NUMBER = '5511961718624';

  /* ===== Header scroll state + mobile nav ===== */
  var header = document.getElementById('header');
  var navToggle = document.getElementById('navToggle');
  var mobileCtaBar = document.getElementById('mobileCtaBar');
  var cotacaoSection = document.getElementById('cotacao');

  function updateMobileCtaBar() {
    if (!mobileCtaBar || !cotacaoSection) return;
    var rect = cotacaoSection.getBoundingClientRect();
    var formInView = rect.top < window.innerHeight * 0.8 && rect.bottom > window.innerHeight * 0.2;
    mobileCtaBar.classList.toggle('is-hidden', formInView);
  }

  window.addEventListener('scroll', function () {
    header.classList.toggle('scrolled', window.scrollY > 10);
    updateMobileCtaBar();
  });
  updateMobileCtaBar();

  navToggle.addEventListener('click', function () {
    var isOpen = header.classList.toggle('nav-open');
    navToggle.setAttribute('aria-expanded', isOpen);
  });

  document.querySelectorAll('.main-nav a, .header-actions a').forEach(function (link) {
    link.addEventListener('click', function () {
      header.classList.remove('nav-open');
      navToggle.setAttribute('aria-expanded', 'false');
    });
  });

  /* ===== Footer year ===== */
  document.getElementById('year').textContent = new Date().getFullYear();

  /* ===== Scroll reveal ===== */
  var revealEls = document.querySelectorAll('.reveal');
  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(function (el) { observer.observe(el); });

  /* ===== FAQ accordion ===== */
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var question = item.querySelector('.faq-question');
    var answer = item.querySelector('.faq-answer');
    question.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
        if (openItem !== item) {
          openItem.classList.remove('open');
          openItem.querySelector('.faq-answer').style.maxHeight = null;
        }
      });
      item.classList.toggle('open', !isOpen);
      answer.style.maxHeight = !isOpen ? answer.scrollHeight + 'px' : null;
    });
  });

  /* ===== Input masks ===== */
  var idadeInput = document.getElementById('idade');
  var placaInput = document.getElementById('placa');

  idadeInput.addEventListener('input', function (e) { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 3); });
  placaInput.addEventListener('input', function (e) { e.target.value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 7); });

  /* ===== Triagem (single step) ===== */
  var form = document.getElementById('leadForm');
  var steps = Array.prototype.slice.call(form.querySelectorAll('.form-step'));

  function showStep(stepKey) {
    steps.forEach(function (stepEl) {
      stepEl.classList.toggle('active', stepEl.dataset.step === String(stepKey));
    });
  }

  function validateForm() {
    var valid = true;
    var fields = form.querySelectorAll('input[required]');
    fields.forEach(function (field) {
      field.classList.remove('invalid');
      if (field.type === 'radio') {
        var group = form.querySelectorAll('input[name="' + field.name + '"]');
        var checked = Array.prototype.some.call(group, function (r) { return r.checked; });
        if (!checked) valid = false;
        return;
      }
      if (field.type === 'checkbox') {
        if (!field.checked) { valid = false; field.classList.add('invalid'); }
        return;
      }
      if (!field.value.trim()) { valid = false; field.classList.add('invalid'); return; }
      if (field.id === 'idade') {
        var idade = parseInt(field.value, 10);
        if (isNaN(idade) || idade < 18 || idade > 100) { valid = false; field.classList.add('invalid'); }
      }
      if (field.id === 'placa' && field.value.trim().length < 7) { valid = false; field.classList.add('invalid'); }
    });
    return valid;
  }

  /* ===== Submit -> build WhatsApp message ===== */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    var data = {
      nome: document.getElementById('nome').value.trim(),
      idade: document.getElementById('idade').value.trim(),
      placa: document.getElementById('placa').value.trim(),
      leilao: (form.querySelector('input[name="leilao"]:checked') || {}).value || ''
    };

    var message = [
      'Olá! Vim pelo site da Cláudio Júnior Proteção Veicular e quero uma simulação de proteção veicular.',
      '',
      '👤 Nome: ' + data.nome,
      '🎂 Idade: ' + data.idade,
      '🚗 Placa: ' + data.placa,
      '⚠️ Passagem no leilão: ' + data.leilao,
      '',
      'Aguardo o contato, obrigado!'
    ].join('\n');

    var whatsappUrl = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
    document.getElementById('whatsappFallback').href = whatsappUrl;

    showStep('success');

    window.setTimeout(function () {
      window.open(whatsappUrl, '_blank', 'noopener');
    }, 900);
  });

})();
