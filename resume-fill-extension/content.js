if (!window.__resumeFillExtensionLoaded) {
  window.__resumeFillExtensionLoaded = true

  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message?.type !== "FILL_RESUME_FORM") return
    fillResumeForm()
      .then(sendResponse)
      .catch((error) => sendResponse({ filled: 0, uploads: 0, sections: 0, error: error.message || String(error) }))
    return true
  })
}

async function fillResumeForm() {
  const data = await chrome.storage.local.get(["rules", "experienceTemplates", "resumeFile"])
  const rules = normalizeRules(data.rules || []).filter((rule) => rule.value && Array.isArray(rule.keywords))

  let filled = fillVisibleControls(document, rules)
  const sectionResult = await fillExperienceSections(data.experienceTemplates || [], rules)
  filled += sectionResult.filled

  const uploadResult = await fillResumeUpload(data.resumeFile)
  showToast(`已填写 ${filled} 个字段；新增经历 ${sectionResult.sections} 条；简历上传 ${uploadResult.filled}/${uploadResult.total} 个。`)
  return { filled, uploads: uploadResult.filled, uploadTargets: uploadResult.total, sections: sectionResult.sections }
}

function normalizeRules(rules) {
  return Array.isArray(rules) ? rules : []
}

function fillVisibleControls(root, rules) {
  let filled = 0
  for (const element of findFillableControls(root)) {
    if (!isVisible(element) || element.disabled || element.readOnly || hasValue(element)) continue
    const text = getNearbyText(element)
    const rule = matchRule(text, rules)
    if (!rule) continue
    if (fillControl(element, rule.value)) filled += 1
  }
  return filled
}

async function fillExperienceSections(templates, baseRules) {
  let filled = 0
  let sections = 0
  for (const template of templates) {
    if (!template?.enabled) continue
    const button = findAddButtonForSection(template.sectionKeywords || [], template.addKeywords || ["添加", "+"])
    if (!button) continue

    button.click()
    sections += 1
    await sleep(Number(template.waitMs || 700))

    const scopedRules = normalizeRules(template.rules || []).filter((rule) => rule.value && Array.isArray(rule.keywords))
    filled += fillVisibleControls(findLikelyActiveScope() || document, [...scopedRules, ...baseRules])
  }
  return { filled, sections }
}

async function fillResumeUpload(resumeFile) {
  const fileInputs = [...document.querySelectorAll("input[type=file]")].filter((input) => !input.disabled)
  if (fileInputs.length === 0) return { filled: 0, total: 0 }
  if (!resumeFile?.dataUrl) {
    markUploadControls(fileInputs, "请选择简历文件")
    return { filled: 0, total: fileInputs.length }
  }

  let filled = 0
  const file = dataUrlToFile(resumeFile.dataUrl, resumeFile.name || "resume.pdf", resumeFile.type || "application/pdf")
  for (const input of fileInputs) {
    try {
      const transfer = new DataTransfer()
      transfer.items.add(file)
      input.files = transfer.files
      input.dispatchEvent(new Event("input", { bubbles: true }))
      input.dispatchEvent(new Event("change", { bubbles: true }))
      filled += 1
      input.style.outline = "3px solid #16a34a"
    } catch {
      input.style.outline = "3px solid #dc2626"
    }
  }
  if (filled === 0) markUploadControls(fileInputs, "该网站拦截了自动上传，请手动选择简历")
  return { filled, total: fileInputs.length }
}

function dataUrlToFile(dataUrl, name, type) {
  const [header, base64] = dataUrl.split(",")
  const mime = header.match(/data:([^;]+)/)?.[1] || type
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index)
  return new File([bytes], name, { type: mime })
}

function findAddButtonForSection(sectionKeywords, addKeywords) {
  const candidates = [...document.querySelectorAll("button, a, [role=button], .btn, [class*=button], [class*=Button]")]
    .filter((element) => isVisible(element) && !element.disabled)

  return candidates.find((element) => {
    const buttonText = cleanText(element.textContent || element.getAttribute("aria-label") || element.getAttribute("title") || "")
    if (!addKeywords.some((keyword) => buttonText.includes(keyword))) return false

    const regionText = cleanText(getSectionTextAround(element))
    return sectionKeywords.length === 0 || sectionKeywords.some((keyword) => regionText.includes(keyword))
  })
}

function getSectionTextAround(element) {
  const parts = [element.textContent, element.getAttribute("aria-label"), element.getAttribute("title")]
  let parent = element.parentElement
  for (let depth = 0; parent && depth < 5; depth += 1) {
    parts.push(parent.textContent)
    parent = parent.parentElement
  }
  return parts.filter(Boolean).join(" ")
}

function findLikelyActiveScope() {
  const modal = [...document.querySelectorAll("[role=dialog], .modal, .ant-modal, .el-dialog, .arco-modal, .semi-modal")]
    .filter(isVisible)
    .at(-1)
  if (modal) return modal

  const controls = findFillableControls(document).filter((element) => isVisible(element) && !hasValue(element))
  if (controls.length === 0) return document
  let node = controls[0].parentElement
  for (let depth = 0; node && depth < 4; depth += 1) {
    if (findFillableControls(node).length >= 2) return node
    node = node.parentElement
  }
  return document
}

function findFillableControls(root) {
  return [...root.querySelectorAll("input:not([type=file]):not([type=hidden]), textarea, select")]
}

function hasValue(element) {
  if (element.tagName === "SELECT") return Boolean(element.value)
  if (["checkbox", "radio"].includes(element.type)) return element.checked
  return Boolean(element.value)
}

function fillControl(element, value) {
  if (element.tagName === "SELECT") {
    const wanted = String(value).trim()
    const option = [...element.options].find((item) =>
      item.value === wanted || item.textContent.trim() === wanted || item.textContent.includes(wanted)
    )
    if (!option) return false
    element.value = option.value
  } else if (element.type === "checkbox") {
    element.checked = ["true", "是", "接受", "yes", "1"].includes(String(value).toLowerCase())
  } else if (element.type === "radio") {
    return false
  } else {
    element.focus()
    element.value = value
  }
  element.dispatchEvent(new Event("input", { bubbles: true }))
  element.dispatchEvent(new Event("change", { bubbles: true }))
  return true
}

function isVisible(element) {
  const box = element.getBoundingClientRect()
  const style = window.getComputedStyle(element)
  return box.width > 0 && box.height > 0 && style.visibility !== "hidden" && style.display !== "none"
}

function getNearbyText(element) {
  const parts = [
    element.getAttribute("aria-label"),
    element.getAttribute("placeholder"),
    element.getAttribute("name"),
    element.getAttribute("id"),
    element.getAttribute("autocomplete")
  ]

  if (element.id) {
    const label = document.querySelector(`label[for="${CSS.escape(element.id)}"]`)
    if (label) parts.push(label.textContent)
  }

  const closestLabel = element.closest("label")
  if (closestLabel) parts.push(closestLabel.textContent)

  let parent = element.parentElement
  for (let depth = 0; parent && depth < 3; depth += 1) {
    parts.push(parent.textContent)
    parent = parent.parentElement
  }

  return cleanText(parts.filter(Boolean).join(" "))
}

function matchRule(text, rules) {
  const normalized = cleanText(text).toLowerCase()
  return rules.find((rule) =>
    rule.keywords.some((keyword) => normalized.includes(String(keyword).toLowerCase()))
  )
}

function markUploadControls(inputs, text) {
  for (const input of inputs) {
    input.style.outline = "3px solid #2563eb"
    const box = input.getBoundingClientRect()
    if (box.width === 0 || box.height === 0) continue
    const hint = document.createElement("div")
    hint.textContent = text
    hint.style.cssText = "position:absolute;z-index:2147483647;background:#2563eb;color:#fff;padding:6px 8px;border-radius:6px;font-size:13px;"
    hint.style.left = `${window.scrollX + box.left}px`
    hint.style.top = `${window.scrollY + box.bottom + 6}px`
    document.body.appendChild(hint)
    setTimeout(() => hint.remove(), 8000)
  }
}

function showToast(text) {
  const old = document.querySelector("#resume-fill-extension-toast")
  if (old) old.remove()
  const toast = document.createElement("div")
  toast.id = "resume-fill-extension-toast"
  toast.textContent = text
  toast.style.cssText = "position:fixed;right:18px;bottom:18px;z-index:2147483647;background:#111827;color:#fff;padding:10px 14px;border-radius:8px;font-size:14px;box-shadow:0 10px 30px rgba(0,0,0,.22);"
  document.body.appendChild(toast)
  setTimeout(() => toast.remove(), 5000)
}

function cleanText(text) {
  return String(text || "").replace(/\s+/g, " ").trim()
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
