import { browser } from 'webextension-polyfill-ts'
import error from '~/assets/error.svg'
import Settings from '~/models/settings'
import Rule from '~/models/rule'

let settings: Settings | undefined

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
  return settings?.rules.reduce((carry: string, rule: Rule) => {
    if (carry) {
      return carry
    }

    const { field, condition, value } = rule
    if (!field || !value) {
      return carry
    }

    let reg
    try {
      const pattern = condition === 'matches_regular_expression'
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
  const message = element.querySelector('#message')?.textContent ?? undefined

  // reset
  element.classList.remove('ylcf-invisible')
  const infoIcon = element.querySelector('.ylcf-info-icon')
  infoIcon && infoIcon.remove()
  const infoDescription = element.querySelector('.ylcf-info-description')
  infoDescription && infoDescription.remove()

  const reason = getReason(author, message)
  if (!reason) {
    return
  }

  element.classList.add('ylcf-invisible')

  const description = document.createElement('div')
  description.classList.add('ylcf-info-description')
  description.textContent = '[message filtered]'
  element.prepend(description)

  const div = document.createElement('div')
  div.classList.add('ylcf-info-icon')
  div.title = reason
  div.innerHTML = error
  const svg = div.querySelector('svg') as SVGElement
  svg.style.fill = 'var(--yt-live-chat-secondary-text-color)'
  svg.style.width = '16px'
  element.prepend(div)
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
