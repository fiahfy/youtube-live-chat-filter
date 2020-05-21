<template>
  <v-app>
    <v-content class="fill-height">
      <v-container ref="container" fluid px-0>
        <rule-table />
        <div v-if="expander" class="expander" />
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

  expander = true

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

  mounted() {
    setTimeout(() => {
      this.expander = false
    })
  }
}
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
