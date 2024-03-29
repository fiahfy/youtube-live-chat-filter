import cancel from '~/assets/cancel.svg'
import error from '~/assets/error.svg'
import filterList from '~/assets/filter-list.svg'
import { Rule, Settings } from '~/models'

const ClassName = {
  active: 'ylcfr-active',
  menuButton: 'ylcfr-menu-button',
  activeMenuButton: 'ylcfr-active-menu-button',
  errorIcon: 'ylcfr-error-icon',
  cancelIcon: 'ylcfr-cancel-icon',
  filteredMessage: 'ylcfr-filtered-message',
  deletedMessage: 'ylcfr-deleted-message',
  hiddenMessage: 'ylcfr-hidden-message',
}
const maskedMessage = '[message masked]'

let enabled: boolean
let settings: Settings

const querySelectorAsync = (
  selector: string,
  interval = 100,
  timeout = 1000
) => {
  return new Promise<Element | null>((resolve) => {
    const expireTime = Date.now() + timeout
    const timer = window.setInterval(() => {
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

const addMenuButton = async () => {
  const header = await querySelectorAsync(
    '#chat-messages > yt-live-chat-header-renderer'
  )
  const refIconButton = header && header.querySelector('yt-live-chat-button')
  if (!header || !refIconButton) {
    return
  }

  const icon = document.createElement('yt-icon')
  icon.classList.add('style-scope', 'yt-button-renderer')

  const button = document.createElement('button')
  button.id = 'button'
  button.classList.add('style-scope', 'yt-icon-button')

  const iconButton = document.createElement('yt-icon-button')
  iconButton.id = 'button'
  iconButton.classList.add('style-scope', 'yt-button-renderer')

  const a = document.createElement('a')
  a.tabIndex = -1
  a.classList.add('yt-simple-endpoint', 'style-scope', 'yt-button-renderer')

  const liveChatButton = document.createElement('yt-live-chat-button')
  liveChatButton.id = 'live-chat-header-context-menu'
  liveChatButton.classList.add(
    ClassName.menuButton,
    'style-scope',
    'yt-live-chat-header-renderer'
  )
  iconButton.title = 'Filter Messages'
  iconButton.onclick = async () => {
    await chrome.runtime.sendMessage({ type: 'menu-button-clicked' })
  }

  header.insertBefore(liveChatButton, refIconButton)

  liveChatButton.append(a)
  a.append(iconButton)
  iconButton.append(button)
  button.append(icon)

  // insert svg after wrapper button appended
  icon.innerHTML = filterList

  // remove unnecessary elements
  liveChatButton.querySelector('yt-button-renderer')?.remove()
  iconButton.querySelector('button')?.remove()

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

    const text = field === 'author' ? author : message
    if (!text) {
      return carry
    }

    const matched = (() => {
      switch (condition) {
        case 'contains':
        case 'does_not_contain':
          return text.includes(value)
        case 'equals':
        case 'does_not_equal':
          return text === value
        case 'matches_regular_expression':
        case 'does_not_match_regular_expression': {
          const reg = new RegExp(value)
          return reg.test(text)
        }
      }
    })()

    const negative = condition.includes('does_not_')

    return (!negative && matched) || (negative && !matched) ? rule : carry
  }, undefined)
}

const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const getReason = (rule: Rule) => {
  return capitalize(
    `${rule.field} ${rule.condition.replace(/_/g, ' ')} "${rule.value}"`
  )
}

const addIconButton = ({
  element,
  className,
  title,
  html,
  onclick = () => undefined,
}: {
  element: HTMLElement
  className: string
  title: string
  html: string
  onclick?: () => void
}) => {
  const div = document.createElement('div')
  div.classList.add(className)
  div.title = title
  div.innerHTML = html
  div.onclick = onclick
  element.querySelector('#author-photo')?.append(div)
}

const updateItem = (element: HTMLElement) => {
  // reset message
  element.classList.remove(
    ClassName.filteredMessage,
    ClassName.deletedMessage,
    ClassName.hiddenMessage
  )
  // reset deleted
  element.removeAttribute('is-deleted')
  const deletedState = element.querySelector('#deleted-state')
  if (deletedState && deletedState.textContent === maskedMessage) {
    deletedState.textContent = ''
  }
  // reset icon button
  const cancelIcon = element.querySelector(`.${ClassName.cancelIcon}`)
  cancelIcon && cancelIcon.remove()
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
      ?.replace(/<img [^>]*alt="([^"]+)" [^>]*>/g, (_match, p1) => `:${p1}:`)
      .replace(/<[^>]*>/g, '')

    const rule = getMatchedRule(author, message)
    if (rule) {
      element.classList.add(ClassName.deletedMessage)
      element.setAttribute('is-deleted', '')

      if (rule.action === 'hide_completely') {
        element.classList.add(ClassName.hiddenMessage)
      } else {
        const deletedState = element.querySelector('#deleted-state')
        if (deletedState) {
          deletedState.textContent = maskedMessage
        }
        addIconButton({
          element,
          className: ClassName.errorIcon,
          title: getReason(rule),
          html: error,
        })
      }
    } else {
      addIconButton({
        element,
        className: ClassName.cancelIcon,
        title: 'Add this author to filters',
        html: cancel,
        onclick: async () => {
          await chrome.runtime.sendMessage({
            type: 'add-button-clicked',
            data: { author },
          })
        },
      })
    }
  }

  element.classList.add(ClassName.filteredMessage)
}

const updateItems = () => {
  const items = Array.from(
    document.querySelectorAll(
      '#items.yt-live-chat-item-list-renderer>yt-live-chat-text-message-renderer'
    )
  )
  for (const item of items) {
    if (item instanceof HTMLElement) {
      updateItem(item)
    }
  }
}

const observe = async () => {
  let messageObserver: MutationObserver | undefined = undefined

  const observeMessages = async () => {
    messageObserver?.disconnect()

    const el = await querySelectorAsync(
      '#items.yt-live-chat-item-list-renderer'
    )
    if (!el) {
      return
    }

    messageObserver = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        const nodes = Array.from(mutation.addedNodes)
        nodes.forEach((node: Node) => {
          if (node instanceof HTMLElement) {
            updateItem(node)
          }
        })
      })
    })
    messageObserver.observe(el, { childList: true })
  }

  await observeMessages()

  const el = await querySelectorAsync('#item-list.yt-live-chat-renderer')
  if (!el) {
    return
  }

  const observer = new MutationObserver(async () => {
    updateItems()
    await observeMessages()
  })
  observer.observe(el, { childList: true })
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const { type, data } = message
  switch (type) {
    case 'enabled-changed':
      enabled = data.enabled
      updateRoot()
      updateMenuButton()
      updateItems()
      return sendResponse()
    case 'settings-changed':
      settings = data.settings
      updateItems()
      return sendResponse()
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  const data = await chrome.runtime.sendMessage({ type: 'content-loaded' })
  enabled = data.enabled
  settings = data.settings
  updateRoot()
  updateItems()
  await addMenuButton()
  await observe()
})
