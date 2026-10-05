const ALLOWED_ORIGIN = "https://b5vg67mg72-jpg.github.io";
const JSON_HEADERS = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

const json = (body, status = 200, origin = ALLOWED_ORIGIN) => new Response(JSON.stringify(body), {
  status,
  headers: {
    ...JSON_HEADERS,
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    "Vary": "Origin",
  },
});

const clamp = value => Math.max(0, Math.min(100, Math.round(value)));
const profileScore = (value, q25, median, q75) => {
  const spread = Math.max(45, q75 - q25);
  return clamp(96 - Math.abs(value - median) / spread * 24);
};

const readBody = async request => {
  const declared = Number(request.headers.get("content-length") || 0);
  if (declared > 4096) throw new Error("invalid_request");
  const raw = await request.text();
  if (raw.length > 4096) throw new Error("invalid_request");
  const body = JSON.parse(raw || "{}");
  if (!body || Array.isArray(body) || typeof body !== "object") throw new Error("invalid_request");
  return body;
};

const textValue = (value, max = 50) => typeof value === "string" ? value.trim().slice(0, max) : "";
const likeValue = value => `%${value.replace(/[\\%_]/g, "\\$&")}%`;
const tokyoDate = () => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map(part => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
};

async function matchUniversities(request, env, origin) {
  const body = await readBody(request);
  const eju = Number(body.eju);
  const japanese = body.japanese === null || body.japanese === "" ? null : Number(body.japanese);
  const english = body.english === null || body.english === "" ? null : Number(body.english);
  const englishType = ["none", "toefl", "toeic"].includes(body.englishType) ? body.englishType : "none";
  const field = ["all", "business", "engineering", "humanities", "science", "social", "medical", "art", "other"].includes(body.field) ? body.field : "all";
  const keyword = textValue(body.keyword);
  if (!Number.isFinite(eju) || eju < 0 || eju > 850) return json({ error: "invalid_score" }, 400, origin);
  if (japanese !== null && (!Number.isFinite(japanese) || japanese < 0 || japanese > 450)) return json({ error: "invalid_score" }, 400, origin);
  if (english !== null && (!Number.isFinite(english) || english < 0 || english > 990)) return json({ error: "invalid_score" }, 400, origin);

  const conditions = [];
  const bindings = [];
  if (field !== "all") { conditions.push("category = ?"); bindings.push(field); }
  if (keyword) {
    conditions.push("(university LIKE ? ESCAPE '\\' OR faculty LIKE ? ESCAPE '\\')");
    const pattern = likeValue(keyword);
    bindings.push(pattern, pattern);
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT university, faculty, category, sample_count, q25, median, q75, japanese_median, toefl_median, toeic_median FROM admission_groups ${where} LIMIT 500`;
  const { results = [] } = await env.DB.prepare(query).bind(...bindings).all();
  const matches = results.map(row => {
    let weighted = profileScore(eju, row.q25, row.median, row.q75) * 0.7;
    let weight = 0.7;
    const reasons = [eju >= row.median ? "above" : eju >= row.q25 ? "middle" : "stretch"];
    if (japanese && row.japanese_median) {
      weighted += (japanese >= row.japanese_median ? 92 : clamp(92 - (row.japanese_median - japanese) * 0.5)) * 0.18;
      weight += 0.18;
      if (japanese >= row.japanese_median - 25) reasons.push("japanese");
    }
    const englishMedian = englishType === "toefl" ? row.toefl_median : englishType === "toeic" ? row.toeic_median : null;
    if (english && englishMedian) {
      const factor = englishType === "toefl" ? 1.15 : 0.09;
      weighted += (english >= englishMedian ? 92 : clamp(92 - (englishMedian - english) * factor)) * 0.12;
      weight += 0.12;
      reasons.push("english");
    }
    const reliability = Math.min(1, row.sample_count / 30);
    const score = clamp(weighted / weight - (1 - reliability) * 5);
    const tier = eju > row.q75 + 25 ? "safe" : eju >= row.q25 ? "match" : "reach";
    return { university: row.university, faculty: row.faculty, score, reasons: reasons.slice(0, 2), tier };
  }).sort((a, b) => b.score - a.score).slice(0, 6);
  return json({ matches }, 200, origin);
}

async function searchApplications(request, env, origin) {
  const body = await readBody(request);
  const keyword = textValue(body.keyword);
  const deadline = ["active", "upcoming", "all"].includes(body.deadline) ? body.deadline : "active";
  const essay = ["all", "required", "notRequired"].includes(body.essay) ? body.essay : "all";
  const conditions = [];
  const bindings = [];
  const today = tokyoDate();
  if (keyword) {
    const pattern = likeValue(keyword.replace(/\s/g, ""));
    conditions.push("(REPLACE(school, ' ', '') LIKE ? ESCAPE '\\' OR REPLACE(faculty, ' ', '') LIKE ? ESCAPE '\\' OR REPLACE(department, ' ', '') LIKE ? ESCAPE '\\')");
    bindings.push(pattern, pattern, pattern);
  }
  if (deadline === "active") { conditions.push("start_date <= ? AND end_date >= ?"); bindings.push(today, today); }
  if (deadline === "upcoming") { conditions.push("end_date >= ?"); bindings.push(today); }
  if (essay === "required") conditions.push("essay_requirement LIKE '需要%'");
  if (essay === "notRequired") conditions.push("essay_requirement NOT LIKE '需要%'");
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT id, school, faculty, department, application_period, eju_requirement, english_test, english_notes, university_exam, campus FROM applications ${where} ORDER BY end_date, school LIMIT 30`;
  const { results = [] } = await env.DB.prepare(query).bind(...bindings).all();
  return json({ results }, 200, origin);
}

async function applicationDetail(request, env, origin) {
  const body = await readBody(request);
  const id = textValue(body.id, 64);
  if (!/^[a-f0-9]{24}$/.test(id)) return json({ error: "not_found" }, 404, origin);
  const row = await env.DB.prepare("SELECT * FROM applications WHERE id = ? LIMIT 1").bind(id).first();
  return row ? json({ result: row }, 200, origin) : json({ error: "not_found" }, 404, origin);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    if (origin !== ALLOWED_ORIGIN) return json({ error: "forbidden" }, 403, ALLOWED_ORIGIN);
    if (request.method === "OPTIONS") return new Response(null, {
      status: 204,
      headers: { ...JSON_HEADERS, "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "600", "Vary": "Origin" },
    });
    if (request.method !== "POST" || request.headers.get("content-type")?.split(";", 1)[0] !== "application/json") return json({ error: "not_found" }, 404, origin);
    const clientKey = request.headers.get("CF-Connecting-IP") || "unknown";
    const limit = await env.RATE_LIMITER.limit({ key: clientKey });
    if (!limit.success) return json({ error: "rate_limited" }, 429, origin);
    try {
      const path = new URL(request.url).pathname;
      if (path === "/v1/match") return await matchUniversities(request, env, origin);
      if (path === "/v1/applications/search") return await searchApplications(request, env, origin);
      if (path === "/v1/applications/detail") return await applicationDetail(request, env, origin);
      return json({ error: "not_found" }, 404, origin);
    } catch {
      return json({ error: "invalid_request" }, 400, origin);
    }
  },
};
