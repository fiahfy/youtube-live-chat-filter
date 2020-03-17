import Rule from '~/models/rule'

export type FilterAction = 'hide_completely' | 'mask_message'

export default interface Settings {
  rules: Rule[]
  filterAction: FilterAction
}
