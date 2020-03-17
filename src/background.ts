import { browser } from 'webextension-polyfill-ts'
import { readyStore } from '~/store'
import iconOn from '~/assets/icon-on.png'
import inject from '~/assets/inject.css'

const getSettings = async () => {
  const store = await readyStore()
  return JSON.parse(JSON.stringify(store.state.settings))
}

const contentLoaded = async (tabId: number, frameId: number) => {
  await browser.pageAction.setIcon({ tabId, path: iconOn })
  await browser.pageAction.show(tabId)
  await browser.tabs.insertCSS(tabId, { frameId, file: inject })

  const settings = await getSettings()

  return { settings }
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
  const { id } = message
  const { tab, frameId } = sender
  switch (id) {
    case 'contentLoaded':
      return tab?.id && frameId && (await contentLoaded(tab.id, frameId))
    case 'settingsChanged':
      await settingsChanged()
      break
  }
})
