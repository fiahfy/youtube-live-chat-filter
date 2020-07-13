<template>
  <v-app>
    <v-main class="fill-height">
      <v-container fluid px-0>
        <rule-table />
        <div v-if="state.expander" class="expander" />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  watch,
  onMounted,
  SetupContext,
} from '@vue/composition-api'
import RuleTable from '~/components/RuleTable.vue'
import { settingsStore } from '~/store'

export default defineComponent({
  components: {
    RuleTable,
  },
  setup(_props: unknown, context: SetupContext) {
    const state = reactive({
      expander: true,
    })

    watch(
      () => settingsStore.rules,
      (rules, prevRules) => {
        if (rules.length > prevRules.length && prevRules.length) {
          context.root.$nextTick(() => {
            window.scrollTo(0, document.body.offsetHeight)
          })
        }
      }
    )

    onMounted(() => {
      setTimeout(() => {
        state.expander = false
      })
    })

    return {
      state,
    }
  },
})
</script>

<style lang="scss">
html {
  overflow-y: auto;
}
</style>

<style lang="scss" scoped>
.v-application {
  width: 640px;
  .expander {
    height: 600px;
  }
}
</style>
