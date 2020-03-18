<template>
  <v-card class="py-5" flat>
    <rule-table />
  </v-card>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'vue-property-decorator'
import { settingsStore } from '~/store'
import Rule from '~/models/rule'
import RuleTable from '~/components/RuleTable.vue'

@Component({
  components: {
    RuleTable
  }
})
export default class RuleTabItem extends Vue {
  get rules() {
    return settingsStore.rules
  }

  @Watch('rules')
  onRulesChanged(value: Rule[], oldValue: Rule[]) {
    if (value.length > oldValue.length) {
      this.$nextTick(() => {
        window.scrollTo(0, document.body.scrollHeight)
      })
    }
  }
}
</script>
