import { Settings } from '~/models'
import { persistConfig } from '~/store'
import { initialState as initialSettings } from '~/store/settings'
import iconOff from '~/assets/icon-off.png'
import iconOn from '~/assets/icon-on.png'

let initialEnabled = true
let enabledStates: { [tabId: number]: boolean } = {}

const getSettings = async () => {
  try {
    const key = `persist:${persistConfig.key}`
    const json = (await chrome.storage.local.get(key))[key]
    const rootState = JSON.parse(json)
    return JSON.parse(rootState.settings)
  } catch (e) {
    return initialSettings
  }
}

const setIcon = async (tabId: number, enabled: boolean) => {
  const path = enabled ? iconOn : iconOff
  await chrome.action.setIcon({ tabId, path })
}

const contentLoaded = async (tabId: number) => {
  const enabled = enabledStates[tabId] ?? initialEnabled
  enabledStates = { ...enabledStates, [tabId]: enabled }

  await setIcon(tabId, enabled)

  const settings = await getSettings()

  return { enabled, settings }
}

const menuButtonClicked = async (tabId: number) => {
  let enabled = enabledStates[tabId] ?? initialEnabled
  enabled = !enabled

  initialEnabled = enabled

  enabledStates = { ...enabledStates, [tabId]: enabled }

  await setIcon(tabId, enabled)

  await chrome.tabs.sendMessage(tabId, {
    type: 'enabled-changed',
    data: { enabled },
  })
}

const addButtonClicked = async ({ author }: { author: string }) => {
  // const store = await readyStore()
  // store.commit('addRule', {
  //   field: 'author',
  //   condition: 'equals',
  //   value: author,
  // })
  // await settingsChanged()
}

const settingsChanged = async (settings: Settings) => {
  const tabs = await chrome.tabs.query({
    url: 'https://www.youtube.com/*',
  })
  for (const tab of tabs) {
    try {
      tab.id &&
        chrome.tabs.sendMessage(tab.id, {
          type: 'settings-changed',
          data: { settings },
        })
    } catch (e) {} // eslint-disable-line no-empty
  }
}

chrome.runtime.onInstalled.addListener(async (details) => {
  if (details.reason !== 'update') {
    return
  }
  // move settings from sync to local for migration
  const { vuex } = await chrome.storage.sync.get('vuex')
  if (vuex) {
    await chrome.storage.local.set({ vuex })
    await chrome.storage.sync.remove('vuex')
  }
})

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { type, data } = message
  const { tab } = sender
  switch (type) {
    case 'content-loaded':
      if (tab?.id) {
        contentLoaded(tab.id).then((data) => sendResponse(data))
        return true
      }
      return
    case 'menu-button-clicked':
      if (tab?.id) {
        menuButtonClicked(tab.id).then((data) => sendResponse(data))
        return true
      }
      return
    case 'add-button-clicked':
      addButtonClicked(data).then(() => sendResponse())
      return true
    case 'settings-changed':
      settingsChanged(data.settings).then(() => sendResponse())
      return true
  }
})
