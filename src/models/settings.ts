import Rule from '~/models/rule'

export type FilterAction = 'mask_message' | 'hide_completely'

export default interface Settings {
  rules: Rule[]
  filterAction: FilterAction
}
