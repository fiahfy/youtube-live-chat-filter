<template>
  <v-app>
    <v-content class="fill-height">
      <v-container ref="container" fluid px-0>
        <rule-table />
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component, Ref, Watch } from 'vue-property-decorator'
import { settingsStore } from '~/store'
import Rule from '~/models/rule'
import RuleTable from '~/components/RuleTable.vue'

@Component({
  components: {
    RuleTable,
  },
})
export default class Popup extends Vue {
  @Ref() readonly container!: HTMLDivElement

  get rules() {
    return settingsStore.rules
  }

  @Watch('rules')
  onRulesChanged(value: Rule[], oldValue: Rule[]) {
    if (oldValue.length && value.length > oldValue.length) {
      this.$nextTick(() => {
        const wrapper = this.container.parentElement
        if (wrapper) {
          wrapper.scrollTop = wrapper.scrollHeight
        }
      })
    }
  }
}
</script>

<style lang="scss">
html,
body {
  height: 100%;
  margin: 0;
  padding: 0;
}
html {
  overflow-y: hidden;
}
</style>

<style lang="scss" scoped>
.v-application {
  min-width: 640px;
  height: 600px;
  .v-content ::v-deep .v-content__wrap {
    overflow-y: auto;
  }
}
</style>
