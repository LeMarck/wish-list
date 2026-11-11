import { readFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = fileURLToPath(new URL('../', import.meta.url));
export async function check() {
  const data = JSON.parse(
    await readFile(path.join(root, 'data/wishlist.json'), 'utf8'),
  );
  if (!data || !Array.isArray(data.items))
    throw new Error('wishlist.json: items должен быть массивом');
  for (const key of ['title', 'intro']) {
    if (data[key] !== undefined && typeof data[key] !== 'string')
      throw new Error(`${key} должен быть строкой`);
  }
  const ids = new Set();
  const requiredString = (value, label) => {
    if (typeof value !== 'string' || !value.trim())
      throw new Error(`${label}: нужна непустая строка`);
  };
  const remoteUrl = (value, label) => {
    requiredString(value, label);
    const url = new URL(value);
    if (!['https:', 'http:'].includes(url.protocol))
      throw new Error(`${label}: нужна ссылка http(s)`);
  };
  for (const [index, item] of data.items.entries()) {
    const label = `Карточка ${index + 1}`;
    if (!item || typeof item !== 'object')
      throw new Error(`${label}: нужен объект`);
    for (const key of ['id', 'title', 'image'])
      requiredString(item[key], `${label}.${key}`);
    for (const key of ['description', 'category']) {
      if (item[key] !== undefined) requiredString(item[key], `${label}.${key}`);
    }
    if (item.favorite !== undefined && typeof item.favorite !== 'boolean')
      throw new Error(`${label}.favorite: нужен boolean`);
    if (ids.has(item.id))
      throw new Error(`${label}: повторяется id ${item.id}`);
    ids.add(item.id);
    if (/^https?:\/\//i.test(item.image))
      remoteUrl(item.image, `${label}.image`);
    else {
      if (!item.image.startsWith('./assets/'))
        throw new Error(
          `${label}.image: используйте ./assets/имя-файла или https URL`,
        );
      const imagePath = path.resolve(root, item.image);
      if (!imagePath.startsWith(path.join(root, 'assets') + path.sep))
        throw new Error(`${label}: изображение должно лежать в assets`);
      await access(imagePath);
    }
    if (!Array.isArray(item.shops) || item.shops.length === 0)
      throw new Error(`${label}: добавьте хотя бы один магазин в shops`);
    for (const shop of item.shops) {
      requiredString(shop?.name, `${label}.shops.name`);
      remoteUrl(shop.url, `${label}.shops.url`);
    }
  }
  console.log(`Проверено карточек: ${data.items.length}`);
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  check().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
