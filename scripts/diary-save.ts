import { isValidDate, todayLocal, readEntry, writeEntry, entryPath, type Ctx } from "./lib/store.ts";

export const meta = {
  description:
    "완성한 일기 한 편을 그 날짜의 파일로 저장한다. date(YYYY-MM-DD)를 주지 않으면 오늘로 저장한다. body 는 일기 본문 전문이다(1인칭 시점의 완성된 글). 같은 날짜로 다시 저장하면 그 날 파일을 이 본문으로 갱신한다 — 이어 붙이지 않으므로, 같은 날 이야기를 보탤 때는 diary-read 로 기존 본문을 먼저 읽어 한 편으로 다시 엮어 저장할 것. 저장 후 path 를 돌려준다. 채팅으로 파일을 전달하려면 그 path 의 파일을 파일 교환 무대로 복사한다.",
  input: {
    type: "object",
    required: ["body"],
    properties: {
      date: { type: "string", description: "YYYY-MM-DD — 생략하면 오늘" },
      body: { type: "string", description: "일기 본문 전문(마크다운). 1인칭 시점의 완성된 글" },
    },
  },
};

export default async function (input: { date?: string; body?: string }, ctx: Ctx) {
  const date = input?.date?.trim() || todayLocal();
  if (!isValidDate(date)) throw new Error("date 는 YYYY-MM-DD 형식이어야 한다");
  const body = typeof input?.body === "string" ? input.body.trim() : "";
  if (!body) throw new Error("body(일기 본문)가 필요하다");

  const existed = readEntry(ctx, date) !== null;
  writeEntry(ctx, date, body);

  return {
    date,
    path: entryPath(ctx, date),
    filename: `${date}.md`,
    existed,
    bytes: Buffer.byteLength(body, "utf8"),
    body,
    안내: `${date} 일기를 ${existed ? "갱신" : "저장"}했다. 채팅으로 파일을 전달하려면 이 path 의 파일을 파일 교환 무대로 복사할 것.`,
  };
}
