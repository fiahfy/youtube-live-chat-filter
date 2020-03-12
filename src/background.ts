import { browser } from 'webextension-polyfill-ts'
import { readyStore } from '~/store'
import code from '~/constants/stylesheet'
import icon from '~/assets/icon.png'
import iconOn from '~/assets/icon-on.png'

interface TabState {
  enabled: boolean
}

const initialState = { enabled: false }
let tabStates: { [tabId: number]: TabState } = {}

const getSettings = async () => {
  const store = await readyStore()
  return JSON.parse(JSON.stringify(store.state.settings))
}

const setIcon = async (tabId: number) => {
  const path = tabStates[tabId] && tabStates[tabId].enabled ? iconOn : icon
  await browser.pageAction.setIcon({ tabId, path })
}

const initTab = async (tabId: number, frameId: number) => {
  const enabled = initialState.enabled
  tabStates = { ...tabStates, [tabId]: { enabled } }

  await setIcon(tabId)
  await browser.pageAction.show(tabId)
  await browser.tabs.insertCSS(tabId, { frameId, code })

  const settings = await getSettings()

  return { enabled, settings }
}

const getStateOnCurrentTab = async () => {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true
  })
  if (!tabs.length) {
    return { enabled: false }
  }
  const tabId = tabs[0].id
  if (!tabId) {
    return { enabled: false }
  }

  return { enabled: !!(tabStates[tabId] && tabStates[tabId].enabled) }
}

const toggleEnabled = async (tabId: number) => {
  const enabled = !(tabStates[tabId] && tabStates[tabId].enabled)
  initialState.enabled = enabled
  tabStates = {
    ...tabStates,
    [tabId]: { ...(tabStates[tabId] ?? {}), enabled }
  }

  await setIcon(tabId)

  await browser.tabs.sendMessage(tabId, {
    id: 'enabledChanged',
    data: { enabled }
  })
}

const enabledChangedOnCurrentTab = async (enabled: boolean) => {
  const tabs = await browser.tabs.query({
    active: true,
    currentWindow: true
  })
  if (!tabs.length) {
    return
  }
  const tabId = tabs[0].id
  if (!tabId) {
    return
  }

  tabStates = {
    ...tabStates,
    [tabId]: { ...(tabStates[tabId] ?? {}), enabled }
  }

  await setIcon(tabId)

  await browser.tabs.sendMessage(tabId, {
    id: 'enabledChanged',
    data: { enabled }
  })
}

const settingsChanged = async () => {
  const settings = await getSettings()
  const tabs = await browser.tabs.query({})
  for (const tab of tabs) {
    try {
      tab.id &&
        (await browser.tabs.sendMessage(tab.id, {
          id: 'settingsChanged',
          data: { settings }
        }))
    } catch (e) {} // eslint-disable-line no-empty
  }
}

browser.runtime.onMessage.addListener(async (message, sender) => {
  const { id, data } = message
  const { tab, frameId } = sender
  switch (id) {
    case 'contentLoaded':
      return tab?.id && frameId && (await initTab(tab.id, frameId))
    case 'popupLoaded':
      return await getStateOnCurrentTab()
    case 'menuButtonClicked':
      tab?.id && (await toggleEnabled(tab.id))
      break
    case 'enabledChanged':
      await enabledChangedOnCurrentTab(data.enabled)
      break
    case 'settingsChanged':
      await settingsChanged()
      break
  }
})
