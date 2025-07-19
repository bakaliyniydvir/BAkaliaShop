// Перетворює рядок у URL-friendly slug, підтримуючи кирилицю
export function toUrlSafeSlug(name) {
    return name
        .toLowerCase()
        .trim()
        .normalize('NFD')                      // розділяє літери + діакритику
        .replace(/[\u0300-\u036f]/g, '')       // прибирає діакритичні знаки
        .replace(/[^\wа-яіїєґ0-9]+/gi, '_')    // все, що не буква/цифра → '_'
        .replace(/^_+|_+$/g, '')               // обрізає провідні/кінцеві '_'
}
  