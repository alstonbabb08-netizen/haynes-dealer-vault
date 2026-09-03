const BASE = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api`;
let authToken: string | null = null;
export const setAuthToken = (t: string | null) => { authToken = t; };
export const getApiBase = () => BASE;
export const getToken = () => authToken;

async function req(path: string, opts: RequestInit = {}) {
  const headers: Record<string, string> = { "Content-Type": "application/json", ...((opts.headers as Record<string, string>) || {}) };
  if (authToken) headers["Authorization"] = `Bearer ${authToken}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers });
  let data: any = null; try { data = await res.json(); } catch { data = {}; }
  if (!res.ok) { const msg = typeof data?.detail === "string" ? data.detail : "Request failed"; throw new Error(msg); }
  return data;
}

export const api = {
  register: (name: string, email: string, password: string) => req("/auth/register", { method: "POST", body: JSON.stringify({ name, email, password }) }),
  login: (email: string, password: string) => req("/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  me: () => req("/auth/me"),
  makes: () => req("/vehicles/makes"),
  models: (make: string) => req(`/vehicles/models?make=${encodeURIComponent(make)}`),
  years: (make: string, model: string) => req(`/vehicles/years?make=${encodeURIComponent(make)}&model=${encodeURIComponent(model)}`),
  searchVehicles: (q: string) => req(`/vehicles/search?q=${encodeURIComponent(q)}`),
  topics: () => req("/guides/topics"),
  generateGuide: (payload: { make: string; model: string; year: number; manual_type: string; topic: string }) => req("/guides/generate", { method: "POST", body: JSON.stringify(payload) }),
  obdCommon: () => req("/obd/common"),
  obdSearch: (q: string) => req(`/obd/search?q=${encodeURIComponent(q)}`),
  obdLookup: (code: string) => req(`/obd/lookup?code=${encodeURIComponent(code)}`),
  obdTroubleshoot: (code: string, vehicle?: string) => req("/obd/troubleshoot", { method: "POST", body: JSON.stringify({ code, vehicle }) }),
  chatSessions: () => req("/chat/sessions"),
  createChat: () => req("/chat/sessions", { method: "POST" }),
  chatMessages: (sid: string) => req(`/chat/sessions/${sid}/messages`),
  sendChat: (sid: string, text: string) => req(`/chat/sessions/${sid}/message`, { method: "POST", body: JSON.stringify({ text }) }),
  deleteChat: (sid: string) => req(`/chat/sessions/${sid}`, { method: "DELETE" }),
  manuals: () => req("/manuals"),
  deleteManual: (mid: string) => req(`/manuals/${mid}`, { method: "DELETE" }),
  manualFileUrl: (mid: string) => `${BASE}/manuals/${mid}/file?token=${authToken}`,
  decodeVin: (vin: string) => req(`/vehicles/vin/${encodeURIComponent(vin)}`),
  tsbs: (make: string, model: string, year: number) => req("/library/tsbs", { method: "POST", body: JSON.stringify({ make, model, year }) }),
  wiringSystems: () => req("/library/wiring-systems"),
  wiring: (make: string, model: string, year: number, system: string) => req("/library/wiring", { method: "POST", body: JSON.stringify({ make, model, year, system }) }),
  listQuestions: (sort="recent",q="",code="") => req(`/community/questions?sort=${sort}&q=${encodeURIComponent(q)}&code=${encodeURIComponent(code)}`),
  createQuestion: (payload: { title: string; body: string; make?: string; model?: string; year?: string; code?: string }) => req("/community/questions", { method: "POST", body: JSON.stringify(payload) }),
  getQuestion: (id: string) => req(`/community/questions/${id}`),
  addAnswer: (id: string, body: string) => req(`/community/questions/${id}/answers`, { method: "POST", body: JSON.stringify({ body }) }),
  voteQuestion: (id: string) => req(`/community/questions/${id}/vote`, { method: "POST" }),
  voteAnswer: (id: string) => req(`/community/answers/${id}/vote`, { method: "POST" }),
  acceptAnswer: (id: string) => req(`/community/answers/${id}/accept`, { method: "POST" }),
  uploadManual: async (form: FormData) => { const headers: Record<string,string>={}; if(authToken) headers["Authorization"]=`Bearer ${authToken}`; const res=await fetch(`${BASE}/manuals`,{method:"POST",headers,body:form}); const data=await res.json().catch(()=>({})); if(!res.ok) throw new Error(data?.detail||"Upload failed"); return data; },
};
