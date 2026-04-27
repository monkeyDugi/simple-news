// Edge/Node/브라우저 어디서든 동작하도록 base64url 헬퍼를 직접 둔다.
// (Buffer 는 Edge runtime 에서 미지원이므로 atob/btoa 로 fallback)

function base64UrlEncode(input: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf-8").toString("base64url");
  }
  const b64 = btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlDecode(input: string): string {
  const padded = input + "=".repeat((4 - (input.length % 4)) % 4);
  const b64 = padded.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf-8");
  }
  return decodeURIComponent(escape(atob(b64)));
}

// publishedAt + id 복합 키를 cursor 1개로 직렬화.
// 같은 시각 기사 다수가 있어도 id tie-breaker 로 안정적인 페이지네이션 보장.
export function encodeCursor(publishedAt: Date | string, id: number): string {
  const iso =
    typeof publishedAt === "string" ? publishedAt : publishedAt.toISOString();
  return base64UrlEncode(`${iso}|${id}`);
}

export function decodeCursor(
  cursor: string,
): { publishedAt: Date; id: number } | null {
  try {
    const raw = base64UrlDecode(cursor);
    const [iso, idStr] = raw.split("|");
    if (!iso || !idStr) return null;
    const publishedAt = new Date(iso);
    const id = Number.parseInt(idStr, 10);
    if (Number.isNaN(publishedAt.getTime()) || Number.isNaN(id)) return null;
    return { publishedAt, id };
  } catch {
    return null;
  }
}
