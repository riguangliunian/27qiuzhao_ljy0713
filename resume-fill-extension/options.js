const profileDefinitions = [
  { key: "name", label: "姓名", keywords: ["姓名", "真实姓名", "名字", "name"] },
  { key: "phone", label: "手机号", keywords: ["手机", "手机号", "电话", "联系方式", "phone", "mobile", "tel"] },
  { key: "email", label: "邮箱", keywords: ["邮箱", "电子邮件", "email", "mail"] },
  { key: "school", label: "学校", keywords: ["学校", "院校", "毕业院校", "高校", "school", "university"] },
  { key: "major", label: "专业", keywords: ["专业", "所学专业", "major"] },
  { key: "degree", label: "学历", keywords: ["学历", "学位", "degree"] },
  { key: "graduationYear", label: "毕业年份", keywords: ["毕业年份", "毕业时间", "毕业届别", "graduation", "graduate"] },
  { key: "city", label: "当前城市", keywords: ["当前城市", "现居地", "所在地", "居住城市"] },
  { key: "expectedCity", label: "期望城市", keywords: ["期望城市", "意向城市", "工作城市", "期望工作地"] },
  { key: "nativePlace", label: "籍贯", keywords: ["籍贯", "户籍", "生源地", "出生地"] }
]

const defaultCustomFields = [
  { label: "政治面貌", value: "", keywords: "政治面貌,政治身份" },
  { label: "期望岗位", value: "", keywords: "期望岗位,意向岗位,应聘岗位" }
]

const defaultExperienceSections = [
  {
    name: "实习经历",
    enabled: false,
    sectionKeywords: "实习经历,工作经历",
    addKeywords: "添加,+,新增",
    waitMs: 700,
    fields: [
      { label: "公司名称", value: "", keywords: "公司,单位,组织" },
      { label: "职位名称", value: "", keywords: "职位,岗位,职务,title" },
      { label: "开始时间", value: "", keywords: "开始,起始,入职" },
      { label: "结束时间", value: "", keywords: "结束,离职,至" },
      { label: "经历描述", value: "", keywords: "描述,内容,职责,工作内容,经历" }
    ]
  },
  {
    name: "项目经历",
    enabled: false,
    sectionKeywords: "项目经历,项目经验",
    addKeywords: "添加,+,新增",
    waitMs: 700,
    fields: [
      { label: "项目名称", value: "", keywords: "项目名称,项目" },
      { label: "项目角色", value: "", keywords: "角色,职责,担任" },
      { label: "开始时间", value: "", keywords: "开始,起始" },
      { label: "结束时间", value: "", keywords: "结束,至" },
      { label: "项目描述", value: "", keywords: "描述,内容,项目内容,成果" }
    ]
  }
]

init()

async function init() {
  renderProfileFields()
  const data = await chrome.storage.local.get(["profile", "customFields", "experienceSections", "experienceTemplates", "resumeFile"])
  const profile = data.profile || {}
  const customFields = data.customFields || defaultCustomFields
  const experienceSections = data.experienceSections || templatesToSections(data.experienceTemplates) || defaultExperienceSections

  for (const definition of profileDefinitions) {
    document.querySelector(`#profile-${definition.key}`).value = profile[definition.key] || ""
  }
  renderCustomFields(customFields)
  renderExperienceSections(experienceSections)
  updateResumeFileStatus(data.resumeFile)
}

function renderProfileFields() {
  const container = document.querySelector("#profileFields")
  container.innerHTML = ""
  for (const definition of profileDefinitions) {
    const label = document.createElement("label")
    label.textContent = definition.label
    const input = document.createElement("input")
    input.id = `profile-${definition.key}`
    input.autocomplete = definition.key
    label.appendChild(input)
    container.appendChild(label)
  }
}

function renderCustomFields(fields) {
  const container = document.querySelector("#customFields")
  container.innerHTML = ""
  for (const field of fields) addCustomFieldRow(field)
}

function addCustomFieldRow(field = {}) {
  const row = document.createElement("div")
  row.className = "field-row"
  row.innerHTML = `
    <label>字段名<input class="custom-label" value="${escapeHtml(field.label || "")}" placeholder="籍贯" /></label>
    <label>要填写的内容<input class="custom-value" value="${escapeHtml(field.value || "")}" placeholder="上海" /></label>
    <label>匹配关键词<input class="custom-keywords" value="${escapeHtml(field.keywords || "")}" placeholder="籍贯,户籍,生源地" /></label>
    <button type="button" class="secondary remove-field">删除</button>
  `
  row.querySelector(".remove-field").addEventListener("click", () => row.remove())
  document.querySelector("#customFields").appendChild(row)
}

function renderExperienceSections(sections) {
  const container = document.querySelector("#experienceSections")
  container.innerHTML = ""
  for (const section of sections) addExperienceSectionCard(section)
}

function addExperienceSectionCard(section = {}) {
  const card = document.createElement("article")
  card.className = "experience-card"
  card.innerHTML = `
    <div class="experience-head">
      <label class="inline"><input type="checkbox" class="experience-enabled" ${section.enabled ? "checked" : ""} /> 启用</label>
      <label>经历名称<input class="experience-name" value="${escapeHtml(section.name || "新的经历")}" placeholder="实习经历" /></label>
      <label>板块关键词<input class="experience-section-keywords" value="${escapeHtml(section.sectionKeywords || "")}" placeholder="实习经历,工作经历" /></label>
      <label>添加按钮关键词<input class="experience-add-keywords" value="${escapeHtml(section.addKeywords || "添加,+,新增")}" /></label>
      <label>等待毫秒<input class="experience-wait" type="number" value="${Number(section.waitMs || 700)}" min="0" step="100" /></label>
      <button type="button" class="secondary remove-experience">删除经历</button>
    </div>
    <div class="experience-fields field-list"></div>
    <button type="button" class="secondary add-experience-field">给这段经历添加字段</button>
  `
  const fields = Array.isArray(section.fields) ? section.fields : []
  for (const field of fields) addExperienceFieldRow(card.querySelector(".experience-fields"), field)
  card.querySelector(".add-experience-field").addEventListener("click", () => addExperienceFieldRow(card.querySelector(".experience-fields")))
  card.querySelector(".remove-experience").addEventListener("click", () => card.remove())
  document.querySelector("#experienceSections").appendChild(card)
}

function addExperienceFieldRow(container, field = {}) {
  const row = document.createElement("div")
  row.className = "field-row experience-field-row"
  row.innerHTML = `
    <label>字段名<input class="experience-field-label" value="${escapeHtml(field.label || "")}" placeholder="部门" /></label>
    <label>要填写的内容<input class="experience-field-value" value="${escapeHtml(field.value || "")}" placeholder="数据分析部" /></label>
    <label>匹配关键词<input class="experience-field-keywords" value="${escapeHtml(field.keywords || "")}" placeholder="部门,所属部门" /></label>
    <button type="button" class="secondary remove-field">删除</button>
  `
  row.querySelector(".remove-field").addEventListener("click", () => row.remove())
  container.appendChild(row)
}

document.querySelector("#addCustomField").addEventListener("click", () => addCustomFieldRow())
document.querySelector("#addExperience").addEventListener("click", () => addExperienceSectionCard({
  name: "新的经历",
  enabled: false,
  sectionKeywords: "经历",
  addKeywords: "添加,+,新增",
  waitMs: 700,
  fields: []
}))
document.querySelector("#save").addEventListener("click", saveSettings)

async function saveSettings() {
  const profile = collectProfile()

  try {
    const customFields = collectCustomFields()
    const experienceSections = collectExperienceSections()
    const rules = buildRules(profile, customFields)
    const experienceTemplates = sectionsToTemplates(experienceSections)
    await chrome.storage.local.set({ profile, customFields, experienceSections, rules, experienceTemplates })
    document.querySelector("#status").textContent = "已保存。"
  } catch (error) {
    document.querySelector("#status").textContent = `保存失败：${error.message}`
  }
}

function collectProfile() {
  const profile = {}
  for (const definition of profileDefinitions) {
    profile[definition.key] = document.querySelector(`#profile-${definition.key}`).value.trim()
  }
  return profile
}

function collectCustomFields() {
  return [...document.querySelectorAll("#customFields .field-row")].map((row) => ({
    label: row.querySelector(".custom-label").value.trim(),
    value: row.querySelector(".custom-value").value.trim(),
    keywords: row.querySelector(".custom-keywords").value.trim()
  })).filter((field) => field.label || field.value || field.keywords)
}

function collectExperienceSections() {
  return [...document.querySelectorAll(".experience-card")].map((card) => ({
    name: card.querySelector(".experience-name").value.trim(),
    enabled: card.querySelector(".experience-enabled").checked,
    sectionKeywords: card.querySelector(".experience-section-keywords").value.trim(),
    addKeywords: card.querySelector(".experience-add-keywords").value.trim(),
    waitMs: Number(card.querySelector(".experience-wait").value || 700),
    fields: [...card.querySelectorAll(".experience-field-row")].map((row) => ({
      label: row.querySelector(".experience-field-label").value.trim(),
      value: row.querySelector(".experience-field-value").value.trim(),
      keywords: row.querySelector(".experience-field-keywords").value.trim()
    })).filter((field) => field.label || field.value || field.keywords)
  })).filter((section) => section.name || section.sectionKeywords || section.fields.length)
}

function buildRules(profile, customFields) {
  const profileRules = profileDefinitions
    .filter((definition) => profile[definition.key])
    .map((definition) => ({
      key: definition.key,
      label: definition.label,
      value: profile[definition.key],
      keywords: definition.keywords
    }))

  const customRules = customFields
    .filter((field) => field.value && field.keywords)
    .map((field, index) => ({
      key: `custom-${index}`,
      label: field.label || `自定义字段 ${index + 1}`,
      value: field.value,
      keywords: splitKeywords(field.keywords)
    }))

  return [...profileRules, ...customRules]
}

function sectionsToTemplates(sections) {
  return sections.map((section, sectionIndex) => ({
    name: section.name || `经历 ${sectionIndex + 1}`,
    enabled: Boolean(section.enabled),
    sectionKeywords: splitKeywords(section.sectionKeywords),
    addKeywords: splitKeywords(section.addKeywords || "添加,+,新增"),
    waitMs: Number(section.waitMs || 700),
    rules: section.fields
      .filter((field) => field.value && field.keywords)
      .map((field, fieldIndex) => ({
        key: `experience-${sectionIndex}-${fieldIndex}`,
        label: field.label || `经历字段 ${fieldIndex + 1}`,
        value: field.value,
        keywords: splitKeywords(field.keywords)
      }))
  }))
}

function templatesToSections(templates) {
  if (!Array.isArray(templates)) return null
  return templates.map((template) => ({
    name: template.name || "经历",
    enabled: Boolean(template.enabled),
    sectionKeywords: joinKeywords(template.sectionKeywords),
    addKeywords: joinKeywords(template.addKeywords || ["添加", "+", "新增"]),
    waitMs: Number(template.waitMs || 700),
    fields: Array.isArray(template.rules)
      ? template.rules.map((rule) => ({
        label: rule.label || "",
        value: rule.value || "",
        keywords: joinKeywords(rule.keywords)
      }))
      : []
  }))
}

document.querySelector("#resumeFileInput").addEventListener("change", async (event) => {
  const file = event.target.files?.[0]
  if (!file) return

  try {
    const dataUrl = await readFileAsDataUrl(file)
    const resumeFile = {
      name: file.name,
      type: file.type || "application/pdf",
      size: file.size,
      dataUrl
    }
    await chrome.storage.local.set({ resumeFile })
    updateResumeFileStatus(resumeFile)
    document.querySelector("#status").textContent = "简历文件已保存到本地扩展。"
  } catch (error) {
    document.querySelector("#status").textContent = `保存简历失败：${error.message}`
  }
})

document.querySelector("#parseResume").addEventListener("click", () => {
  parseResumeIntoForm(document.querySelector("#resumeText").value)
  document.querySelector("#status").textContent = "已根据简历文本预填，请检查后保存。"
})

document.querySelector("#reset").addEventListener("click", () => {
  for (const definition of profileDefinitions) document.querySelector(`#profile-${definition.key}`).value = ""
  renderCustomFields(defaultCustomFields)
  renderExperienceSections(defaultExperienceSections)
  document.querySelector("#status").textContent = "已恢复默认，记得保存。"
})

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
  const lines = text.split("\n").map((line) => line.trim()).filter(Boolean)
  const parsed = {}
  parsed.email = matchFirst(text, /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)
  parsed.phone = matchFirst(text, /(?:\+?86[-\s]?)?(1[3-9]\d[-\s]?\d{4}[-\s]?\d{4})/)
  if (parsed.phone) parsed.phone = parsed.phone.replace(/\D/g, "").replace(/^86/, "")
  parsed.name = findLabeledValue(text, ["姓名", "名字"]) || guessName(lines)
  parsed.school = findLineByKeywords(lines, ["大学", "学院", "学校", "院校", "University", "College"])
  parsed.major = findLabeledValue(text, ["专业", "所学专业", "Major"])
  parsed.degree = matchFirst(text, /(博士研究生|硕士研究生|本科|研究生|博士|硕士|学士|大专)/)
  parsed.graduationYear = matchFirst(text, /(20[2-3]\d)\s*(?:年)?\s*(?:毕业|届)/) || matchFirst(text, /(20[2-3]\d)/)
  parsed.city = findLabeledValue(text, ["现居地", "当前城市", "所在地", "城市"])
  parsed.expectedCity = findLabeledValue(text, ["期望城市", "意向城市", "期望工作地", "工作城市"])
  parsed.nativePlace = findLabeledValue(text, ["籍贯", "户籍", "生源地", "出生地"])
  return parsed
}

function updateResumeFileStatus(resumeFile) {
  document.querySelector("#resumeFileStatus").textContent = resumeFile
    ? `已保存：${resumeFile.name}（${Math.ceil((resumeFile.size || 0) / 1024)} KB）`
    : "还没有保存简历文件。"
}

function splitKeywords(value) {
  return String(value || "").split(/[,，、\n]/).map((item) => item.trim()).filter(Boolean)
}

function joinKeywords(value) {
  return Array.isArray(value) ? value.join(",") : String(value || "")
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
  const line = lines.find((item) => keywords.some((keyword) => item.toLowerCase().includes(String(keyword).toLowerCase())))
  return cleanupValue(line || "")
}

function guessName(lines) {
  return lines.slice(0, 6).find((item) => /^[\u4e00-\u9fa5]{2,4}$/.test(item)) || ""
}

function matchFirst(text, regex) {
  const match = text.match(regex)
  return match ? cleanupValue(match[1] || match[0]) : ""
}

function cleanupValue(value) {
  return String(value || "").replace(/[|,，;；].*$/, "").trim()
}

function normalizeText(text) {
  return String(text || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim()
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
  return String(text).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char])
}
