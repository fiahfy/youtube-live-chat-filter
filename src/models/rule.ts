type Field = 'author' | 'message'
type Condition =
  | 'contains'
  | 'equals'
  | 'matches_regular_expression'
  | 'does_not_contain'
  | 'does_not_equal'
  | 'does_not_match_regular_expression'
type Action = 'mask_message' | 'hide_completely'

export type Rule = {
  id: string
  active: boolean
  field: Field
  condition: Condition
  value: string
  action: Action
}
