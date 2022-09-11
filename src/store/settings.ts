import { nanoid } from 'nanoid'
import { Module } from 'vuex'
import { Rule, Settings } from '~/models'
import { State as RootState } from '~/store'

export type State = Settings

const initialState: Settings = { rules: [] }

export const module: Module<State, RootState> = {
  namespaced: true,
  state: () => ({ ...initialState }),
  mutations: {
    addRule(state, params: Partial<Rule>) {
      const id = nanoid()

      state.rules = [
        ...state.rules,
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
    },
    removeRule(state, { id }: { id: string }) {
      state.rules = state.rules.filter((item) => item.id !== id)
    },
    removeRules(state, { ids }: { ids: string[] }) {
      state.rules = state.rules.filter((item) => !ids.includes(item.id))
    },
    setRule(state, { id, ...params }: Partial<Rule>) {
      state.rules = state.rules.map((item) => {
        if (item.id !== id) {
          return item
        }
        return {
          ...item,
          ...params,
        }
      })
    },
  },
}
