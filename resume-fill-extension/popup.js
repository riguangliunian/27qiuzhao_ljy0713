const statusEl = document.querySelector("#status")

document.querySelector("#openOptions").addEventListener("click", () => {
  chrome.runtime.openOptionsPage()
})

document.querySelector("#fillCurrent").addEventListener("click", async () => {
  statusEl.textContent = "正在识别当前页面..."
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true })
  if (!tab?.id) {
    statusEl.textContent = "没有找到当前标签页。"
    return
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    })
    const response = await chrome.tabs.sendMessage(tab.id, { type: "FILL_RESUME_FORM" })
    statusEl.textContent = `已填写 ${response.filled} 个字段；新增经历 ${response.sections || 0} 条；发现 ${response.uploads} 个上传入口。`
  } catch (error) {
    statusEl.textContent = `填写失败：${error.message || error}`
  }
})
