import nanoid from 'nanoid'
import { Module, VuexModule, Mutation } from 'vuex-module-decorators'
import Filter from '~/models/filter'

@Module({ name: 'settings' })
export default class SettingsModule extends VuexModule {
  filters: Filter[] = []

  get getFilter() {
    return ({ id }: { id: string }) => {
      return this.filters.find((filter) => filter.id === id)
    }
  }

  @Mutation
  addFilter(params: Partial<Filter>) {
    const id = nanoid()

    this.filters = [
      ...this.filters,
      {
        subject: '',
        keyword: '',
        regExp: false,
        ...params,
        id
      }
    ]
  }
  @Mutation
  removeFilter({ id }: { id: string }) {
    this.filters = this.filters.filter((item) => item.id !== id)
  }
  @Mutation
  setFilter({ id, ...params }: Partial<Filter>) {
    this.filters = this.filters.map((item) => {
      if (item.id !== id) {
        return item
      }
      return {
        ...item,
        ...params
      }
    })
  }
}
