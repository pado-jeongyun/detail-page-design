import { listEntries, type Ctx } from "./lib/store.ts";

export const meta = {
  description:
    "저장된 일기 목록을 최근 날짜부터 준다. 각 항목에 date, 미리보기(preview), 크기(bytes), path 가 실린다. limit 로 개수를 제한한다(기본 30).",
  input: {
    type: "object",
    properties: {
      limit: { type: "number", description: "최대 개수 (기본 30)" },
    },
  },
};

export default async function (input: { limit?: number }, ctx: Ctx) {
  const all = listEntries(ctx);
  const n = Number(input?.limit);
  const limit = Number.isFinite(n) && n > 0 ? Math.floor(n) : 30;
  const entries = all.slice(0, limit);
  return {
    total: all.length,
    count: entries.length,
    entries,
    ...(all.length ? {} : { 안내: "아직 저장된 일기가 없다." }),
  };
}
