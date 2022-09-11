export type Rule = {
  id: string
  active: boolean
  field: 'author' | 'message'
  condition:
    | 'contains'
    | 'equals'
    | 'matches_regular_expression'
    | 'does_not_contain'
    | 'does_not_equal'
    | 'does_not_match_regular_expression'
  value: string
  action: 'mask_message' | 'hide_completely'
}

export type Settings = {
  rules: Rule[]
}
