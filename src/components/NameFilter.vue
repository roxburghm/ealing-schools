<template>
  <div class="name-filter">
    <label :for="id" class="visually-hidden">Filter schools by name</label>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
         stroke-linecap="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7"/>
      <path d="M20 20l-3.5-3.5"/>
    </svg>
    <input :id="id" ref="input" type="search" :value="modelValue" placeholder="Filter by name" autocomplete="off"
           enterkeyhint="search"
           @input="$emit('update:modelValue', $event.target.value)" @keydown.esc="clear">
    <button v-if="modelValue" type="button" class="name-filter__clear" aria-label="Clear filter" @click="clear">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.25"
           stroke-linecap="round" aria-hidden="true">
        <path d="M6 6l12 12M18 6L6 18"/>
      </svg>
    </button>
  </div>
</template>

<script>
export default {
  name: 'NameFilter',
  props: {
    modelValue: {type: String, default: ''},
    id: {type: String, default: 'name-filter'},
  },
  emits: ['update:modelValue'],
  methods: {
    clear() {
      this.$emit('update:modelValue', '');
      this.$refs.input?.focus();
    },
  },
};
</script>

<style scoped>
.name-filter {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  color: var(--ink-3);
}
.name-filter > svg { position: absolute; left: 14px; pointer-events: none; }
input {
  width: 100%;
  height: 44px;
  padding: 0 48px 0 40px;
  border: 1px solid #D5D9E0;
  border-radius: 12px;
  background: #fff;
  font: 16px var(--font); /* 16px stops iOS zooming in on focus */
  color: var(--ink);
}
input::-webkit-search-cancel-button { -webkit-appearance: none; appearance: none; }
input:focus { outline: 2px solid var(--accent); outline-offset: -1px; border-color: transparent; }
.name-filter__clear {
  position: absolute;
  right: 2px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 10px;
  background: transparent;
  color: var(--ink-2);
  cursor: pointer;
}
.name-filter__clear:hover { background: #F0F2F5; color: var(--ink); }
</style>
