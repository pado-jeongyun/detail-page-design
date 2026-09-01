import { isValidDate, removeEntry, type Ctx } from "./lib/store.ts";

export const meta = {
  description:
    "특정 날짜의 일기를 지운다. 되돌릴 수 없으므로 date 와 confirm:true 를 함께 줘야 지운다. confirm 없이는 지우지 않는다.",
  input: {
    type: "object",
    required: ["date"],
    properties: {
      date: { type: "string", description: "지울 일기 날짜 YYYY-MM-DD" },
      confirm: { type: "boolean", description: "true 여야 실제로 지운다" },
    },
  },
};

export default async function (input: { date?: string; confirm?: boolean }, ctx: Ctx) {
  const date = input?.date?.trim() || "";
  if (!isValidDate(date)) throw new Error("date 는 YYYY-MM-DD 형식이어야 한다");
  if (input?.confirm !== true) {
    return { date, removed: false, 안내: "confirm:true 가 있어야 지운다. 되돌릴 수 없으니 사용자에게 먼저 확인할 것." };
  }
  const removed = removeEntry(ctx, date);
  return { date, removed, 안내: removed ? `${date} 일기를 지웠다.` : `${date} 에는 지울 일기가 없었다.` };
}
