import { nanoid } from 'nanoid'
import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import { Rule } from '~/models'

@Module({ name: 'settings' })
export default class SettingsModule extends VuexModule {
  rules: Rule[] = []

  get getRule() {
    return ({ id }: { id: string }): Rule | undefined => {
      return this.rules.find((rule) => rule.id === id)
    }
  }

  @Mutation
  addRule(params: Partial<Rule>): void {
    const id = nanoid()

    this.rules = [
      ...this.rules,
      {
        active: true,
        field: 'message',
        condition: 'contains',
        value: '',
        action: 'hide_completely',
        ...params,
        id,
      },
    ]
  }
  @Mutation
  removeRule({ id }: { id: string }): void {
    this.rules = this.rules.filter((item) => item.id !== id)
  }
  @Mutation
  removeRules({ ids }: { ids: string[] }): void {
    this.rules = this.rules.filter((item) => !ids.includes(item.id))
  }
  @Mutation
  setRule({ id, ...params }: Partial<Rule>): void {
    this.rules = this.rules.map((item) => {
      if (item.id !== id) {
        return item
      }
      return {
        ...item,
        ...params,
      }
    })
  }
}
