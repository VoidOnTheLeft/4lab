/* ============================================================
   GYM FORCE — main.js
   Подключён через <script src="js/main.js" defer>
   ============================================================ */

/* ===== Фолбэки изображений (бывшие встроенные onerror) ===== */
function applyImgFallback(img) {
  // data-fallback="remove" — удалить сломанный баннер;
  // data-fallback="clear" — убрать src, оставив фон (CSS-градиент).
  if (img.dataset.fallback === 'remove') img.remove();
  else if (img.dataset.fallback === 'clear') img.removeAttribute('src');
}
document.querySelectorAll('img[data-fallback]').forEach(img => {
  // Скрипт подключён с defer: картинка могла сломаться ещё до загрузки скрипта.
  if (img.complete && img.naturalWidth === 0) applyImgFallback(img);
  else img.addEventListener('error', () => applyImgFallback(img));
});

/* ===== Мобильное меню ===== */
const nav = document.getElementById('nav');
const burger = document.getElementById('burger');
const openMenu = () => { nav.classList.add('open'); burger.setAttribute('aria-expanded', 'true'); };
const closeMenu = () => { nav.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); };
burger.addEventListener('click', () => {
  nav.classList.contains('open') ? closeMenu() : openMenu();
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
/* Закрытие по Escape */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
/* Закрытие по клику вне меню */
document.addEventListener('click', e => {
  if (nav.classList.contains('open') && !nav.contains(e.target) && !burger.contains(e.target)) closeMenu();
});

/* ===== Выбор абонемента подставляет тариф в форму ===== */
document.querySelectorAll('[data-plan]').forEach(b =>
  b.addEventListener('click', () => { document.getElementById('plan').value = b.dataset.plan; }));

/* ===== Появление элементов при прокрутке ===== */
const io = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
}, { threshold: .15 });
document.querySelectorAll('.reveal').forEach(el => io.observe(el));

/* ===== Подсветка меню и кнопка «Наверх» ===== */
const topBtn = document.getElementById('topBtn');
const menuLinks = nav.querySelectorAll('ul li a:not(.btn)');
const sections = ['about', 'benefits', 'programs', 'plans', 'contact']
  .map(id => document.getElementById(id)).filter(Boolean);
function updateNav() {
  const pos = window.scrollY + 120;
  let current = '';
  sections.forEach(s => { if (s.offsetTop <= pos) current = s.id; });
  menuLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    if (id === current) {
      a.classList.add('active');
      a.setAttribute('aria-current', 'true');
    } else {
      a.classList.remove('active');
      a.removeAttribute('aria-current');
    }
  });
  topBtn.classList.toggle('show', window.scrollY > 600);
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();
topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

/* ===== Проверка формы (правила не меняются) ===== */
const form = document.getElementById('form');
const msg = document.getElementById('msg');
function check(input, errId, ok, text) {
  const err = document.getElementById(errId);
  err.textContent = ok ? '' : text;
  input.classList.toggle('bad', !ok);
  if (ok) {
    input.removeAttribute('aria-invalid');
    input.removeAttribute('aria-describedby');
  } else {
    input.setAttribute('aria-invalid', 'true');
    input.setAttribute('aria-describedby', errId);
  }
  return ok;
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const name = form.name, phone = form.phone;
  const okName = check(name, 'e-name', name.value.trim().length >= 2, 'Введите имя (минимум 2 символа).');
  const digits = phone.value.replace(/\D/g, '');
  const okPhone = check(phone, 'e-phone', digits.length >= 10 && digits.length <= 15, 'Введите телефон: от 10 цифр.');
  if (!okName || !okPhone) {
    msg.classList.remove('show');
    /* Фокус на первое некорректное поле */
    if (!okName) name.focus();
    else phone.focus();
    return;
  }
  msg.textContent = 'Спасибо, ' + name.value.trim() + '! Форма заполнена верно. Это демонстрационный сайт без сервера, поэтому заявка нигде не сохранена и не отправлена.';
  msg.classList.add('show');
  form.reset();
});
