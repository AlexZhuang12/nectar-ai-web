import type { Locale } from "./types";

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

const translations: Record<Locale, Record<TranslationKeys, string>> = {
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
    appSubtitle: "Global Web Workspace",
    uiLanguage: "UI Language",
    aiResponseLanguage: "AI Response Language",
    aiResponseLanguageHint: "AI output uses this language, independent of UI language",
    creditBalance: "Credit Balance",
    credits: "credits",
    upgradePro: "Upgrade Pro",
    feedback: "Feedback",
    extractorTitle: "Key Information & Dual-Language Alignment Extractor",
    extractorDesc: "Paste text or a URL to extract key info and generate bilingual alignment",
    inputPlaceholder: "Paste text content or enter a URL…",
    targetLanguage: "Target Language",
    extractionMode: "Extraction Mode",
    modeKeyInfo: "Key Info",
    modeDualAlignment: "Dual Alignment",
    modeBoth: "Both",
    extract: "Extract",
    extracting: "Extracting…",
    keyInfo: "Key Information",
    dualAlignment: "Dual-Language Alignment",
    summary: "Summary",
    historyTitle: "Saved Knowledge History",
    historyEmpty: "No records yet. Start your first extraction!",
    proModalTitle: "Upgrade to Nectar AI Pro",
    proModalDesc: "Unlock unlimited extractions, priority processing, and advanced alignment",
    proFeature1: "Unlimited extractions",
    proFeature2: "Priority AI processing",
    proFeature3: "Advanced dual-language alignment",
    proPrice: "$9.99 / month",
    checkout: "Proceed to Checkout",
    checkoutSimulated: "Stripe checkout simulated successfully!",
    close: "Close",
    errorInsufficientCredits: "Insufficient credits. Please upgrade to Pro",
    errorGeneric: "Extraction failed. Please try again",
    saved: "Saved to knowledge base",
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
    appSubtitle: "グローバルワークスペース",
    uiLanguage: "UI 言語",
    aiResponseLanguage: "AI 出力言語",
    aiResponseLanguageHint: "AI の回答はこの言語で出力されます（UI 言語とは独立）",
    creditBalance: "クレジット残高",
    credits: "クレジット",
    upgradePro: "Pro にアップグレード",
    feedback: "フィードバック",
    extractorTitle: "重要情報・二言語アライメント抽出",
    extractorDesc: "テキストまたは URL を貼り付けて、重要情報の抽出と二言語アライメントを生成",
    inputPlaceholder: "テキストまたは URL を入力…",
    targetLanguage: "対象言語",
    extractionMode: "抽出モード",
    modeKeyInfo: "重要情報",
    modeDualAlignment: "二言語アライメント",
    modeBoth: "両方",
    extract: "抽出開始",
    extracting: "抽出中…",
    keyInfo: "重要情報",
    dualAlignment: "二言語アライメント",
    summary: "要約",
    historyTitle: "保存済みナレッジ履歴",
    historyEmpty: "履歴がありません。最初の抽出を始めましょう！",
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

export function t(locale: Locale, key: TranslationKeys): string {
  const value = translations[locale]?.[key];
  if (value === undefined) {
    console.warn(`[i18n] Missing translation: locale=${locale}, key=${key}`);
    return translations["en-US"][key] ?? key;
  }
  return value;
}

/** Dev helper: verify all locales have identical key sets */
export function validateTranslations(): boolean {
  const baseKeys = Object.keys(translations["zh-TW"]) as TranslationKeys[];
  let ok = true;
  for (const locale of VALID_LOCALES) {
    const keys = Object.keys(translations[locale]) as TranslationKeys[];
    for (const key of baseKeys) {
      if (!keys.includes(key)) {
        console.error(`[i18n] Missing key "${key}" in locale "${locale}"`);
        ok = false;
      }
    }
  }
  return ok;
}

const VALID_LOCALES: Locale[] = ["zh-TW", "en-US", "ja-JP", "es-ES"];

export function getLocaleLabel(locale: Locale): string {
  return LOCALES.find((l) => l.value === locale)?.label ?? locale;
}
