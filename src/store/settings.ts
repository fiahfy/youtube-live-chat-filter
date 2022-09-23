import {
  PayloadAction,
  createSelector,
  createSlice,
  nanoid,
} from '@reduxjs/toolkit'
import { Rule, Settings } from '~/models'
import { AppState } from '~/store'

type State = Settings

export const initialState: State = {
  rules: [],
}

export const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    addRule(state, action: PayloadAction<Partial<Rule>>) {
      const rule = {
        active: true,
        field: 'message',
        condition: 'contains',
        value: '',
        action: 'hide_completely',
        ...action.payload,
        id: nanoid(),
      } as const
      return { ...state, rules: [...state.rules, rule] }
    },
    removeRule(state, action: PayloadAction<string>) {
      return {
        ...state,
        rules: state.rules.filter((item) => item.id !== action.payload),
      }
    },
    removeRules(state, action: PayloadAction<string[]>) {
      return {
        ...state,
        rules: state.rules.filter((item) => !action.payload.includes(item.id)),
      }
    },
    setRule(state, action: PayloadAction<Partial<Rule>>) {
      const { id, ...params } = action.payload
      return {
        ...state,
        rules: state.rules.map((item) => {
          if (item.id !== id) {
            return item
          }
          return {
            ...item,
            ...params,
          }
        }),
      }
    },
  },
})

export const { addRule, removeRule, removeRules, setRule } =
  settingsSlice.actions

export default settingsSlice.reducer

export const selectSettings = (state: AppState) => state.settings

export const selectRules = createSelector(
  selectSettings,
  (settings) => settings.rules
)

export const selectGetRule = createSelector(
  selectSettings,
  (settings) => (id: string) => settings.rules.find((rule) => rule.id === id)
)
