<script setup lang="ts">
import { reactive, onMounted } from 'vue'
import RuleTable from '~/components/RuleTable.vue'

const state = reactive({
  expander: true,
})

onMounted(() => {
  window.setTimeout(() => {
    state.expander = false
  })
})
</script>

<template>
  <v-app>
    <v-main class="fill-height">
      <v-container fluid px-0>
        <RuleTable />
        <div v-if="state.expander" class="expander" />
      </v-container>
    </v-main>
  </v-app>
</template>

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
