import { browser } from 'webextension-polyfill-ts'
import className from '~/constants/class-name'
import error from '~/assets/error.svg'
import filterList from '~/assets/filter-list.svg'
import Settings from '~/models/settings'
import Filter from '~/models/filter'

let enabled = false
let settings: Settings | undefined

const updateMenuButton = () => {
  const button = document.querySelector(`.${className.menuButton}`)
  if (!button) {
    return
  }
  if (enabled) {
    button.classList.add(className.menuButtonActive)
  } else {
    button.classList.remove(className.menuButtonActive)
  }
}

const addMenuButton = () => {
  const header = document.querySelector(
    '#chat-messages > yt-live-chat-header-renderer'
  )
  const refIconButton = header && header.querySelector('yt-icon-button')
  if (!header || !refIconButton) {
    return
  }

  const icon = document.createElement('yt-icon')
  icon.classList.add('yt-live-chat-header-renderer', 'style-scope')

  const iconButton = document.createElement('yt-icon-button')
  iconButton.id = 'overflow'
  iconButton.classList.add(
    className.menuButton,
    'style-scope',
    'yt-live-chat-header-renderer'
  )
  iconButton.title = 'Filter messages'
  iconButton.onclick = () => {
    browser.runtime.sendMessage({ id: 'menuButtonClicked' })
  }
  iconButton.append(icon)

  header.insertBefore(iconButton, refIconButton)

  // insert svg after wrapper button appended
  icon.innerHTML = filterList

  updateMenuButton()
}

const querySelectorAsync = (
  selector: string,
  interval = 100,
  timeout = 1000
): Promise<Element | null> => {
  return new Promise((resolve) => {
    const expireTime = Date.now() + timeout
    const timer = setInterval(() => {
      const e = document.querySelector(selector)
      if (e || Date.now() > expireTime) {
        clearInterval(timer)
        resolve(e)
      }
    }, interval)
  })
}

const getReason = (author?: string, message?: string) => {
  return settings?.filters.reduce((carry: string, filter: Filter) => {
    if (carry) {
      return carry
    }

    const { subject, keyword, regExp } = filter
    if (!subject || !keyword) {
      return carry
    }

    let reg
    try {
      const pattern = regExp
        ? keyword
        : keyword.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

      reg = new RegExp(`(${pattern})`, 'i')
    } catch (e) {
      return carry
    }

    const text = subject === 'author' ? author : message
    if (!text || !reg.test(text)) {
      return carry
    }

    let reason = `Match keyword "${keyword}" in ${subject}`
    if (regExp) {
      reason += ' with regexp'
    }

    return reason
  }, '')
}

const filter = (element: HTMLElement) => {
  if (!enabled) {
    return
  }

  const infoIcon = element.querySelector(`.${className.infoIcon}`)
  infoIcon && infoIcon.remove()

  const author = element.querySelector('#author-name')?.textContent ?? undefined
  const message = element.querySelector('#message')?.textContent ?? undefined

  const reason = getReason(author, message)
  if (reason) {
    const div = document.createElement('div')
    div.classList.add(className.infoIcon)
    div.style.marginTop = '4px'
    div.style.marginRight = '8px'
    div.style.cursor = 'pointer'
    div.title = reason
    div.innerHTML = error
    const svg = div.querySelector('svg') as SVGElement
    svg.style.fill = 'var(--yt-live-chat-secondary-text-color)'
    svg.style.width = '16px'
    element.prepend(div)
    return
  }
}

const observe = async () => {
  const items = await querySelectorAsync(
    '#items.yt-live-chat-item-list-renderer'
  )
  if (!items) {
    return
  }

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      const nodes = Array.from(mutation.addedNodes)
      nodes.forEach((node: Node) => {
        if (node instanceof HTMLElement) {
          filter(node)
        }
      })
    })
  })

  observer.observe(items, { childList: true })
}

browser.runtime.onMessage.addListener((message) => {
  const { id, data } = message
  switch (id) {
    case 'enabledChanged':
      enabled = data.enabled
      updateMenuButton()
      break
    case 'settingsChanged':
      settings = data.settings
      break
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  const data = await browser.runtime.sendMessage({ id: 'contentLoaded' })
  enabled = data.enabled
  settings = data.settings
  addMenuButton()
  observe()
})
