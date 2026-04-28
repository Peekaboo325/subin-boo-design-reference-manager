import { useState, useRef } from "react";

const GAS_WEBHOOK = "https://script.google.com/macros/s/AKfycbw7U_4jieBRN_Qh2rrfPq3-Q-5GU94mC3BuvrL2LqgGICJFzFyhPz3mrt-c6iqOeBGx/exec";

const TYPO_LIST = [
  { group: "특수효과", items: ["3D타이포", "버블레터", "그라디언트", "네온사인", "스티커", "레트로_빈티지", "혼합타이포"] },
  { group: "세리프", items: ["세리프_씬", "세리프_볼드"] },
  { group: "산세리프", items: ["장식_산세리프", "고딕_씬", "고딕_레귤러", "고딕_볼드"] },
  { group: "기타", items: ["손글씨", "캘리그라피"] },
];

const MODELS = [
  { id: "haiku", label: "Claude Haiku", provider: "anthropic" },
  { id: "gemini-flash", label: "Gemini Flash", provider: "gemini" },
];

const SYSTEM_PROMPT = `이미지를 보내면 Pinterest 핀 제목과 설명란에 바로 붙여넣을 수 있는 키워드를 뽑아줘.
마크다운 없이 plain text로만 출력해.

출력 형식 (이 형식 그대로, 줄바꿈 포함):
제목: [제목내용]

[테마/콘셉트] 키워드1 / 키워드2
[타이포] 키워드1 / 키워드2
[소재/구성] 키워드1 / 키워드2
[컬러] 키워드1 / 키워드2
[오브젝트] 키워드1 / 키워드2 / 키워드3

출력 규칙:
- 카테고리별 최대 2개 (오브젝트 제외)
- 키워드 이름만 출력, 괄호 안 설명 절대 포함하지 말 것
- 마크다운 기호 일절 없이 plain text만
- 리스트에 딱 맞는 키워드가 없으면 억지로 맞추지 말고 반드시 (NEW) 키워드로 뽑을 것
- (NEW) 표시는 키워드 뒤에 붙일 것

제목 규칙:
- 형식: 주조색_메인소재_전달메시지
- 15자 이내, 언더바(_)로 구분
- 명사형으로 끝내기

키워드 선정 기준:
- 테마 → 전체 분위기나 목적에서 가장 지배적인 것. 분위기보다 이벤트/목적이 명확하면 그걸 우선
- 컬러 → 전체 화면에서 가장 넓은 면적 기준
- 소재/구성 → 이미지에서 가장 지배적인 시각 요소 기준
- 오브젝트 → 눈에 띄는 소재/사물 명사로

타이포 판단 기준 (반드시 이 순서대로 체크):
STEP 1 — 특수 효과 체크:
- 텍스트에 3D 입체감/두께감/그림자가 있는가? → 3D타이포
- 텍스트 형태가 통통하고 둥글둥글한가? → 버블레터
- 텍스트에 색상 그러데이션이 적용되어 있는가? → 그라디언트
- 텍스트가 빛나거나 네온 효과가 있는가? → 네온사인
- 스티커처럼 테두리/그림자 처리가 있는가? → 스티커
- 복고풍/오래된 느낌인가? → 레트로_빈티지
- 두 가지 이상 스타일이 혼합되어 있는가? → 혼합타이포

STEP 2 — 기본 폰트 분류:
- 삐침 있음 + 획이 가는가? → 세리프_씬
- 삐침 있음 + 획이 두꺼운가? → 세리프_볼드
- 곡선/스웨시 등 장식 요소가 있는가? → 장식_산세리프
- 장식 없고 획이 가는가? → 고딕_씬
- 장식 없고 획이 보통 굵기인가? → 고딕_레귤러
- 장식 없고 획이 두꺼운가? → 고딕_볼드
- 손글씨/붓글씨 느낌인가? → 손글씨 또는 캘리그라피
- 위 모두 해당 없으면 → (NEW)

키워드 리스트:

[테마/콘셉트]
큐트_걸리시 / 큐트_버블 / 큐트_소프트 / 큐트_팝
강렬_네온 / 강렬_다크 / 강렬_그런지 / 강렬_볼드
고급_미니멀 / 고급_글램 / 고급_무드
청량_내추럴 / 청량_시원 / 청량_그린
시즌_여름 / 시즌_겨울 / 시즌_봄 / 시즌_가을
이벤트_세일 / 이벤트_한정 / 이벤트_카운트다운 / 이벤트_주년 / 이벤트_론칭
바이럴_챌린지 / 바이럴_후기

[타이포 스타일]
3D타이포 / 버블레터 / 그라디언트 / 네온사인 / 스티커 / 레트로_빈티지 / 혼합타이포
세리프_씬 / 세리프_볼드
장식_산세리프 / 고딕_씬 / 고딕_레귤러 / 고딕_볼드
손글씨 / 캘리그라피

[소재/구성]
인물_전신 / 인물_상반신 / 인물_클로즈업 / 인물_실루엣
오브젝트_3D / 오브젝트_일러스트 / 오브젝트_실사
텍스트중심 / 비포애프터 / 그리드_분할 / 배경_풍경

[컬러]
핑크 / 블루 / 퍼플 / 그린 / 블랙 / 화이트 / 멀티컬러 / 민트 / 옐로우 / 레드

[오브젝트]
리스트 없이 자유롭게. 눈에 띄는 소재/사물을 명사로.`;

function parseResult(text) {
  const titleMatch = text.match(/제목[:：]\s*(.+)/);
  const title = titleMatch ? titleMatch[1].trim() : "";
  const keywordsStart = text.indexOf("[테마");
  const keywords = keywordsStart !== -1
  ? text.slice(keywordsStart).trim().replace(/\n+/g, "\n")
  : "";
  const newKeywords = [];
  const newRegex = /([^\s/\[\]\n]+)\s*\(NEW\)/g;
  let match;
  while ((match = newRegex.exec(keywords)) !== null) {
    newKeywords.push(match[1]);
  }
  return { title, keywords, newKeywords };
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function getImageDimensions(dataUrl) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ w: img.naturalWidth, h: img.naturalHeight });
    img.src = dataUrl;
  });
}

function copyText(text) {
  try {
    const el = document.createElement("textarea");
    el.value = text;
    el.style.position = "fixed";
    el.style.opacity = "0";
    document.body.appendChild(el);
    el.focus();
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  } catch (e) {}
}

async function analyzeWithClaude(base64, mediaType) {
  const headers = { "Content-Type": "application/json" };
  const response = await fetch("/api/analyze", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: [
      { type: "image", source: { type: "base64", media_type: mediaType, data: base64 } },
      { type: "text", text: "이 이미지의 제목과 키워드를 뽑아줘." }
    ]}]
  })
});
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.content?.map(c => c.text || "").join("") || "";
}

async function analyzeWithGemini(base64, mediaType) {
  const response = await fetch("/api/gemini",
    {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ parts: [
          { inline_data: { mime_type: mediaType, data: base64 } },
          { text: "이 이미지의 제목과 키워드를 뽑아줘." }
        ]}]
      })
    }
  );
  const data = await response.json();
  if (data.error) throw new Error(data.error.message);
  return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
}

async function saveToDrive(title, keywords, base64Full, mimeType) {
  const base64 = base64Full.split(",")[1];
  const response = await fetch("/api/save", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, keywords, imageBase64: base64, mimeType })
  });
  const data = await response.json();
  if (!data.success) throw new Error(data.error || "저장 실패");
  return data.fileUrl;
}

function Spinner({ color = "#fff" }) {
  return (
    <div style={{ display: "inline-block", width: "14px", height: "14px" }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}.drm-spin{animation:spin 0.8s linear infinite}`}</style>
      <svg className="drm-spin" viewBox="0 0 14 14" fill="none" style={{ width: "14px", height: "14px" }}>
        <circle cx="7" cy="7" r="5" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
        <path d="M7 2a5 5 0 0 1 5 5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

function EditableField({ value, onChange, multiline, fontSize, fontWeight, color }) {
  const [editing, setEditing] = useState(false);
  const baseStyle = {
    width: "100%", background: "transparent", border: "none", outline: "none",
    fontFamily: "inherit", fontSize, fontWeight, color, lineHeight: "1.7",
    letterSpacing: "0", padding: "0 0 4px 0", margin: 0, resize: "none",
    wordBreak: "break-word", boxSizing: "border-box", display: "block",
    overflow: "hidden", minHeight: "1.7em",
    borderBottom: "1px solid transparent",
  };

  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => e.key === "Enter" && e.preventDefault()}
        onFocus={() => setEditing(true)}
        onBlur={() => setEditing(false)}
        rows={Math.max(1, value.split("\n").length)}
        style={{
          ...baseStyle,
          cursor: editing ? "text" : "pointer",
          caretColor: editing ? color : "transparent",
          userSelect: editing ? "text" : "none",
          WebkitUserSelect: editing ? "text" : "none",
        }}
      />
    );
  }

  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setEditing(true)}
      onBlur={() => setEditing(false)}
      style={{
        ...baseStyle,
        whiteSpace: "nowrap",
        cursor: editing ? "text" : "pointer",
        caretColor: editing ? color : "transparent",
        userSelect: editing ? "text" : "none",
        WebkitUserSelect: editing ? "text" : "none",
      }}
    />
  );
}

export default function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState({});
  const [dragging, setDragging] = useState(false);
  const [allNewKeywords, setAllNewKeywords] = useState([]);
  const [lightbox, setLightbox] = useState(null);
  const [showTypoRef, setShowTypoRef] = useState(false);
  const [copiedTypo, setCopiedTypo] = useState(null);
  const [selectedModel, setSelectedModel] = useState("haiku");
  const inputRef = useRef();
  const THUMB_HEIGHT = 340;

  const handleFiles = async (newFiles) => {
    const imageFiles = Array.from(newFiles).filter(f => f.type.startsWith("image/"));
    const items = await Promise.all(imageFiles.map(async f => {
      const preview = await fileToBase64(f);
      const dims = await getImageDimensions(preview);
      return { id: Math.random().toString(36).slice(2), file: f, preview, ratio: dims.w / dims.h, status: "pending", result: null, error: null, saveStatus: null };
    }));
    setFiles(prev => [...prev, ...items]);
  };

  const handleExtractAll = async () => {
    const pending = files.filter(f => f.status === "pending");
    if (!pending.length) return;
    setLoading(true);
    for (const item of pending) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "loading" } : f));
      try {
        const base64 = item.preview.split(",")[1];
        const text = selectedModel === "haiku"
          ? await analyzeWithClaude(base64, item.file.type)
          : await analyzeWithGemini(base64, item.file.type);
        const result = parseResult(text);
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "done", result } : f));
        if (result.newKeywords.length > 0) setAllNewKeywords(prev => [...new Set([...prev, ...result.newKeywords])]);
      } catch (e) {
        setFiles(prev => prev.map(f => f.id === item.id ? { ...f, status: "error", error: e.message || "분석 실패" } : f));
      }
    }
    setLoading(false);
  };

  const handleSave = async (item) => {
    setFiles(prev => prev.map(f => f.id === item.id ? { ...f, saveStatus: "saving" } : f));
    try {
      const fileUrl = await saveToDrive(item.result.title, item.result.keywords, item.preview, item.file.type);
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, saveStatus: "saved", fileUrl } : f));
    } catch (e) {
      setFiles(prev => prev.map(f => f.id === item.id ? { ...f, saveStatus: "error" } : f));
    }
  };

  const updateResult = (id, field, value) => setFiles(prev => prev.map(f => f.id === id ? { ...f, result: { ...f.result, [field]: value } } : f));
  const handleCopy = (id, type, text) => { copyText(text); setCopied(p => ({ ...p, [`${id}-${type}`]: true })); setTimeout(() => setCopied(p => ({ ...p, [`${id}-${type}`]: false })), 1500); };
  const handleTypoCopy = (kw) => { copyText(kw); setCopiedTypo(kw); setTimeout(() => setCopiedTypo(null), 1500); };
  const pendingCount = files.filter(f => f.status === "pending").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0f0f0f", fontFamily: "'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif", padding: "32px 24px" }}>
      <div style={{ maxWidth: "960px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: "24px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <div style={{ display: "inline-block", background: "#e60023", color: "#fff", fontSize: "11px", fontWeight: "700", letterSpacing: "1px", padding: "4px 10px", marginBottom: "10px", fontFamily: "'DM Mono', monospace" }}>PINTEREST</div>
            <h1 style={{ color: "#fff", fontSize: "22px", fontWeight: "700", margin: 0, letterSpacing: "-0.3px" }}>Design Reference Manager</h1>
            <p style={{ color: "#666", fontSize: "12px", margin: "6px 0 0" }}>이미지 업로드 → 키워드 분석 → 검수 후 저장</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <select value={selectedModel} onChange={e => setSelectedModel(e.target.value)}
              style={{ background: "#1e1e1e", border: "1px solid #2a2a2a", color: "#ccc", borderRadius: "8px", padding: "10px 12px", fontSize: "12px", fontFamily: "inherit", cursor: "pointer", outline: "none" }}>
              {MODELS.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
            </select>
            <button onClick={handleExtractAll} disabled={loading || pendingCount === 0}
                style={{ background: loading || pendingCount === 0 ? "#2a2a2a" : "#e60023", color: "#fff", border: "none", borderRadius: "8px", padding: "10px 20px", fontSize: "13px", fontWeight: "600", cursor: loading || pendingCount === 0 ? "not-allowed" : "pointer", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "8px", opacity: pendingCount === 0 && !loading ? 0.35 : 1 }}>
                {loading ? "분석 중…" : `${pendingCount}장 분석`}
              </button>
          </div>
        </div>

        {/* 타이포 참조 패널 */}
        <div style={{ background: "#141414", border: "1px solid #222", borderRadius: "10px", marginBottom: "16px", overflow: "hidden" }}>
          <button onClick={() => setShowTypoRef(p => !p)}
            style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer", color: "#777", fontSize: "12px", fontWeight: "600", fontFamily: "inherit" }}>
            <span>타이포 키워드</span>
            <span style={{ fontSize: "11px", color: "#555" }}>{showTypoRef ? "접기" : "펼치기"}</span>
          </button>
          {showTypoRef && (
            <div style={{ padding: "4px 16px 16px", display: "flex", flexWrap: "wrap", gap: "16px" }}>
              {TYPO_LIST.map(({ group, items }) => (
                <div key={group}>
                  <div style={{ color: "#555", fontSize: "11px", fontWeight: "600", marginBottom: "6px" }}>{group}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {items.map(kw => (
                      <button key={kw} onClick={() => handleTypoCopy(kw)}
                        style={{ background: copiedTypo === kw ? "#0d2a1a" : "#1e1e1e", color: copiedTypo === kw ? "#4caf50" : "#bbb", fontSize: "11px", padding: "4px 10px", borderRadius: "4px", border: `1px solid ${copiedTypo === kw ? "#1a4a2a" : "#2a2a2a"}`, cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s" }}>
                        {copiedTypo === kw ? "복사됨 ✓" : kw}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* NEW 키워드 패널 */}
        {allNewKeywords.length > 0 && (
          <div style={{ background: "#0a1a18", border: "1px solid #1a3a35", borderRadius: "10px", padding: "14px 16px", marginBottom: "16px" }}>
            <div style={{ color: "#4db8a8", fontSize: "11px", fontWeight: "600", marginBottom: "10px" }}>신규 키워드 — 목록 추가 검토</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {allNewKeywords.map((kw, i) => (
                <span key={i} style={{ background: "#0f2a25", color: "#5dd6c4", fontSize: "12px", padding: "4px 10px", borderRadius: "4px", fontWeight: "600", border: "1px solid #1a4a42" }}>{kw}</span>
              ))}
            </div>
          </div>
        )}

        {/* 업로드 영역 */}
        <div
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFiles(e.dataTransfer.files); }}
          onClick={() => inputRef.current.click()}
          style={{ border: `2px dashed ${dragging ? "#e60023" : "#222"}`, borderRadius: "12px", padding: "32px", textAlign: "center", cursor: "pointer", marginBottom: "24px", background: dragging ? "#1a0a0a" : "#141414", transition: "all 0.15s" }}>
          <div style={{ color: dragging ? "#e60023" : "#555", fontSize: "13px" }}>이미지를 드래그하거나 클릭해서 업로드</div>
          <div style={{ color: "#666", fontSize: "12px", marginTop: "6px" }}>JPG, PNG, WEBP · 다중 선택 가능</div>
          <input ref={inputRef} type="file" accept="image/*" multiple onChange={e => handleFiles(e.target.files)} style={{ display: "none" }} />
        </div>

        {/* 카드 목록 */}
        {files.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))", gap: "16px" }}>
            {files.map(item => (
              <div key={item.id} style={{ background: "#1a1a1a", border: "1px solid #222", borderRadius: "12px", overflow: "hidden" }}>
                <div style={{ position: "relative", height: THUMB_HEIGHT, background: "#000", cursor: "zoom-in", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
                  onClick={() => setLightbox(item.preview)}>
                  <img src={item.preview} alt="" style={{ maxWidth: "100%", maxHeight: `${THUMB_HEIGHT}px`, width: "auto", height: "auto", display: "block" }} />
                  <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.65)", color: "#ccc", fontSize: "11px", padding: "3px 8px", borderRadius: "4px" }}>원본 보기</div>
                  <button onClick={e => { e.stopPropagation(); setFiles(prev => prev.filter(f => f.id !== item.id)); }}
                    style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(0,0,0,0.7)", color: "#fff", border: "none", borderRadius: "50%", width: "24px", height: "24px", cursor: "pointer", fontSize: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
                  {item.status === "loading" && (
                    <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.75)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "12px" }}>
                      <Spinner />
                      <span style={{ color: "#aaa", fontSize: "12px" }}>분석 중</span>
                    </div>
                  )}
                </div>
                <div style={{ padding: "16px" }}>
                  {item.status === "pending" && <div style={{ color: "#444", fontSize: "12px", textAlign: "center", padding: "8px 0" }}>대기 중</div>}
                  {item.status === "error" && <div style={{ color: "#ff6b6b", fontSize: "12px" }}>{item.error}</div>}
                  {item.status === "done" && item.result && (
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {[
                        { key: "title", label: "제목", field: "title", multiline: false, fontSize: "14px", fontWeight: "700", color: "#eee" },
                        { key: "keywords", label: "키워드", field: "keywords", multiline: true, fontSize: "12px", fontWeight: "400", color: "#ccc" }
                      ].map(({ key, label, field, multiline, fontSize, fontWeight, color }) => (
                        <div key={key} style={{ background: "#111", borderRadius: "8px", overflow: "hidden" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", borderBottom: "1px solid #1e1e1e" }}>
                            <span style={{ color: "#666", fontSize: "11px", fontWeight: "600" }}>{label}</span>
                            <button onClick={() => handleCopy(item.id, key, item.result[field])}
                              style={{ background: copied[`${item.id}-${key}`] ? "#1a3a1a" : "#1e1e1e", color: copied[`${item.id}-${key}`] ? "#4caf50" : "#888", border: "none", borderRadius: "4px", padding: "3px 8px", fontSize: "11px", cursor: "pointer", fontFamily: "inherit", fontWeight: "600" }}>
                              {copied[`${item.id}-${key}`] ? "복사됨 ✓" : "복사"}
                            </button>
                          </div>
                          <div style={{ padding: "10px 12px" }}>
                            <EditableField value={item.result[field]} onChange={v => updateResult(item.id, field, v)}
                              multiline={multiline} fontSize={fontSize} fontWeight={fontWeight} color={color} />
                          </div>
                        </div>
                      ))}

                      {/* Drive 저장 버튼 */}
                      <button
                        onClick={() => handleSave(item)}
                        disabled={item.saveStatus === "saving" || item.saveStatus === "saved"}
                        style={{
                          width: "100%",
                          padding: "10px",
                          borderRadius: "8px",
                          border: "none",
                          fontSize: "12px",
                          fontWeight: "600",
                          fontFamily: "inherit",
                          cursor: item.saveStatus === "saving" || item.saveStatus === "saved" ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          background: item.saveStatus === "saved" ? "#1a3a1a" : item.saveStatus === "error" ? "#2a1a1a" : "#1a2a3a",
                          color: item.saveStatus === "saved" ? "#4caf50" : item.saveStatus === "error" ? "#ff6b6b" : "#7ab8e8",
                          transition: "all 0.15s",
                        }}>
                        {item.saveStatus === "saving" && <><Spinner color="#7ab8e8" /> Drive에 저장 중</>}
                        {item.saveStatus === "saved" && "✓ Drive에 저장됨"}
                        {item.saveStatus === "error" && "저장 실패 — 다시 시도"}
                        {!item.saveStatus && "Drive에 저장"}
                      </button>

                      {/* 저장된 파일 링크 */}
                      {item.saveStatus === "saved" && item.fileUrl && (
                        <a href={item.fileUrl} target="_blank" rel="noopener noreferrer"
                          style={{ color: "#555", fontSize: "11px", textAlign: "center", textDecoration: "none" }}>
                          Drive에서 보기 →
                        </a>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {lightbox && (
        <div onClick={() => setLightbox(null)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.92)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, cursor: "zoom-out", padding: "24px" }}>
          <img src={lightbox} alt="" style={{ maxWidth: "100%", maxHeight: "100vh", objectFit: "contain", borderRadius: "8px" }} />
          <button onClick={() => setLightbox(null)}
            style={{ position: "fixed", top: "20px", right: "20px", background: "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>×</button>
        </div>
      )}
    </div>
  );
}
