type Field = 'author' | 'message'
type Condition = 'contains' | 'matches_regular_expression'
type Action = 'mask_message' | 'hide_completely'

export default interface Rule {
  id: string
  active: boolean
  field: Field
  condition: Condition
  value: string
  action: Action
}
