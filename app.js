const DATA_URL = "./data/jobs.json"
const STATE_KEY = "autumnRecruitTracker.state.v1"
const HISTORY_KEY = "autumnRecruitTracker.history.v1"
const IGNORED_COMPANIES_KEY = "autumnRecruitTracker.ignoredCompanies.v1"
const stages = ["未投递", "已投递", "笔试", "一面", "二面", "三面", "HR面", "Offer", "已拒"]

let jobs = []
let state = readJson(STATE_KEY, {})
let history = readJson(HISTORY_KEY, [])
let ignoredCompanies = readJson(IGNORED_COMPANIES_KEY, {})

const els = {
  syncText: document.querySelector("#syncText"),
  totalCount: document.querySelector("#totalCount"),
  appliedCount: document.querySelector("#appliedCount"),
  historyCount: document.querySelector("#historyCount"),
  keyword: document.querySelector("#keyword"),
  batchFilter: document.querySelector("#batchFilter"),
  appliedFilter: document.querySelector("#appliedFilter"),
  jobList: document.querySelector("#jobList"),
  historyList: document.querySelector("#historyList"),
  exportState: document.querySelector("#exportState"),
  importState: document.querySelector("#importState"),
  template: document.querySelector("#jobTemplate")
}

init()

async function init() {
  bindControls()
  try {
    const response = await fetch(`${DATA_URL}?t=${Date.now()}`)
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    const data = await response.json()
    jobs = data.items || []
    els.syncText.textContent = `数据更新：${data.generatedAt || "未知"}`
  } catch (error) {
    els.syncText.textContent = `数据读取失败：${error.message}`
  }
  render()
}

function bindControls() {
  for (const el of [els.keyword, els.batchFilter, els.appliedFilter]) {
    el.addEventListener("input", render)
    el.addEventListener("change", render)
  }
  els.exportState.addEventListener("click", exportLocalState)
  els.importState.addEventListener("change", importLocalState)
}

function render() {
  const keyword = els.keyword.value.trim().toLowerCase()
  const batch = els.batchFilter.value
  const applied = els.appliedFilter.value
  const filtered = jobs.filter((job) => {
    const local = getLocal(job)
    const text = `${job.company} ${job.jobPosition || ""} ${job.applyMethod}`.toLowerCase()
    if (keyword && !text.includes(keyword)) return false
    if (batch && job.batch !== batch) return false
    if (applied === "ignored") return local.ignored
    if (applied && local.ignored) return false
    if (applied && String(local.applied ? 1 : 0) !== applied) return false
    return true
  })

  els.totalCount.textContent = jobs.length
  els.appliedCount.textContent = jobs.filter((job) => {
    const local = getLocal(job)
    return local.applied && !local.ignored
  }).length
  els.historyCount.textContent = history.length
  renderJobs(filtered)
  renderHistory()
}

function renderJobs(items) {
  els.jobList.innerHTML = ""
  if (!items.length) {
    const empty = document.createElement("div")
    empty.className = "empty"
    empty.textContent = "暂无匹配岗位"
    els.jobList.append(empty)
    return
  }

  for (const job of items) {
    const local = getLocal(job)
    const node = els.template.content.firstElementChild.cloneNode(true)
    node.querySelector(".company").textContent = job.company
    node.querySelector(".batch").textContent = job.batch
    node.querySelector(".meta").textContent = `表格更新：${job.sheetUpdateTime || "未填写"}`
    node.querySelector(".position").textContent = job.jobPosition || "未填写招聘岗位"

    const apply = node.querySelector(".apply-method")
    apply.textContent = job.applyMethod || "未填写投递方式"
    if (/^https?:\/\//i.test(job.applyUrl || "")) {
      apply.href = job.applyUrl
      apply.title = job.applyUrl
      apply.classList.remove("disabled")
    } else {
      apply.removeAttribute("href")
      apply.removeAttribute("title")
      apply.classList.add("disabled")
    }

    const applied = node.querySelector(".applied")
    applied.checked = local.applied
    applied.addEventListener("change", () => {
      const current = getLocal(job)
      const nextStage = applied.checked && current.stage === "未投递" ? "已投递" : current.stage
      saveJob(job, { applied: applied.checked, stage: nextStage }, "是否投递")
    })

    const ignored = node.querySelector(".ignored")
    ignored.checked = local.ignored
    ignored.addEventListener("change", () => {
      saveJob(job, { ignored: ignored.checked }, "不感兴趣")
    })

    const stage = node.querySelector(".stage")
    for (const item of stages) {
      const option = document.createElement("option")
      option.value = item
      option.textContent = item
      stage.append(option)
    }
    stage.value = local.stage
    stage.addEventListener("change", () => {
      saveJob(job, { applied: stage.value !== "未投递", stage: stage.value }, "流程")
    })

    const note = node.querySelector(".note")
    note.value = local.note
    note.addEventListener("change", () => {
      saveJob(job, { note: note.value }, "备注")
    })

    els.jobList.append(node)
  }
}

function renderHistory() {
  els.historyList.innerHTML = ""
  const recent = history.slice(0, 80)
  if (!recent.length) {
    const empty = document.createElement("div")
    empty.className = "history-item"
    empty.textContent = "暂无修改记录"
    els.historyList.append(empty)
    return
  }
  for (const item of recent) {
    const row = document.createElement("div")
    row.className = "history-item"
    row.innerHTML = `<strong>${escapeHtml(item.company)}</strong> 修改了 ${escapeHtml(item.field)}<time>${escapeHtml(item.time)}</time>`
    els.historyList.append(row)
  }
}

function getLocal(job) {
  const direct = state[job.id]
  const migrated = direct || findStateBySource(job)
  if (!direct && migrated) {
    state[job.id] = migrated
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
  }
  return {
    applied: false,
    stage: "未投递",
    note: "",
    ignored: Boolean(ignoredCompanies[job.company]),
    ...(migrated || {}),
    ignored: Boolean(ignoredCompanies[job.company] || migrated?.ignored)
  }
}

function findStateBySource(job) {
  return Object.values(state).find((item) =>
    item &&
    item.company === job.company &&
    item.batch === job.batch &&
    item.applyMethod === job.applyMethod
  )
}

function saveJob(job, patch, field) {
  const previous = getLocal(job)
  const next = { ...previous, ...patch }
  if (Object.prototype.hasOwnProperty.call(patch, "ignored")) {
    if (patch.ignored) {
      ignoredCompanies[job.company] = true
    } else {
      delete ignoredCompanies[job.company]
    }
    localStorage.setItem(IGNORED_COMPANIES_KEY, JSON.stringify(ignoredCompanies))
  }
  state[job.id] = {
    ...next,
    company: job.company,
    batch: job.batch,
    applyMethod: job.applyMethod
  }
  history.unshift({
    id: job.id,
    company: job.company,
    field,
    before: previous,
    after: next,
    time: new Date().toLocaleString()
  })
  history = history.slice(0, 1000)
  localStorage.setItem(STATE_KEY, JSON.stringify(state))
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
  localStorage.setItem(IGNORED_COMPANIES_KEY, JSON.stringify(ignoredCompanies))
  render()
}

function exportLocalState() {
  const payload = {
    exportedAt: new Date().toISOString(),
    state,
    history,
    ignoredCompanies
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = "autumn-recruit-records.json"
  link.click()
  URL.revokeObjectURL(url)
}

function importLocalState(event) {
  const file = event.target.files && event.target.files[0]
  if (!file) return
  const reader = new FileReader()
  reader.onload = () => {
    const payload = JSON.parse(reader.result)
    state = payload.state || {}
    history = payload.history || []
    ignoredCompanies = payload.ignoredCompanies || buildIgnoredCompaniesFromState(state)
    localStorage.setItem(STATE_KEY, JSON.stringify(state))
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history))
    localStorage.setItem(IGNORED_COMPANIES_KEY, JSON.stringify(ignoredCompanies))
    render()
  }
  reader.readAsText(file, "utf-8")
  event.target.value = ""
}

function readJson(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) || fallback
  } catch {
    return fallback
  }
}

function buildIgnoredCompaniesFromState(items) {
  const companies = {}
  for (const item of Object.values(items || {})) {
    if (item?.ignored && item.company) companies[item.company] = true
  }
  return companies
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[char]))
}
