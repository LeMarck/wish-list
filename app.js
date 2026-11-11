const cards = document.querySelector('#cards');
const filters = document.querySelector('#filters');
const search = document.querySelector('#search');
const empty = document.querySelector('#empty');
let items = [];
let selectedCategory = 'Все желания';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function chevronIcon(className = 'chevron') {
  const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttribute('class', className);
  icon.setAttribute('viewBox', '0 0 24 24');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', 'm6 9 6 6 6-6');
  icon.append(path);
  return icon;
}

function safeUrl(value, local = false) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    const url = new URL(value, document.baseURI);
    if (!['http:', 'https:'].includes(url.protocol)) return null;
    if (!local && !/^https?:\/\//i.test(value)) return null;
    return url.href;
  } catch {
    return null;
  }
}

function card(item, index) {
  const article = element('article', 'card');
  const visual = element('div', 'card-visual');
  visual.dataset.tone = ['lavender', 'sand', 'green', 'pink', 'blue', 'peach'][
    index % 6
  ];
  const imageUrl = safeUrl(item.image, true);
  const fallback = () => {
    visual.classList.add('image-missing');
    image.replaceWith(element('span', 'image-placeholder', '✧'));
  };
  const image = element('img');
  image.alt = item.title;
  image.loading = 'lazy';
  image.width = 560;
  image.height = 420;
  image.addEventListener('error', fallback, { once: true });
  visual.append(image);
  if (imageUrl) image.src = imageUrl;
  else fallback();
  if (item.favorite)
    visual.append(element('span', 'favorite', '♡ Особенно хочется'));
  const content = element('div', 'card-content');
  content.append(
    element('p', 'card-category', item.category || 'Разное'),
    element('h3', '', item.title),
  );
  if (item.description)
    content.append(element('p', 'card-description', item.description));
  const shops = element('div', 'shops');
  shops.setAttribute('aria-label', `Где купить: ${item.title}`);
  for (const shop of item.shops || []) {
    const url = safeUrl(shop.url);
    if (!url) continue;
    const link = element('a', 'shop-link');
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.append(element('span', '', shop.name), chevronIcon('arrow'));
    link.setAttribute(
      'aria-label',
      `${item.title} — ${shop.name} (в новой вкладке)`,
    );
    shops.append(link);
  }
  if (shops.children.length > 1) {
    const dropdown = element('details', 'shop-dropdown');
    const summary = element('summary', 'shop-link shop-toggle');
    summary.append(element('span', '', 'Где купить'), chevronIcon());
    summary.setAttribute(
      'aria-label',
      `Где купить: ${item.title}, выбрать магазин`,
    );
    shops.className = 'shop-options';
    dropdown.append(summary, shops);
    content.append(dropdown);
  } else {
    content.append(shops);
  }
  article.append(visual, content);
  return article;
}

function render() {
  const query = search.value.trim().toLocaleLowerCase('ru');
  const visible = items.filter(
    (item) =>
      (selectedCategory === 'Все желания' ||
        item.category === selectedCategory) &&
      [
        item.title,
        item.description,
        item.category,
        ...(item.shops || []).map((shop) => shop.name),
      ]
        .join(' ')
        .toLocaleLowerCase('ru')
        .includes(query),
  );
  cards.replaceChildren(
    ...visible.map((item) => card(item, items.indexOf(item))),
  );
  empty.hidden = visible.length > 0;
  document.querySelector('#results').textContent =
    `Найдено желаний: ${visible.length}`;
  for (const button of filters.children)
    button.setAttribute(
      'aria-pressed',
      String(button.dataset.category === selectedCategory),
    );
}

function reset() {
  search.value = '';
  selectedCategory = 'Все желания';
  render();
}

async function init() {
  try {
    const response = await fetch('./data/wishlist.json');
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    if (!Array.isArray(data.items)) throw new Error('Invalid wishlist');
    items = data.items;
    if (data.title)
      document.querySelector('#page-title').textContent = data.title;
    if (data.intro) document.querySelector('#intro').textContent = data.intro;
    document.querySelector('#total-count').textContent = items.length;
    for (const category of [
      'Все желания',
      ...new Set(items.map((item) => item.category).filter(Boolean)),
    ]) {
      const button = element('button', 'filter', category);
      button.type = 'button';
      button.dataset.category = category;
      button.addEventListener('click', () => {
        selectedCategory = category;
        render();
      });
      filters.append(button);
    }
    render();
  } catch {
    const message = element('div', 'load-error');
    message.append(
      element('h3', '', 'Не удалось загрузить желания'),
      element('p', '', 'Попробуйте ещё раз чуть позже.'),
    );
    const retry = element('button', '', 'Попробовать снова');
    retry.type = 'button';
    retry.addEventListener('click', () => {
      filters.replaceChildren();
      init();
    });
    message.append(retry);
    cards.replaceChildren(message);
  } finally {
    cards.setAttribute('aria-busy', 'false');
  }
}
search.addEventListener('input', render);
document.querySelector('#reset').addEventListener('click', reset);
init();
