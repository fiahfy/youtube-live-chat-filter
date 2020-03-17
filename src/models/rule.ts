type Field = 'author' | 'message'
type Condition = 'contains' | 'matches_regular_expression'

export default interface Rule {
  id: string
  field: Field
  condition: Condition
  value: string
}
