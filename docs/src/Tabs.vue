<template>
  <div class="c-tabs">
    <div class="c-tabs__nav">
      <button
        class="c-tabs__nav-button" 
        :class="{ 'c-tabs__nav-button--active': current === tab }"
        v-for="tab in tabs" 
        :key="tab.title" 
        @click.prevent="selectTab(tab)">
        {{tab.title}}
      </button>
    </div>

    <div class="c-tabs__content">
      <slot />
    </div>
  </div>
</template>

<script>
export default {
  name: 'Tabs',
  data() {
    return {
      tabs: [],
      current: null,
    };
  },
  methods: {
    addTab(tab) {
      this.tabs.push(tab);

      if (tab.active) {
        this.current = tab;
      }
    },
    selectTab(tab) {
      this.current = tab;

      this.tabs.forEach(o => o.isActive = o === this.current);
    },
  },
}
</script>

<style>

.c-tabs {
  display: flex;
  flex-direction: column;
}

.c-tabs__nav {
  background-color: #1e1e1e;
  flex: 0;
}

.c-tabs__content {
  flex: 1;
}

.c-tabs__nav-button {
  background: transparent;
  border: none;
  color: #fafafa;
  cursor: pointer;
  font-size: 14px;
  padding: 16px 8px;
  line-height: 19px;
}

.c-tabs__nav-button--active {
  color: #F50057;
}

</style>

