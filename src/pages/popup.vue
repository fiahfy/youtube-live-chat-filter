<template>
  <v-app>
    <v-content class="fill-height">
      <v-container class="pa-0" fluid fill-height>
        <v-card flat class="fill-height flex-grow-1">
          <v-tabs v-model="tabIndex" fixed-tabs class="fill-height">
            <v-tab v-for="(tab, index) in tabs" :key="index">
              {{ tab.title }}
            </v-tab>
            <v-tab-item v-for="(tab, index) in tabs" :key="index">
              <component :is="tab.item" />
            </v-tab-item>
          </v-tabs>
        </v-card>
      </v-container>
    </v-content>
  </v-app>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import FilterTabItem from '~/components/FilterTabItem.vue'

@Component
export default class Popup extends Vue {
  tabIndex = 0
  tabs = [
    { title: 'General', item: FilterTabItem },
    { title: 'Filters', item: FilterTabItem }
  ]
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
  .v-tabs {
    display: flex;
    flex-direction: column;
    ::v-deep {
      > .v-tabs-bar {
        flex-grow: 0;
      }
      > .v-tabs-items {
        flex-grow: 1;
        flex-basis: 0;
        overflow-y: auto;
      }
    }
  }
}
</style>
