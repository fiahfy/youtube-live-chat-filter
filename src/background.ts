import { browser } from 'webextension-polyfill-ts'
import { readyStore } from '~/store'
import icon from '~/assets/icon.png'
import iconOn from '~/assets/icon-on.png'
import inject from '~/assets/inject.css'

interface TabState {
  enabled: boolean
}

let initialState = { enabled: true }
let tabStates: { [tabId: number]: TabState } = {}

const getSettings = async () => {
  const store = await readyStore()
  return JSON.parse(JSON.stringify(store.state.settings))
}

const setIcon = async (tabId: number, tabState: TabState) => {
  const path = tabState.enabled ? iconOn : icon
  await browser.pageAction.setIcon({ tabId, path })
}

const contentLoaded = async (tabId: number, frameId: number) => {
  const tabState = tabStates[tabId] ?? { ...initialState }
  tabStates = { ...tabStates, [tabId]: tabState }

  await setIcon(tabId, tabState)
  await browser.pageAction.show(tabId)
  await browser.tabs.insertCSS(tabId, { frameId, file: inject })

  const settings = await getSettings()

  return { tabState, settings }
}

const menuButtonClicked = async (tabId: number) => {
  let tabState = tabStates[tabId] ?? { ...initialState }
  tabState = {
    ...tabState,
    enabled: !tabState.enabled,
  }

  initialState = { ...tabState }

  tabStates = { ...tabStates, [tabId]: tabState }

  await setIcon(tabId, tabState)

  await browser.tabs.sendMessage(tabId, {
    id: 'enabledChanged',
    data: { tabState },
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
          data: { settings },
        }))
    } catch (e) {} // eslint-disable-line no-empty
  }
}

browser.runtime.onMessage.addListener(async (message, sender) => {
  const { id } = message
  const { tab, frameId } = sender
  switch (id) {
    case 'contentLoaded':
      return tab?.id && frameId && (await contentLoaded(tab.id, frameId))
    case 'menuButtonClicked':
      tab?.id && (await menuButtonClicked(tab.id))
      break
    case 'settingsChanged':
      await settingsChanged()
      break
  }
})
