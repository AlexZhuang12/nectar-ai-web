import type { Locale } from "./types";

export const CANONICAL_LOCALES: Locale[] = ["zh-TW", "en-US", "ja-JP", "es-ES"];

const VALID_LOCALES: Locale[] = CANONICAL_LOCALES;

/** Map legacy/shorthand codes to canonical locale keys (lookup keys are lowercased, hyphenated) */
const LOCALE_ALIASES: Record<string, Locale> = {
  en: "en-US",
  "en-us": "en-US",
  zh: "zh-TW",
  "zh-tw": "zh-TW",
  "zh-cn": "zh-TW",
  ja: "ja-JP",
  "ja-jp": "ja-JP",
  es: "es-ES",
  "es-es": "es-ES",
};

function normalizeLocaleKey(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, "-");
}

export function isCanonicalLocale(value: string): value is Locale {
  return CANONICAL_LOCALES.includes(value as Locale);
}

/**
 * Normalize any common locale string to a canonical Locale.
 * Case-insensitive; accepts hyphens or underscores.
 */
export function normalizeLocale(value: string | null | undefined): Locale | null {
  if (!value) return null;

  const key = normalizeLocaleKey(value);

  // Exact canonical match (case-insensitive, e.g. "en-us" -> "en-US")
  for (const locale of VALID_LOCALES) {
    if (normalizeLocaleKey(locale) === key) {
      return locale;
    }
  }

  if (key in LOCALE_ALIASES) {
    return LOCALE_ALIASES[key];
  }

  // Prefix fallback for common language families
  if (key.startsWith("en")) return "en-US";
  if (key.startsWith("zh")) return "zh-TW";
  if (key.startsWith("ja")) return "ja-JP";
  if (key.startsWith("es")) return "es-ES";

  return null;
}

export const LOCALES: { value: Locale; label: string; flag: string }[] = [
  { value: "zh-TW", label: "繁體中文", flag: "🇹🇼" },
  { value: "en-US", label: "English", flag: "🇺🇸" },
  { value: "ja-JP", label: "日本語", flag: "🇯🇵" },
  { value: "es-ES", label: "Español", flag: "🇪🇸" },
];

export type TranslationKeys =
  | "appTitle"
  | "appSubtitle"
  | "uiLanguage"
  | "aiResponseLanguage"
  | "aiResponseLanguageHint"
  | "creditBalance"
  | "credits"
  | "upgradePro"
  | "feedback"
  | "extractorTitle"
  | "extractorDesc"
  | "inputPlaceholder"
  | "targetLanguage"
  | "extractionMode"
  | "modeKeyInfo"
  | "modeDualAlignment"
  | "modeBoth"
  | "extract"
  | "extracting"
  | "keyInfo"
  | "dualAlignment"
  | "summary"
  | "historyTitle"
  | "historyEmpty"
  | "proModalTitle"
  | "proModalDesc"
  | "proFeature1"
  | "proFeature2"
  | "proFeature3"
  | "proPrice"
  | "checkout"
  | "checkoutSimulated"
  | "close"
  | "errorInsufficientCredits"
  | "errorGeneric"
  | "saved"
  | "text"
  | "url"
  | "feedbackTitle"
  | "feedbackDesc"
  | "feedbackCategory"
  | "feedbackCategoryBug"
  | "feedbackCategoryFeature"
  | "feedbackCategoryOther"
  | "feedbackMessage"
  | "feedbackMessagePlaceholder"
  | "feedbackSubmit"
  | "feedbackSubmitting"
  | "feedbackThankYou"
  | "feedbackError"
  | "loading"
  | "refresh"
  | "keysCount"
  | "pairsCount"
  | "checkoutProcessing"
  | "upgradeProShort";

/** Static translation data — never mutated; lookups always use passed locale */
const translationStore: Record<Locale, Record<TranslationKeys, string>> = {
  "zh-TW": {
    appTitle: "Nectar AI",
    appSubtitle: "全球智慧工作空間",
    uiLanguage: "介面語言",
    aiResponseLanguage: "AI 輸出語言",
    aiResponseLanguageHint: "AI 回覆將以此語言輸出，與介面語言無關",
    creditBalance: "點數餘額",
    credits: "點",
    upgradePro: "升級 Pro",
    feedback: "反饋",
    extractorTitle: "關鍵資訊與雙語對齊擷取器",
    extractorDesc: "貼上文字或 URL，擷取關鍵資訊並產生雙語對齊結果",
    inputPlaceholder: "貼上文字內容或輸入 URL…",
    targetLanguage: "目標語言",
    extractionMode: "擷取模式",
    modeKeyInfo: "關鍵資訊",
    modeDualAlignment: "雙語對齊",
    modeBoth: "全部",
    extract: "開始擷取",
    extracting: "擷取中…",
    keyInfo: "關鍵資訊",
    dualAlignment: "雙語對齊",
    summary: "摘要",
    historyTitle: "知識歷史紀錄",
    historyEmpty: "尚無紀錄，開始您的第一次擷取吧！",
    proModalTitle: "升級 Nectar AI Pro",
    proModalDesc: "解鎖無限擷取、優先處理與進階對齊功能",
    proFeature1: "無限次擷取",
    proFeature2: "優先 AI 處理",
    proFeature3: "進階雙語對齊",
    proPrice: "NT$299 / 月",
    checkout: "前往結帳",
    checkoutSimulated: "Stripe 結帳模擬完成！",
    close: "關閉",
    errorInsufficientCredits: "點數不足，請升級 Pro",
    errorGeneric: "擷取失敗，請稍後再試",
    saved: "已儲存至知識庫",
    text: "文字",
    url: "URL",
    feedbackTitle: "意見反饋",
    feedbackDesc: "您的回饋能幫助我們持續改進 Nectar AI",
    feedbackCategory: "類別",
    feedbackCategoryBug: "Bug 回報",
    feedbackCategoryFeature: "功能建議",
    feedbackCategoryOther: "其他",
    feedbackMessage: "詳細描述",
    feedbackMessagePlaceholder: "請描述您遇到的問題或建議…",
    feedbackSubmit: "提交反饋",
    feedbackSubmitting: "提交中…",
    feedbackThankYou: "感謝您的反饋！我們會盡快處理。",
    feedbackError: "提交失敗，請稍後再試",
    loading: "載入中…",
    refresh: "重新整理",
    keysCount: "個要點",
    pairsCount: "組對齊",
    checkoutProcessing: "結帳處理中…",
    upgradeProShort: "Pro",
  },
  "en-US": {
    appTitle: "Nectar AI",
    appSubtitle: "Bilingual Knowledge Extractor",
    uiLanguage: "UI Language",
    aiResponseLanguage: "AI Output Language",
    aiResponseLanguageHint:
      "Language used by AI to generate final response",
    creditBalance: "Credits",
    credits: "credits",
    upgradePro: "Upgrade Pro",
    feedback: "Feedback",
    extractorTitle: "Key Info & Dual Alignment Extractor",
    extractorDesc:
      "Paste text or URL to extract key insights and aligned translation",
    inputPlaceholder: "Paste article, report text, or enter URL...",
    targetLanguage: "Target Language",
    extractionMode: "Extraction Mode",
    modeKeyInfo: "Key Info",
    modeDualAlignment: "Bilingual Alignment",
    modeBoth: "Both Modes",
    extract: "Start Extraction",
    extracting: "Extracting...",
    keyInfo: "Key Information",
    dualAlignment: "Bilingual Alignment",
    summary: "Summary",
    historyTitle: "Knowledge History",
    historyEmpty: "No extraction history yet",
    proModalTitle: "Upgrade to Nectar AI Pro",
    proModalDesc:
      "Unlock unlimited extractions, priority processing, and advanced alignment",
    proFeature1: "Unlimited extractions",
    proFeature2: "Priority AI processing",
    proFeature3: "Advanced dual-language alignment",
    proPrice: "$9.99 / month",
    checkout: "Proceed to Checkout",
    checkoutSimulated: "Stripe checkout simulated successfully!",
    close: "Close",
    errorInsufficientCredits: "Insufficient credits, please upgrade Pro",
    errorGeneric: "An error occurred, please try again",
    saved: "Saved to history",
    text: "Text",
    url: "URL",
    feedbackTitle: "Send Feedback",
    feedbackDesc: "Your feedback helps us improve Nectar AI",
    feedbackCategory: "Category",
    feedbackCategoryBug: "Bug Report",
    feedbackCategoryFeature: "Feature Request",
    feedbackCategoryOther: "Other",
    feedbackMessage: "Details",
    feedbackMessagePlaceholder: "Describe your issue or suggestion…",
    feedbackSubmit: "Submit Feedback",
    feedbackSubmitting: "Submitting…",
    feedbackThankYou: "Thank you for your feedback! We'll review it soon.",
    feedbackError: "Submission failed. Please try again",
    loading: "Loading…",
    refresh: "Refresh",
    keysCount: "keys",
    pairsCount: "pairs",
    checkoutProcessing: "Processing checkout…",
    upgradeProShort: "Pro",
  },
  "ja-JP": {
    appTitle: "Nectar AI",
    appSubtitle: "バイリンガル知識抽出ツール",
    uiLanguage: "UI 言語",
    aiResponseLanguage: "AI 出力言語",
    aiResponseLanguageHint: "AI が最終回答を生成する言語",
    creditBalance: "クレジット",
    credits: "クレジット",
    upgradePro: "Pro にアップグレード",
    feedback: "フィードバック",
    extractorTitle: "重要情報・二言語アライメント抽出",
    extractorDesc:
      "テキストまたは URL を貼り付け、重要情報と対訳を抽出します",
    inputPlaceholder: "記事・レポートのテキスト、または URL を入力...",
    targetLanguage: "対象言語",
    extractionMode: "抽出モード",
    modeKeyInfo: "重要情報",
    modeDualAlignment: "二言語アライメント",
    modeBoth: "両方",
    extract: "抽出開始",
    extracting: "抽出中...",
    keyInfo: "重要情報",
    dualAlignment: "二言語アライメント",
    summary: "要約",
    historyTitle: "ナレッジ履歴",
    historyEmpty: "抽出履歴はまだありません",
    proModalTitle: "Nectar AI Pro にアップグレード",
    proModalDesc: "無制限抽出、優先処理、高度なアライメント機能を解放",
    proFeature1: "無制限抽出",
    proFeature2: "優先 AI 処理",
    proFeature3: "高度な二言語アライメント",
    proPrice: "¥1,480 / 月",
    checkout: "チェックアウトへ",
    checkoutSimulated: "Stripe チェックアウトをシミュレートしました！",
    close: "閉じる",
    errorInsufficientCredits: "クレジット不足。Pro にアップグレードしてください",
    errorGeneric: "抽出に失敗しました。後でもう一度お試しください",
    saved: "ナレッジベースに保存しました",
    text: "テキスト",
    url: "URL",
    feedbackTitle: "フィードバック",
    feedbackDesc: "ご意見は Nectar AI の改善に役立ちます",
    feedbackCategory: "カテゴリ",
    feedbackCategoryBug: "バグ報告",
    feedbackCategoryFeature: "機能提案",
    feedbackCategoryOther: "その他",
    feedbackMessage: "詳細",
    feedbackMessagePlaceholder: "問題や提案を記述してください…",
    feedbackSubmit: "送信",
    feedbackSubmitting: "送信中…",
    feedbackThankYou: "フィードバックありがとうございます！",
    feedbackError: "送信に失敗しました。後でもう一度お試しください",
    loading: "読み込み中…",
    refresh: "更新",
    keysCount: "件の要点",
    pairsCount: "組のアライメント",
    checkoutProcessing: "チェックアウト処理中…",
    upgradeProShort: "Pro",
  },
  "es-ES": {
    appTitle: "Nectar AI",
    appSubtitle: "Espacio de Trabajo Global",
    uiLanguage: "Idioma de la Interfaz",
    aiResponseLanguage: "Idioma de Respuesta AI",
    aiResponseLanguageHint: "La salida AI usa este idioma, independiente del idioma de la UI",
    creditBalance: "Saldo de Créditos",
    credits: "créditos",
    upgradePro: "Actualizar a Pro",
    feedback: "Comentarios",
    extractorTitle: "Extractor de Información Clave y Alineación Bilingüe",
    extractorDesc: "Pega texto o una URL para extraer información clave y generar alineación bilingüe",
    inputPlaceholder: "Pega contenido de texto o introduce una URL…",
    targetLanguage: "Idioma Objetivo",
    extractionMode: "Modo de Extracción",
    modeKeyInfo: "Info Clave",
    modeDualAlignment: "Alineación Dual",
    modeBoth: "Ambos",
    extract: "Extraer",
    extracting: "Extrayendo…",
    keyInfo: "Información Clave",
    dualAlignment: "Alineación Bilingüe",
    summary: "Resumen",
    historyTitle: "Historial de Conocimiento Guardado",
    historyEmpty: "Sin registros aún. ¡Comienza tu primera extracción!",
    proModalTitle: "Actualizar a Nectar AI Pro",
    proModalDesc: "Desbloquea extracciones ilimitadas, procesamiento prioritario y alineación avanzada",
    proFeature1: "Extracciones ilimitadas",
    proFeature2: "Procesamiento AI prioritario",
    proFeature3: "Alineación bilingüe avanzada",
    proPrice: "€8.99 / mes",
    checkout: "Ir al Checkout",
    checkoutSimulated: "¡Checkout de Stripe simulado con éxito!",
    close: "Cerrar",
    errorInsufficientCredits: "Créditos insuficientes. Actualiza a Pro",
    errorGeneric: "Extracción fallida. Inténtalo de nuevo",
    saved: "Guardado en la base de conocimiento",
    text: "Texto",
    url: "URL",
    feedbackTitle: "Enviar Comentarios",
    feedbackDesc: "Sus comentarios nos ayudan a mejorar Nectar AI",
    feedbackCategory: "Categoría",
    feedbackCategoryBug: "Reporte de Bug",
    feedbackCategoryFeature: "Solicitud de Función",
    feedbackCategoryOther: "Otro",
    feedbackMessage: "Detalles",
    feedbackMessagePlaceholder: "Describa su problema o sugerencia…",
    feedbackSubmit: "Enviar Comentarios",
    feedbackSubmitting: "Enviando…",
    feedbackThankYou: "¡Gracias por sus comentarios! Los revisaremos pronto.",
    feedbackError: "Error al enviar. Inténtelo de nuevo",
    loading: "Cargando…",
    refresh: "Actualizar",
    keysCount: "puntos clave",
    pairsCount: "pares",
    checkoutProcessing: "Procesando pago…",
    upgradeProShort: "Pro",
  },
};

/** Always resolves dictionary from the locale argument — no per-locale closure cache */
export function getDictionary(
  locale: Locale | string
): Record<TranslationKeys, string> {
  const norm = normalizeLocale(locale) ?? "zh-TW";
  const dict = translationStore[norm];
  if (!dict) {
    console.warn(`[i18n] getDictionary: unknown locale "${locale}" → en-US`);
    return translationStore["en-US"];
  }
  return dict;
}

/** Direct locale-key lookup — never falls back to zh-TW for non-Chinese locales */
export function t(locale: Locale | string, key: TranslationKeys): string {
  const norm = normalizeLocale(locale) ?? "zh-TW";
  const dict = translationStore[norm];

  if (!dict) {
    console.warn(`[i18n] t(): unknown locale "${locale}" (norm=${norm})`);
    return translationStore["en-US"][key] ?? key;
  }

  const value = dict[key];
  if (value !== undefined) {
    return value;
  }

  console.warn(`[i18n] Missing key: ${key} for locale: ${norm}`);
  if (norm === "zh-TW") {
    return translationStore["zh-TW"][key] ?? key;
  }
  return translationStore["en-US"][key] ?? key;
}

/** @deprecated Use t(locale, key) directly */
export function createTranslator(
  locale: Locale
): (key: TranslationKeys) => string {
  return (key: TranslationKeys) => t(locale, key);
}

/** Dev helper: verify all locales have identical key sets */
export function validateTranslations(): boolean {
  const baseKeys = Object.keys(translationStore["zh-TW"]) as TranslationKeys[];
  let ok = true;
  for (const locale of VALID_LOCALES) {
    const keys = Object.keys(translationStore[locale]) as TranslationKeys[];
    for (const key of baseKeys) {
      if (!keys.includes(key)) {
        console.error(`[i18n] Missing key "${key}" in locale "${locale}"`);
        ok = false;
      }
    }
  }
  return ok;
}

export function getLocaleLabel(locale: Locale): string {
  return LOCALES.find((l) => l.value === locale)?.label ?? locale;
}
