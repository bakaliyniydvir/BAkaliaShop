export function toUrlSafeSlug(name) {
    const cyrillicToLatinMap = {
        а: 'a', б: 'b', в: 'v', г: 'h', ґ: 'g', д: 'd', е: 'e', є: 'ie', ж: 'zh',
        з: 'z', и: 'y', і: 'i', ї: 'i', й: 'i', к: 'k', л: 'l', м: 'm', н: 'n',
        о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts',
        ч: 'ch', ш: 'sh', щ: 'shch', ю: 'iu', я: 'ia', ь: '', ъ: '', '’': '', '\'': '',
    }

    const toLatin = str =>
        str
            .toLowerCase()
            .split('')
            .map(char => cyrillicToLatinMap[char] ?? char)
            .join('')

    return toLatin(name)
        .trim()
        .replace(/[^\w0-9]+/g, '_') // замінюємо пробіли та спецсимволи на '_'
        .replace(/^_+|_+$/g, '')    // прибираємо зайві '_' спочатку/вкінці
}
  