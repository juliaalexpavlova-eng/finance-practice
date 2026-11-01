(() => {
  'use strict';
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#nav');
  if (menu && nav) {
    const close = () => { menu.setAttribute('aria-expanded', 'false'); nav.classList.remove('is-open'); };
    menu.addEventListener('click', () => { const isOpen = menu.getAttribute('aria-expanded') === 'true'; menu.setAttribute('aria-expanded', String(!isOpen)); nav.classList.toggle('is-open', !isOpen); });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') { close(); menu.focus(); } });
    document.addEventListener('click', event => { if (!event.target.closest('.header')) close(); });
  }

  const form = document.querySelector('#brief-form');
  if (!form) return;
  const service = document.querySelector('#service');
  const question = document.querySelector('#problem');
  const prompt = document.querySelector('#problem-label');
  const hint = document.querySelector('#problem-hint');
  const result = document.querySelector('#brief-result');
  const output = document.querySelector('#brief-output');
  const status = document.querySelector('#copy-status');
  const emailLink = document.querySelector('#email-brief');
  const config = {
    training: { name: 'Корпоративный тренинг', label: 'Какая задача стоит перед командой?', hint: 'Кто участвует, какие решения принимает, что должно стать проще после обучения.', fields: 'Аудитория и число участников: \nПример рабочей ситуации: \nНужен вводный курс или практический модуль: ' },
    advisory: { name: 'Финансовая диагностика / советническая работа', label: 'Какой финансовый вопрос нужно решить?', hint: 'Например, понять расхождение прибыли и денег или обосновать управленческое решение.', fields: 'Кто принимает решение: \nКакие отчеты уже есть: \nОжидаемый документ или вывод: ' },
    ai: { name: 'Обсуждение сценария ИИ в финансах', label: 'Какой процесс хотите проверить?', hint: 'Повторяющееся действие, входные данные и желаемый результат. Достаточно общего описания.', fields: 'Повторяющееся действие: \nКто проверяет результат: \nОграничения среды и данных: ' },
    unsure: { name: 'Помощь с выбором формата', label: 'Какую задачу вы хотели бы обсудить?', hint: 'Опишите ситуацию и решение, которое нужно принять.', fields: 'Что уже пробовали: \nКакой результат был бы полезен: ' }
  };
  const setService = value => {
    service.value = Object.hasOwn(config, value) ? value : 'unsure';
    const item = config[service.value];
    prompt.textContent = item.label + ' *';
    hint.textContent = item.hint;
    document.querySelectorAll('[data-service]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.service === service.value)));
  };
  setService(new URLSearchParams(location.search).get('service') || 'unsure');
  service.addEventListener('change', () => { setService(service.value); result.hidden = true; });
  document.querySelectorAll('[data-service]').forEach(button => button.addEventListener('click', () => { setService(button.dataset.service); result.hidden = true; }));
  const buildBrief = () => {
    const values = new FormData(form);
    const item = config[service.value];
    return 'Юлия, здравствуйте!\n\nХочу обсудить: ' + item.name + '.\n\nЗадача:\n' + String(values.get('problem')).trim() + '\n\nКомпания / отрасль: ' + (String(values.get('company')).trim() || 'уточним') + '\nЖелаемый срок: ' + values.get('timing') + '\nБюджетный ориентир: ' + (String(values.get('budget')).trim() || 'обсудим после определения объема') + '\n\n' + item.fields + '\n\nМеня зовут: ' + (String(values.get('name')).trim() || 'уточним при знакомстве') + '\nКонтакт для ответа: ' + (String(values.get('reply')).trim() || 'в этом канале') + '\n\nПредлагаю сначала определить, подходит ли ваш формат моей задаче.';
  };
  const refreshEmail = () => { emailLink.href = 'mailto:julia.alex.pavlova@gmail.com?subject=' + encodeURIComponent('Запрос: ' + config[service.value].name) + '&body=' + encodeURIComponent(output.value); };
  form.addEventListener('submit', event => {
    event.preventDefault();
    question.setCustomValidity(question.value.trim().length < 15 ? 'Опишите задачу чуть подробнее: минимум 15 символов.' : '');
    if (!form.reportValidity()) return;
    output.value = buildBrief();
    refreshEmail();
    result.hidden = false;
    status.textContent = 'Бриф готов. Его можно отредактировать и передать Юлии.';
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    output.focus({ preventScroll: true });
  });
  question.addEventListener('input', () => question.setCustomValidity(''));
  form.addEventListener('input', event => { if (event.target !== output && !result.hidden) { result.hidden = true; status.textContent = ''; } });
  output.addEventListener('input', refreshEmail);
  document.querySelector('#copy-brief').addEventListener('click', async () => {
    try { await navigator.clipboard.writeText(output.value); status.textContent = 'Бриф скопирован. Вставьте его в сообщение Юлии.'; }
    catch { output.focus(); output.select(); status.textContent = 'Текст выделен. Нажмите Ctrl+C (или ⌘C), чтобы скопировать.'; }
  });
  document.querySelector('#download-brief').addEventListener('click', () => {
    const objectURL = URL.createObjectURL(new Blob(['\uFEFF' + output.value], { type: 'text/plain;charset=utf-8' }));
    const anchor = document.createElement('a'); anchor.href = objectURL; anchor.download = 'brief-julia-pavlova.txt'; document.body.append(anchor); anchor.click(); anchor.remove(); setTimeout(() => URL.revokeObjectURL(objectURL), 1000);
    status.textContent = 'Бриф подготовлен к скачиванию. Отправьте файл Юлии удобным способом.';
  });
})();
