import { browser } from 'webextension-polyfill-ts'
import error from '~/assets/error.svg'
import Settings from '~/models/settings'
import Rule from '~/models/rule'

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

const getReason = (author?: string, message?: string) => {
  return settings.rules.reduce((carry: string, rule: Rule) => {
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

      reg = new RegExp(`(${pattern})`, 'i')
    } catch (e) {
      return carry
    }

    const text = field === 'author' ? author : message
    if (!text || !reg.test(text)) {
      return carry
    }

    return `${field} ${condition.replace(/_/, ' ')} "${value}"`
  }, '')
}

const filter = (element: HTMLElement) => {
  if (element.tagName.toLowerCase() !== 'yt-live-chat-text-message-renderer') {
    return
  }

  const author = element.querySelector('#author-name')?.textContent ?? undefined
  const htmlMessage = element.querySelector('#message')?.innerHTML ?? undefined
  const message = htmlMessage
    ?.replace(/<img [^>]*alt="([^"]+)" [^>]*>/g, (_match, p1) => p1)
    .replace(/<[^>]*>/g, '')

  // remove an existing icon
  element.removeAttribute('is-deleted')
  const deletedState = element.querySelector('#deleted-state')
  if (deletedState) {
    deletedState.textContent = ''
  }
  const errorIcon = element.querySelector('.ylcf-error-icon')
  errorIcon && errorIcon.remove()

  const reason = getReason(author, message)
  if (!reason) {
    return
  }

  element.setAttribute('is-deleted', '')

  if (settings.filterAction === 'hide_completely') {
    element.style.display = 'none'
  } else {
    const deletedState = element.querySelector('#deleted-state')
    if (deletedState) {
      deletedState.textContent = '[message masked]'
    }
    const div = document.createElement('div')
    div.classList.add('ylcf-error-icon')
    div.title = reason
    div.innerHTML = error
    const svg = div.querySelector('svg') as SVGElement
    svg.style.fill = 'var(--yt-live-chat-secondary-text-color)'
    svg.style.width = '16px'
    element.prepend(div)
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
    case 'settingsChanged':
      settings = data.settings
      break
  }
})

document.addEventListener('DOMContentLoaded', async () => {
  const data = await browser.runtime.sendMessage({ id: 'contentLoaded' })
  settings = data.settings
  observe()
})
