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
import { defineComponent, reactive, onMounted } from '@vue/composition-api'
import RuleTable from '~/components/RuleTable.vue'

export default defineComponent({
  components: {
    RuleTable,
  },
  setup() {
    const state = reactive({
      expander: true,
    })

    onMounted(() => {
      window.setTimeout(() => {
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
