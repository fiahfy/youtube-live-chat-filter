import className from './class-name'

const code = `
yt-live-chat-header-renderer > #primary-content {
  min-width: 0;
}

yt-live-chat-header-renderer > #primary-content > #view-selector > yt-sort-filter-sub-menu-renderer {
  width: 100%;
}

.${className.menuButton}.${className.menuButtonActive} > button > yt-icon {
  color: #4387f1!important;
}

.${className.menuButton} > button > yt-icon > svg {
  pointer-events: none;
  display: block;
  width: 100%;
  height: 100%;
}

.${className.guestHidden} yt-live-chat-item-list-renderer
yt-live-chat-text-message-renderer[author-type=''] {
  display: none!important;
}
.${className.memberHidden} yt-live-chat-item-list-renderer
yt-live-chat-text-message-renderer[author-type=member] {
  display: none!important;
}
.${className.moderatorHidden} yt-live-chat-item-list-renderer
yt-live-chat-text-message-renderer[author-type=moderator] {
  display: none!important;
}
.${className.ownerHidden} yt-live-chat-item-list-renderer
yt-live-chat-text-message-renderer[author-type=owner] {
  display: none!important;
}
.${className.superChatHidden} yt-live-chat-item-list-renderer
yt-live-chat-paid-message-renderer {
  display: none!important;
}
.${className.superStickerHidden} yt-live-chat-item-list-renderer
yt-live-chat-paid-sticker-renderer {
  display: none!important;
}
.${className.membershipHidden} yt-live-chat-item-list-renderer
yt-live-chat-legacy-paid-message-renderer {
  display: none!important;
}
`

export default code
