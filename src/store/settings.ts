import { nanoid } from 'nanoid'
import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import Rule from '~/models/rule'

@Module({ name: 'settings' })
export default class SettingsModule extends VuexModule {
  rules: Rule[] = []

  get getRule() {
    return ({ id }: { id: string }) => {
      return this.rules.find((rule) => rule.id === id)
    }
  }

  @Mutation
  addRule(params: Partial<Rule>) {
    const id = nanoid()

    this.rules = [
      ...this.rules,
      {
        active: true,
        field: 'message',
        condition: 'contains',
        value: '',
        action: 'mask_message',
        ...params,
        id,
      },
    ]
  }
  @Mutation
  removeRule({ id }: { id: string }) {
    this.rules = this.rules.filter((item) => item.id !== id)
  }
  @Mutation
  setRule({ id, ...params }: Partial<Rule>) {
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
