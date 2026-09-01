import { isValidDate, todayLocal, readEntry, entryPath, type Ctx } from "./lib/store.ts";

export const meta = {
  description:
    "특정 날짜의 일기를 읽는다. date(YYYY-MM-DD)를 주지 않으면 오늘 것을 본다. 없으면 found:false 로 답한다.",
  input: {
    type: "object",
    properties: {
      date: { type: "string", description: "YYYY-MM-DD — 생략하면 오늘" },
    },
  },
};

export default async function (input: { date?: string }, ctx: Ctx) {
  const date = input?.date?.trim() || todayLocal();
  if (!isValidDate(date)) throw new Error("date 는 YYYY-MM-DD 형식이어야 한다");
  const body = readEntry(ctx, date);
  if (body === null) {
    return { date, found: false, 안내: `${date} 에는 저장된 일기가 없다.` };
  }
  return { date, found: true, path: entryPath(ctx, date), body };
}
