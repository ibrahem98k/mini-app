<script>
  import { categories } from '../lib/categories';
  export let value = '';
  function select(key) { value = key; }
</script>

<div class="grid">
  {#each categories as c}
    <div class="category" class:selected={value===c.key} on:click={() => select(c.key)} role="button" aria-pressed={value===c.key}>
      <div class="emoji">{c.emoji}</div>
      <div class="name">{c.name}</div>
    </div>
  {/each}
</div>
