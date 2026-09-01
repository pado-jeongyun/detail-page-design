import { searchEntries, isValidDate, type Ctx } from "./lib/store.ts";

export const meta = {
  description:
    "저장된 일기 전체에서 낱말이나 문구로 검색한다. query(찾을 말)는 필수. 본문에 그 말이 든 일기를 최근 날짜부터, 맞은 대목(snippet)과 맞은 횟수(matches)와 함께 준다. 대소문자는 가리지 않는다. from/to(YYYY-MM-DD, 포함)로 기간을 좁힐 수 있고 limit 로 개수를 제한한다(기본 30). 본문 전문이 필요하면 맞은 날짜로 diary-read 를 부른다.",
  input: {
    type: "object",
    required: ["query"],
    properties: {
      query: { type: "string", description: "찾을 낱말이나 문구" },
      from: { type: "string", description: "이 날짜부터(YYYY-MM-DD, 포함) — 생략하면 처음부터" },
      to: { type: "string", description: "이 날짜까지(YYYY-MM-DD, 포함) — 생략하면 끝까지" },
      limit: { type: "number", description: "최대 개수 (기본 30)" },
    },
  },
};

export default async function (
  input: { query?: string; from?: string; to?: string; limit?: number },
  ctx: Ctx,
) {
  const query = typeof input?.query === "string" ? input.query.trim() : "";
  if (!query) throw new Error("query(찾을 말)가 필요하다");
  const from = input?.from?.trim() || undefined;
  const to = input?.to?.trim() || undefined;
  if (from && !isValidDate(from)) throw new Error("from 은 YYYY-MM-DD 형식이어야 한다");
  if (to && !isValidDate(to)) throw new Error("to 는 YYYY-MM-DD 형식이어야 한다");

  const all = searchEntries(ctx, query, { from, to });
  const n = Number(input?.limit);
  const limit = Number.isFinite(n) && n > 0 ? Math.floor(n) : 30;
  const hits = all.slice(0, limit);

  return {
    query,
    total: all.length,
    count: hits.length,
    hits,
    ...(all.length ? {} : { 안내: `'${query}' 이(가) 든 일기를 찾지 못했다.` }),
  };
}
