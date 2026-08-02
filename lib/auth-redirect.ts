/** Safe post-login path — must be same-origin relative */
export function sanitizeRedirectPath(path: string | null | undefined): string {
  if (!path || !path.startsWith("/") || path.startsWith("//")) {
    return "/dashboard";
  }
  return path;
}

export function mapAuthErrorToZh(message: string): string {
  const lower = message.toLowerCase();

  if (lower.includes("invalid path specified")) {
    return "電子郵件確認網址格式錯誤，請確認 Supabase Site URL 與 Redirect URLs 設定正確。";
  }
  if (lower.includes("user already registered") || lower.includes("already been registered")) {
    return "此 Email 已註冊，請直接登入。";
  }
  if (lower.includes("invalid login credentials")) {
    return "Email 或密碼錯誤，請重新輸入。";
  }
  if (lower.includes("email not confirmed")) {
    return "Email 尚未驗證，請至信箱點擊確認連結後再登入。";
  }
  if (lower.includes("password") && lower.includes("least")) {
    return "密碼長度不足，請至少輸入 6 個字元。";
  }
  if (lower.includes("rate limit") || lower.includes("too many requests")) {
    return "操作過於頻繁，請稍後再試。";
  }

  return message;
}
