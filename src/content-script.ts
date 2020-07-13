import { browser } from 'webextension-polyfill-ts'
import error from '~/assets/error.svg'
import filterList from '~/assets/filter-list.svg'
import { Rule, Settings } from '~/models'

const ClassName = {
  active: 'ylcfr-active',
  menuButton: 'ylcfr-menu-button',
  activeMenuButton: 'ylcfr-active-menu-button',
  errorIcon: 'ylcfr-error-icon',
  filteredMessage: 'ylcfr-filtered-message',
  deletedMessage: 'ylcfr-deleted-message',
}
const maskedMessage = '[message masked]'

let enabled: boolean
let settings: Settings

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

const updateRoot = () => {
  if (enabled) {
    document.documentElement.classList.add(ClassName.active)
  } else {
    document.documentElement.classList.remove(ClassName.active)
  }
}

const updateMenuButton = () => {
  const button = document.querySelector(`.${ClassName.menuButton}`)
  if (!button) {
    return
  }
  if (enabled) {
    button.classList.add(ClassName.activeMenuButton)
  } else {
    button.classList.remove(ClassName.activeMenuButton)
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
    ClassName.menuButton,
    'style-scope',
    'yt-live-chat-header-renderer'
  )
  iconButton.title = 'Filter Messages'
  iconButton.onclick = () => {
    browser.runtime.sendMessage({ id: 'menuButtonClicked' })
  }
  iconButton.append(icon)

  header.insertBefore(iconButton, refIconButton)

  // insert svg after wrapper button appended
  icon.innerHTML = filterList

  updateMenuButton()
}

const getMatchedRule = (author?: string, message?: string) => {
  return settings.rules.reduce((carry: Rule | undefined, rule: Rule) => {
    if (carry) {
      return carry
    }

    const { active, field, condition, value } = rule
    if (!active || !field || !value) {
      return carry
    }

    let reg
    try {
      const pattern =
        condition === 'matches_regular_expression'
          ? value
          : value.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')

      reg = new RegExp(`(${pattern})`)
    } catch (e) {
      return carry
    }

    const text = field === 'author' ? author : message
    if (!text || !reg.test(text)) {
      return carry
    }

    return rule
  }, undefined)
}

const getReason = (rule: Rule) => {
  return `${rule.field} ${rule.condition.replace(/_/g, ' ')} "${rule.value}"`
}

const filter = (element: HTMLElement) => {
  // reset message
  element.classList.remove(ClassName.filteredMessage, ClassName.deletedMessage)
  element.removeAttribute('is-deleted')
  const deletedState = element.querySelector('#deleted-state')
  if (deletedState && deletedState.textContent === maskedMessage) {
    deletedState.textContent = ''
  }
  const errorIcon = element.querySelector(`.${ClassName.errorIcon}`)
  errorIcon && errorIcon.remove()

  if (!enabled) {
    return
  }

  if (element.tagName.toLowerCase() === 'yt-live-chat-text-message-renderer') {
    const author =
      element.querySelector('#author-name')?.textContent ?? undefined
    const htmlMessage =
      element.querySelector('#message')?.innerHTML ?? undefined
    const message = htmlMessage
      ?.replace(/<img [^>]*alt="([^"]+)" [^>]*>/g, (_match, p1) => p1)
      .replace(/<[^>]*>/g, '')

    const rule = getMatchedRule(author, message)
    if (rule) {
      element.classList.add(ClassName.deletedMessage)
      element.setAttribute('is-deleted', '')

      if (rule.action === 'hide_completely') {
        element.style.display = 'none'
      } else {
        const deletedState = element.querySelector('#deleted-state')
        if (deletedState) {
          deletedState.textContent = maskedMessage
        }
        const div = document.createElement('div')
        div.classList.add(ClassName.errorIcon)
        div.title = getReason(rule)
        div.innerHTML = error
        const svg = div.querySelector('svg') as SVGElement
        svg.style.fill = 'var(--yt-live-chat-secondary-text-color)'
        svg.style.width = '16px'
        element.prepend(div)
      }
    }
  }
  element.classList.add(ClassName.filteredMessage)
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
      updateRoot()
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
  updateRoot()
  addMenuButton()
  await observe()
})
