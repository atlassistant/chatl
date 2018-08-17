<template>
  <div class="c-tab" :class="{ 'c-tab--active': isActive }">
    <slot />
  </div>
</template>

<script>
export default {
  name: 'Tab',
  props: {
    title: {
      type: String,
      required: true,
    },
    active: Boolean,
  },
  data() {
    return {
      isActive: this.active,
    };
  },
  mounted() {
    this.$parent.addTab(this);
  },
}
</script>

<style>

.c-tab {
  display: none;
}

.c-tab--active {
  display: inherit;
}

</style>
