// ── 简历预填数据（从 PDF 解析，首次打开时作为默认值） ────────────────────────
const RESUME_SEED = {
  profile: {
    name: "李婧漪", phone: "18108658857", email: "lijingyi030505@163.com",
    birthday: "2003-05-05", school: "上海财经大学", major: "应用统计",
    degree: "硕士", graduationYear: "2027", city: "上海", expectedCity: "上海",
    underGpa: "3.9", underRanking: "前5%", masterGpa: "", masterRanking: "",
    awards: "校优秀学生、校级一等奖学金、全国大学生数学建模省奖",
    political: "", nativePlace: ""
  },
  experienceEntries: {
    education: [
      { enabled: true, school: "上海财经大学", major: "应用统计", degree: "硕士",
        trainingType: "全日制", startTime: "2025-09", endTime: "2027-06" },
      { enabled: true, school: "中南财经政法大学", major: "应用统计学", degree: "本科",
        trainingType: "全日制", startTime: "2021-09", endTime: "2025-06" }
    ],
    internship: [
      { enabled: true, company: "滴滴", department: "国际化部门", position: "风控算法实习生",
        startTime: "2026-04", endTime: "至今",
        description: "主导贷款风险红蓝对抗仿真Agent系统与墨西哥BNPL可信主体识别风险分层模型两大项目。",
        responsibilities: "1. 基于MAI-UI设计Stateful多模态GUI Agent，实现注册、实名认证、活体检测等贷款全流程自动化攻击仿真，支持动态路径调整及异常恢复。\n2. 构建多模态攻击Skill库及Live Detection对抗子Agent，融合Seedance/Kling等视频生成模型，成功发现并验证多处真实风控漏洞。\n3. 采用XGBoost构建可信设备指纹/手机号/加白模型，优化标签体系后AUC由0.748→0.783，Top5% Lift由4.75→6.26。" },
      { enabled: true, company: "百融云创", department: "金融与数据支持部门", position: "大模型应用开发",
        startTime: "2025-09", endTime: "2026-01",
        description: "以Qwe3-4B为base，构建ETF投研场景垂域大模型后训练流水线及ETF财富管理Multi-Agent系统。",
        responsibilities: "1. 设计LLM as a judge + Self-Consistency Voting数据评估Pipeline，保证训练数据质量。\n2. 两阶段SFT：ETF专业评分3.5→4.0，FinEval准确率63%→70%；DPO偏好优化低覆盖率类别问题。\n3. 构建「主控智能体+专用智能体」ETF Multi-Agent系统，工具调用成功率由65%提升至85%+。" },
      { enabled: true, company: "众安保险", department: "数据科学部门", position: "算法实习生",
        startTime: "2025-04", endTime: "2025-08",
        description: "构建车辆保险自动化识别定损workflow，涵盖图像增强、部位识别与损伤定级。",
        responsibilities: "1. 复现HVI(CVPR 2025)图像增强模型，应用于夜视车辆照片，暗夜图转换率达85%+并部署上线。\n2. 微调Co-DETR(ICCV 2023)模型，实现保险杠、车门、翼子板等受损部位实例分割与分类，mAP@0.5达80%+。" }
    ],
    project: [
      { enabled: true, projectName: "时间序列EMD信息泄露问题研究", role: "共同第一作者",
        startTime: "2024-01", endTime: "2024-11",
        description: "Scientific Reports发表论文(JCR Q2, IF=4.6)，研究基于EMD的时间序列预测中测试集信息泄露问题。",
        responsibilities: "提出三种改进EMD分解策略——滑动窗口(SW)、单训练多预测(STMP)、多训练多预测(MTMP)，从源头切断未来数据泄漏，提升时间序列预测评估可靠性。" }
    ]
  }
}

const profileDefinitions = [
  { key: "name", label: "姓名", keywords: ["姓名", "真实姓名", "名字", "name"] },
  { key: "phone", label: "手机号", keywords: ["手机", "手机号", "电话", "联系方式", "phone", "mobile", "tel"] },
  { key: "email", label: "邮箱", keywords: ["邮箱", "电子邮件", "email", "mail"] },
  { key: "birthday", label: "出生日期", keywords: ["出生日期", "出生年月", "生日", "birthday", "date of birth"] },
  { key: "school", label: "学校", keywords: ["学校", "院校", "毕业院校", "高校", "school", "university"] },
  { key: "major", label: "专业", keywords: ["专业", "所学专业", "major"] },
  { key: "degree", label: "学历", keywords: ["学历", "学位", "degree"] },
  { key: "graduationYear", label: "毕业年份", keywords: ["毕业年份", "毕业时间", "毕业届别", "graduation", "graduate"] },
  { key: "city", label: "现居住地", keywords: ["现居住地", "现居地", "当前城市", "所在地", "居住城市", "居住地", "现住地", "城市"] },
  { key: "expectedCity", label: "期望城市", keywords: ["期望城市", "意向城市", "工作城市", "期望工作地", "希望城市"] },
  { key: "underGpa", label: "本科绩点", keywords: ["本科绩点", "本科GPA", "绩点", "gpa", "成绩绩点"] },
  { key: "underRanking", label: "本科专业排名", keywords: ["本科专业排名", "专业排名区间", "专业排名", "成绩排名", "班级排名"] },
  { key: "masterGpa", label: "硕士绩点", keywords: ["硕士绩点", "研究生绩点", "硕士GPA", "研究生GPA"] },
  { key: "masterRanking", label: "硕士专业排名", keywords: ["硕士专业排名", "硕士排名", "研究生排名"] },
  { key: "awards", label: "获奖情况", keywords: ["获奖情况", "获奖经历", "奖项", "荣誉奖项", "获奖"] },
  { key: "political", label: "政治面貌", keywords: ["政治面貌", "政治身份", "政治"] },
  { key: "nativePlace", label: "籍贯", keywords: ["籍贯", "户籍", "生源地", "出生地"] }
]

const defaultCustomFields = [
  { label: "期望岗位", value: "", keywords: "期望岗位,意向岗位,应聘岗位,求职意向" }
]

// ── 经历类型定义（关键词对用户隐藏，只需填内容）────────────────────────────

const experienceSchemas = {
  education: {
    name: "教育经历",
    sectionKeywords: ["教育经历", "教育背景", "学习经历"],
    addKeywords: ["添加", "+", "新增", "添加教育经历"],
    confirmKeywords: ["确认", "保存", "确定"],
    waitMs: 800,
    fields: [
      { key: "school",       label: "学校名称", placeholder: "XX大学",
        keywords: ["学校", "院校", "学校名称", "毕业院校"] },
      { key: "major",        label: "专业",     placeholder: "计算机科学与技术",
        keywords: ["专业", "所学专业"] },
      { key: "degree",       label: "学历",     placeholder: "本科",
        keywords: ["学历", "学位"] },
      { key: "trainingType", label: "培养形式", placeholder: "全日制",
        keywords: ["培养形式", "就读方式", "学习形式", "教育形式", "培养方式"] },
      { key: "startTime",    label: "开始时间", placeholder: "2020-09",
        keywords: ["开始时间", "入学时间", "入学", "开始"] },
      { key: "endTime",      label: "结束时间", placeholder: "2024-06",
        keywords: ["结束时间", "毕业时间", "毕业", "结束"] }
    ]
  },
  internship: {
    name: "实习经历",
    sectionKeywords: ["实习经历", "工作经历"],
    addKeywords: ["添加", "+", "新增"],
    confirmKeywords: ["确认", "保存", "确定"],
    waitMs: 800,
    fields: [
      { key: "company",         label: "公司名称",   placeholder: "XX公司",
        keywords: ["公司", "公司名称", "单位", "组织", "企业名称"] },
      { key: "department",      label: "部门",       placeholder: "数据分析部",
        keywords: ["部门", "团队", "所在部门"] },
      { key: "position",        label: "职位/职务",  placeholder: "数据分析实习生",
        keywords: ["职位", "职务", "岗位", "职称"] },
      { key: "startTime",       label: "开始时间",   placeholder: "2023-07",
        keywords: ["开始时间", "开始", "起始", "入职"] },
      { key: "endTime",         label: "结束时间",   placeholder: "2023-10",
        keywords: ["结束时间", "结束", "离职", "至"] },
      { key: "description",     label: "工作描述",   placeholder: "负责...",     textarea: true,
        keywords: ["工作描述", "工作内容", "实习内容", "实习描述", "描述内容", "工作简介"] },
      { key: "responsibilities",label: "工作中职责", placeholder: "1. 负责...", textarea: true,
        keywords: ["工作中职责", "工作职责", "职责", "主要职责", "具体工作", "工作情况"] }
    ]
  },
  project: {
    name: "项目经历",
    sectionKeywords: ["项目经历", "项目经验"],
    addKeywords: ["添加", "+", "新增", "添加项目经历"],
    confirmKeywords: ["确认", "保存", "确定"],
    waitMs: 800,
    fields: [
      { key: "projectName",     label: "项目名称",   placeholder: "XX系统",
        keywords: ["项目名称", "项目名"] },
      { key: "role",            label: "职务/角色",  placeholder: "前端开发",
        keywords: ["职务", "职位", "角色", "担任", "项目角色", "担任角色"] },
      { key: "startTime",       label: "开始时间",   placeholder: "2023-03",
        keywords: ["开始时间", "开始", "起始"] },
      { key: "endTime",         label: "结束时间",   placeholder: "2023-06",
        keywords: ["结束时间", "结束", "至"] },
      { key: "description",     label: "项目描述",   placeholder: "项目背景与目标...", textarea: true,
        keywords: ["项目描述", "描述内容", "项目背景", "项目简介", "项目介绍"] },
      { key: "responsibilities",label: "项目中职责", placeholder: "1. 负责...", textarea: true,
        keywords: ["项目中职责", "项目职责", "职责", "主要职责", "工作职责", "工作成果"] }
    ]
  }
}

// ── 初始化 ────────────────────────────────────────────────────────────────────
// Script is at bottom of <body>, so DOM is already ready when this runs.
// DOMContentLoaded has already fired at this point in Chrome extension pages —
// do NOT wrap in addEventListener("DOMContentLoaded", ...) or it will never run.

function setupListeners() {
  function on(sel, event, fn) {
    const el = document.querySelector(sel)
    if (el) el.addEventListener(event, fn)
  }

  on("#addCustomField", "click", () => addCustomFieldRow())
  on("#add-education", "click", () => {
    const c = document.querySelector("#educationEntries")
    if (c) c.appendChild(createEntryElement("education"))
  })
  on("#add-internship", "click", () => {
    const c = document.querySelector("#internshipEntries")
    if (c) c.appendChild(createEntryElement("internship"))
  })
  on("#add-project", "click", () => {
    const c = document.querySelector("#projectEntries")
    if (c) c.appendChild(createEntryElement("project"))
  })

  on("#save", "click", saveSettings)
  on("#resumeFileInput", "change", handleResumeFileChange)
  on("#parseResume", "click", () => {
    const txt = document.querySelector("#resumeText")
    if (txt) parseResumeIntoForm(txt.value)
    const st = document.querySelector("#status")
    if (st) st.textContent = "已根据简历文本预填，请检查后保存。"
  })
  on("#reset", "click", () => {
    for (const def of profileDefinitions) {
      const el = document.querySelector(`#profile-${def.key}`)
      if (el) el.value = ""
    }
    renderCustomFields(defaultCustomFields)
    renderAllExperienceEntries({ education: [], internship: [], project: [] })
    const st = document.querySelector("#status")
    if (st) st.textContent = "已恢复默认，记得保存。"
  })
}

async function loadSavedData() {
  const data = await chrome.storage.local.get(["profile", "customFields", "experienceEntries", "resumeFile"])
  const profile = (data.profile && data.profile.name) ? data.profile : RESUME_SEED.profile
  const customFields = data.customFields || defaultCustomFields
  const savedE = data.experienceEntries
  const hasRealEntries = savedE && (
    (savedE.education  || []).some(e => e.school?.trim())      ||
    (savedE.internship || []).some(e => e.company?.trim())     ||
    (savedE.project    || []).some(e => e.projectName?.trim())
  )
  const experienceEntries = hasRealEntries ? savedE : RESUME_SEED.experienceEntries

  for (const def of profileDefinitions) {
    const inp = document.querySelector(`#profile-${def.key}`)
    if (inp) inp.value = profile[def.key] || ""
  }
  try { renderCustomFields(customFields) }       catch (e) { console.error('[ext] renderCustomFields', e) }
  try { renderAllExperienceEntries(experienceEntries) } catch (e) { console.error('[ext] renderAllExperienceEntries', e) }
  try { updateResumeFileStatus(data.resumeFile) } catch (e) { console.error('[ext] updateResumeFileStatus', e) }
}

// ── 常用信息 ──────────────────────────────────────────────────────────────────

function renderProfileFields() {
  const container = document.querySelector("#profileFields")
  if (!container) return
  // Remove previously created profile inputs
  profileDefinitions.forEach(def => {
    const inp = document.getElementById(`profile-${def.key}`)
    if (inp && inp.parentElement) inp.parentElement.remove()
  })
  // Remove any orphaned non-profile children left over from malformed cached HTML
  Array.from(container.children).forEach(child => {
    if (!child.querySelector('[id^="profile-"]') && !child.id?.startsWith("profile-")) child.remove()
  })
  for (const def of profileDefinitions) {
    const label = document.createElement("label")
    label.textContent = def.label
    const input = document.createElement("input")
    input.id = `profile-${def.key}`
    input.autocomplete = def.key
    input.placeholder = getProfilePlaceholder(def.key)
    label.appendChild(input)
    container.appendChild(label)
  }
}

function cleanupOldExperienceSections() {
  // Remove ALL sections whose h2 matches an experience heading — we'll recreate them fresh.
  // This removes stale/duplicate sections from old cached HTML versions.
  const titles = new Set(["教育经历", "实习经历", "项目经历"])
  document.querySelectorAll("main > section, body > section").forEach(sec => {
    const h2 = sec.querySelector("h2")
    if (h2 && titles.has(h2.textContent.trim())) sec.remove()
  })
}

function ensureExperienceSections() {
  const main = document.querySelector("main")
  if (!main) return
  const anchor = document.querySelector("#save") || null
  const specs = [
    { typeKey: "education",  h2: "教育经历", p: "每条对应一段教育。启用后，插件会自动在表单里依次添加并填写。", btn: "+ 添加教育经历" },
    { typeKey: "internship", h2: "实习经历", p: "每条对应一段实习，多段实习依次添加即可。",                   btn: "+ 添加实习经历" },
    { typeKey: "project",    h2: "项目经历", p: "每条对应一个项目。",                                        btn: "+ 添加项目经历" }
  ]
  for (const s of specs) {
    if (document.getElementById(`add-${s.typeKey}`)) continue
    const sec = document.createElement("section")
    const h2  = document.createElement("h2");  h2.textContent = s.h2;  sec.appendChild(h2)
    const p   = document.createElement("p");   p.textContent  = s.p;   sec.appendChild(p)
    const div = document.createElement("div"); div.id = `${s.typeKey}Entries`; div.className = "entry-list"; sec.appendChild(div)
    const btn = document.createElement("button")
    btn.id = `add-${s.typeKey}`; btn.type = "button"; btn.className = "secondary add-exp-btn"; btn.textContent = s.btn
    sec.appendChild(btn)
    anchor ? main.insertBefore(sec, anchor) : main.appendChild(sec)
  }
}

function getProfilePlaceholder(key) {
  const map = {
    name: "李静怡", phone: "18108658857", email: "example@163.com",
    birthday: "2003-05-05", school: "XX大学", major: "计算机科学与技术",
    degree: "本科", graduationYear: "2025", city: "上海", expectedCity: "上海,北京",
    underGpa: "3.8", underRanking: "前10%", masterGpa: "", masterRanking: "",
    awards: "国家奖学金", political: "共青团员", nativePlace: "四川"
  }
  return map[key] || ""
}

// ── 自定义字段 ────────────────────────────────────────────────────────────────

function renderCustomFields(fields) {
  const container = document.querySelector("#customFields")
  container.innerHTML = ""
  for (const field of fields) addCustomFieldRow(field)
}

function addCustomFieldRow(field = {}) {
  const row = document.createElement("div")
  row.className = "field-row"

  function makeInput(labelText, cls, val, ph) {
    const lbl = document.createElement("label")
    lbl.textContent = labelText
    const inp = document.createElement("input")
    inp.className = cls
    inp.value = val || ""
    inp.placeholder = ph
    lbl.appendChild(inp)
    return lbl
  }

  const removeBtn = document.createElement("button")
  removeBtn.type = "button"
  removeBtn.className = "secondary remove-field"
  removeBtn.textContent = "删除"
  removeBtn.addEventListener("click", () => row.remove())

  row.appendChild(makeInput("字段名", "custom-label", field.label, "籍贯"))
  row.appendChild(makeInput("要填写的内容", "custom-value", field.value, "上海"))
  row.appendChild(makeInput("匹配关键词", "custom-keywords", field.keywords, "籍贯,户籍,生源地"))
  row.appendChild(removeBtn)
  document.querySelector("#customFields").appendChild(row)
}

// ── 经历 ──────────────────────────────────────────────────────────────────────

function renderAllExperienceEntries(allEntries) {
  for (const typeKey of Object.keys(experienceSchemas)) {
    const container = document.querySelector(`#${typeKey}Entries`)
    if (!container) continue
    while (container.firstChild) container.removeChild(container.firstChild)
    for (const entry of (allEntries[typeKey] || [])) {
      container.appendChild(createEntryElement(typeKey, entry))
    }
  }
}

function createEntryElement(typeKey, entry = {}) {
  const schema = experienceSchemas[typeKey]
  const el = document.createElement("div")
  el.className = "exp-entry"
  const enabled = entry.enabled !== false

  // Head row: enable checkbox + delete button
  const head = document.createElement("div")
  head.className = "exp-entry-head"
  const enableLabel = document.createElement("label")
  enableLabel.className = "inline"
  const checkbox = document.createElement("input")
  checkbox.type = "checkbox"
  checkbox.className = "entry-enabled"
  checkbox.checked = enabled
  enableLabel.appendChild(checkbox)
  enableLabel.appendChild(document.createTextNode(" 启用"))
  const removeBtn = document.createElement("button")
  removeBtn.type = "button"
  removeBtn.className = "secondary remove-entry"
  removeBtn.textContent = "删除"
  removeBtn.addEventListener("click", () => el.remove())
  head.appendChild(enableLabel)
  head.appendChild(removeBtn)
  el.appendChild(head)

  // Input fields grouped into rows of max 3
  const inputFields = schema.fields.filter((f) => !f.textarea)
  for (let i = 0; i < inputFields.length; i += 3) {
    const chunk = inputFields.slice(i, i + 3)
    const row = document.createElement("div")
    row.className = `exp-row exp-row-${chunk.length}`
    for (const f of chunk) {
      const lbl = document.createElement("label")
      lbl.textContent = f.label
      const inp = document.createElement("input")
      inp.className = "entry-field"
      inp.dataset.key = f.key
      inp.value = entry[f.key] || ""
      inp.placeholder = f.placeholder || ""
      lbl.appendChild(inp)
      row.appendChild(lbl)
    }
    el.appendChild(row)
  }

  // Textarea fields (full width)
  for (const f of schema.fields.filter((f) => f.textarea)) {
    const lbl = document.createElement("label")
    lbl.textContent = f.label
    const ta = document.createElement("textarea")
    ta.className = "entry-field"
    ta.dataset.key = f.key
    ta.rows = 3
    ta.placeholder = f.placeholder || ""
    ta.value = entry[f.key] || ""
    lbl.appendChild(ta)
    el.appendChild(lbl)
  }

  return el
}

function collectExperienceEntries() {
  const result = {}
  for (const typeKey of Object.keys(experienceSchemas)) {
    result[typeKey] = [...document.querySelectorAll(`#${typeKey}Entries .exp-entry`)].map((el) => {
      const entry = { enabled: el.querySelector(".entry-enabled").checked }
      for (const fieldEl of el.querySelectorAll(".entry-field")) {
        entry[fieldEl.dataset.key] = fieldEl.value.trim()
      }
      return entry
    })
  }
  return result
}

function entriesToTemplates(allEntries) {
  const templates = []
  for (const [typeKey, schema] of Object.entries(experienceSchemas)) {
    for (const entry of (allEntries[typeKey] || [])) {
      if (!entry.enabled) continue
      const rules = schema.fields
        .filter((f) => entry[f.key])
        .map((f, i) => ({
          key: `${typeKey}-${i}`,
          label: f.label,
          value: entry[f.key],
          keywords: f.keywords
        }))
      templates.push({
        name: schema.name,
        enabled: true,
        sectionKeywords: schema.sectionKeywords,
        addKeywords: schema.addKeywords,
        confirmKeywords: schema.confirmKeywords,
        waitMs: schema.waitMs,
        rules
      })
    }
  }
  return templates
}

async function saveSettings() {
  const profile = collectProfile()
  try {
    const customFields = collectCustomFields()
    const experienceEntries = collectExperienceEntries()
    const rules = buildRules(profile, customFields)
    const experienceTemplates = entriesToTemplates(experienceEntries)
    await chrome.storage.local.set({ profile, customFields, rules, experienceEntries, experienceTemplates })
    document.querySelector("#status").textContent = "已保存。"
  } catch (error) {
    document.querySelector("#status").textContent = `保存失败：${error.message}`
  }
}

function collectProfile() {
  const profile = {}
  for (const def of profileDefinitions) {
    profile[def.key] = document.querySelector(`#profile-${def.key}`).value.trim()
  }
  return profile
}

function collectCustomFields() {
  return [...document.querySelectorAll("#customFields .field-row")].map((row) => ({
    label: row.querySelector(".custom-label").value.trim(),
    value: row.querySelector(".custom-value").value.trim(),
    keywords: row.querySelector(".custom-keywords").value.trim()
  })).filter((f) => f.label || f.value || f.keywords)
}

function buildRules(profile, customFields) {
  const profileRules = profileDefinitions
    .filter((def) => profile[def.key])
    .map((def) => ({ key: def.key, label: def.label, value: profile[def.key], keywords: def.keywords }))

  const customRules = customFields
    .filter((f) => f.value && f.keywords)
    .map((f, i) => ({
      key: `custom-${i}`,
      label: f.label || `自定义字段 ${i + 1}`,
      value: f.value,
      keywords: splitKeywords(f.keywords)
    }))

  return [...profileRules, ...customRules]
}

async function handleResumeFileChange(event) {
  const file = event.target.files?.[0]
  if (!file) return
  try {
    const dataUrl = await readFileAsDataUrl(file)
    const resumeFile = { name: file.name, type: file.type || "application/pdf", size: file.size, dataUrl }
    await chrome.storage.local.set({ resumeFile })
    updateResumeFileStatus(resumeFile)
    document.querySelector("#status").textContent = "简历文件已保存到本地扩展。"
  } catch (error) {
    document.querySelector("#status").textContent = `保存简历失败：${error.message}`
  }
}

function parseResumeIntoForm(rawText) {
  const text = normalizeText(rawText)
  if (!text) return
  const parsed = parseResumeText(text)
  for (const [key, value] of Object.entries(parsed)) {
    const input = document.querySelector(`#profile-${key}`)
    if (input && value && !input.value.trim()) input.value = value
  }
}

function parseResumeText(text) {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean)
  const parsed = {}
  parsed.email = matchFirst(text, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  parsed.phone = matchFirst(text, /(?:\+?86[-\s]?)?(1[3-9]\d[-\s]?\d{4}[-\s]?\d{4})/)
  if (parsed.phone) parsed.phone = parsed.phone.replace(/\D/g, "").replace(/^86/, "")
  parsed.name = findLabeledValue(text, ["姓名", "名字"]) || guessName(lines)
  parsed.birthday = findLabeledValue(text, ["出生日期", "出生年月", "生日"]) ||
    matchFirst(text, /((?:19|20)\d{2}[-/年]\d{1,2}[-/月]\d{1,2}[日号]?)/)
  parsed.school = findLineByKeywords(lines, ["大学", "学院", "学校", "院校", "University", "College"])
  parsed.major = findLabeledValue(text, ["专业", "所学专业", "Major"])
  parsed.degree = matchFirst(text, /(博士研究生|硕士研究生|本科|研究生|博士|硕士|学士|大专)/)
  parsed.graduationYear = matchFirst(text, /(20[2-3]\d)\s*(?:年)?\s*(?:毕业|届)/) || matchFirst(text, /(20[2-3]\d)/)
  parsed.city = findLabeledValue(text, ["现居地", "现居住地", "当前城市", "所在地", "城市"])
  parsed.expectedCity = findLabeledValue(text, ["期望城市", "意向城市", "期望工作地", "工作城市"])
  parsed.nativePlace = findLabeledValue(text, ["籍贯", "户籍", "生源地", "出生地"])
  parsed.underGpa = findLabeledValue(text, ["本科绩点", "GPA", "绩点"]) || matchFirst(text, /绩点[：:\s]*([0-9.]+)/)
  parsed.underRanking = findLabeledValue(text, ["本科专业排名", "专业排名", "班级排名"])
  parsed.masterGpa = findLabeledValue(text, ["硕士绩点", "研究生绩点"])
  parsed.masterRanking = findLabeledValue(text, ["硕士专业排名", "硕士排名"])
  parsed.awards = findLabeledValue(text, ["获奖情况", "奖项", "荣誉"]) ||
    matchFirst(text, /(国家奖学金|国家励志奖学金|[一二三]等奖学金|校级奖学金|省级奖学金)/)
  parsed.political = findLabeledValue(text, ["政治面貌", "政治身份"]) ||
    matchFirst(text, /(中共党员|预备党员|共青团员|群众|民主党派)/)
  return parsed
}

function updateResumeFileStatus(resumeFile) {
  document.querySelector("#resumeFileStatus").textContent = resumeFile
    ? `已保存：${resumeFile.name}（${Math.ceil((resumeFile.size || 0) / 1024)} KB）`
    : "还没有保存简历文件。"
}

// ── 工具函数 ──────────────────────────────────────────────────────────────────

function splitKeywords(value) {
  return String(value || "").split(/[,，、\n]/).map((s) => s.trim()).filter(Boolean)
}

function findLabeledValue(text, labels) {
  for (const label of labels) {
    const escaped = escapeRegExp(label)
    const match = text.match(new RegExp(`${escaped}\\s*[:：]?\\s*([^\\n|,，;；]{2,40})`, "i"))
    if (match) return cleanupValue(match[1])
  }
  return ""
}

function findLineByKeywords(lines, keywords) {
  const line = lines.find((l) => keywords.some((kw) => l.toLowerCase().includes(kw.toLowerCase())))
  return cleanupValue(line || "")
}

function guessName(lines) {
  return lines.slice(0, 6).find((l) => /^[一-龥]{2,4}$/.test(l)) || ""
}

function matchFirst(text, regex) {
  const m = text.match(regex)
  return m ? cleanupValue(m[1] || m[0]) : ""
}

function cleanupValue(value) {
  return String(value || "").replace(/[|,，;；].*$/, "").trim()
}

function normalizeText(text) {
  return String(text || "").replace(/\r/g, "\n").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim()
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(reader.error || new Error("读取文件失败"))
    reader.readAsDataURL(file)
  })
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function escapeHtml(text) {
  return String(text).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c])
}

// DOM is ready — script is at bottom of <body>, call directly
;(function initOptionsPage() {
  cleanupOldExperienceSections()
  try { renderProfileFields() } catch (e) { console.error('[ext] renderProfileFields', e) }
  ensureExperienceSections()
  setupListeners()
  loadSavedData().catch(e => console.error('[ext] loadSavedData', e))
})()
