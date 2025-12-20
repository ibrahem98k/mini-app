<script>
  import { createEventDispatcher } from 'svelte';
  import { currentUser, logout } from '../stores/auth';
  import AuthPanel from './AuthPanel.svelte';

  const dispatch = createEventDispatcher();

  function onSuccess(e) {
    dispatch('loggedIn');
  }
</script>

<div class="container">
  {#if $currentUser}
    <div class="card" style="margin-bottom:12px;">
      <div class="req-header">
        <div class="req-title">
          <div class="emoji">👤</div>
          <div>بيانات الحساب</div>
        </div>
      </div>
      <div style="margin-top:8px;">
        <div><span class="small">الاسم:</span> {$currentUser.name}</div>
        <div><span class="small">الجوال:</span> {$currentUser.phone}</div>
        {#if $currentUser.email}
          <div><span class="small">البريد:</span> {$currentUser.email}</div>
        {/if}
      </div>
      <div class="spacer"></div>
      <div class="actions">
        <button class="btn" on:click={() => dispatch('loggedIn')}>تم</button>
        <button class="btn btn-danger" on:click={() => { logout(); }}>تسجيل الخروج</button>
      </div>
    </div>
  {:else}
    <AuthPanel on:success={onSuccess} />
  {/if}
</div>
