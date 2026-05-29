<!-- 건강 기록 페이지 — 접종/병원/알레르기 3 sub-tab -->
<script lang="ts">
  import { healthApi, type HealthRecord, type HealthType } from '$lib/harin/api';

  let activeType = $state<HealthType>('vaccination');
  let items = $state<HealthRecord[]>([]);
  let loading = $state(false);
  let creating = $state(false);
  let form = $state<{
    date: string;
    title: string;
    note: string;
    extra: Record<string, string>;
  }>({ date: '', title: '', note: '', extra: {} });

  async function load() {
    loading = true;
    try {
      items = await healthApi.list(activeType);
    } catch (e) {
      console.error('health 로드 실패', e);
      items = [];
    } finally {
      loading = false;
    }
  }

  function resetForm() {
    form = { date: '', title: '', note: '', extra: {} };
  }

  async function save(e: SubmitEvent) {
    e.preventDefault();
    if (!form.title.trim()) return;
    await healthApi.create({
      type: activeType,
      date: form.date || null,
      title: form.title.trim(),
      note: form.note.trim(),
      extra: form.extra,
    });
    creating = false;
    resetForm();
    await load();
  }

  async function toggleVaccinationComplete(r: HealthRecord) {
    const completed = (r.extra as Record<string, unknown>)?.completedDate;
    const next = completed ? null : new Date().toISOString().slice(0, 10);
    await healthApi.update(r.id, { extra: { ...(r.extra as object), completedDate: next } });
    await load();
  }

  async function remove(id: string) {
    if (!confirm('삭제할까요?')) return;
    await healthApi.remove(id);
    await load();
  }

  function switchTab(t: HealthType) {
    activeType = t;
    creating = false;
    resetForm();
    load();
  }

  $effect(() => {
    load();
  });
</script>

<svelte:head><title>건강 — 하린이의 성장 일기</title></svelte:head>

<header class="header">
  <h1>🏥 건강 기록</h1>
</header>

<nav class="tabs">
  <button class:active={activeType === 'vaccination'} onclick={() => switchTab('vaccination')}>예방접종</button>
  <button class:active={activeType === 'hospital'} onclick={() => switchTab('hospital')}>병원 방문</button>
  <button class:active={activeType === 'allergy'} onclick={() => switchTab('allergy')}>알레르기</button>
</nav>

{#if activeType !== 'vaccination'}
  <div class="actions">
    <button class="primary" onclick={() => (creating = !creating)}>{creating ? '취소' : '+ 추가'}</button>
  </div>
{/if}

{#if creating}
  <form class="form" onsubmit={save}>
    {#if activeType === 'hospital'}
      <div class="row">
        <input type="date" bind:value={form.date} required />
        <input type="text" placeholder="병원명 (제목)" bind:value={form.title} required />
      </div>
      <textarea placeholder="증상" rows="2" oninput={(e) => (form.extra.symptoms = e.currentTarget.value)}></textarea>
      <textarea placeholder="처방/진단" rows="2" oninput={(e) => (form.extra.prescription = e.currentTarget.value)}></textarea>
      <input type="text" placeholder="메모" bind:value={form.note} />
    {:else if activeType === 'allergy'}
      <input type="text" placeholder="알레르기 항목 (제목, 예: 땅콩)" bind:value={form.title} required />
      <input type="text" placeholder="증상" oninput={(e) => (form.extra.symptoms = e.currentTarget.value)} />
      <select onchange={(e) => (form.extra.severity = e.currentTarget.value)}>
        <option value="low">경미</option>
        <option value="medium">보통</option>
        <option value="high">심각</option>
      </select>
      <input type="text" placeholder="메모" bind:value={form.note} />
    {/if}
    <button type="submit" class="primary">저장</button>
  </form>
{/if}

{#if loading}<p class="muted">불러오는 중...</p>{/if}

{#if activeType === 'vaccination'}
  <ul class="list">
    {#each items as v (v.id)}
      {@const done = !!(v.extra as Record<string, unknown>)?.completedDate}
      <li class="vacc">
        <button class="check {done ? 'done' : ''}" onclick={() => toggleVaccinationComplete(v)}>
          {done ? '✓' : ''}
        </button>
        <div class="info">
          <h4>{v.title}</h4>
          <span>{(v.extra as Record<string, string>)?.schedule || ''} {done ? `· ✅ ${(v.extra as Record<string, string>).completedDate}` : ''}</span>
        </div>
      </li>
    {/each}
  </ul>
{:else if activeType === 'hospital'}
  <ul class="list">
    {#each items as h (h.id)}
      <li class="card">
        <div class="card-head">
          <strong>{h.title}</strong>
          <time>{h.date ?? ''}</time>
        </div>
        {#if (h.extra as Record<string, string>)?.symptoms}
          <p><b>증상</b> {(h.extra as Record<string, string>).symptoms}</p>
        {/if}
        {#if (h.extra as Record<string, string>)?.prescription}
          <p><b>처방</b> {(h.extra as Record<string, string>).prescription}</p>
        {/if}
        {#if h.note}<p class="muted">{h.note}</p>{/if}
        <button class="delete" onclick={() => remove(h.id)}>삭제</button>
      </li>
    {/each}
  </ul>
{:else}
  <ul class="allergies">
    {#each items as a (a.id)}
      {@const sev = (a.extra as Record<string, string>)?.severity || 'low'}
      <li class="tag tag-{sev}" title={(a.extra as Record<string, string>)?.symptoms || ''}>
        ⚠️ {a.title}
        <button class="x" onclick={() => remove(a.id)}>✕</button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .header { margin-bottom:1rem; }
  .tabs { display:flex; gap:.4rem; margin-bottom:1rem; border-bottom:1px solid #ddd; }
  .tabs button { background:transparent; border:none; padding:.6rem 1rem; cursor:pointer; border-bottom:2px solid transparent; color:#555; }
  .tabs button.active { border-bottom-color:#4a8; color:#4a8; font-weight:bold; }
  .actions { margin-bottom:1rem; text-align:right; }
  .form { display:grid; gap:.5rem; padding:1rem; border:1px solid #ddd; border-radius:.5rem; background:#fafafa; margin-bottom:1rem; }
  .form .row { display:flex; gap:.5rem; }
  .form input, .form select, .form textarea { padding:.5rem; border:1px solid #ccc; border-radius:.4rem; font-size:1rem; }
  button.primary { background:#4a8; color:white; border:none; padding:.5rem 1rem; border-radius:.4rem; cursor:pointer; }
  .list { list-style:none; padding:0; margin:0; }
  .vacc { display:flex; align-items:center; gap:.75rem; padding:.6rem; border-bottom:1px solid #eee; }
  .check { width:24px; height:24px; border-radius:50%; border:2px solid #ccc; background:white; cursor:pointer; }
  .check.done { background:#4a8; color:white; border-color:#4a8; }
  .info h4 { margin:0; }
  .info span { color:#888; font-size:.85rem; }
  .card { border:1px solid #eee; padding:1rem; border-radius:.5rem; margin-bottom:.75rem; }
  .card-head { display:flex; justify-content:space-between; margin-bottom:.5rem; }
  .card-head time { color:#888; }
  .delete { background:transparent; border:1px solid #d66; color:#d66; padding:.2rem .6rem; border-radius:.3rem; cursor:pointer; font-size:.8rem; }
  .allergies { display:flex; flex-wrap:wrap; gap:.5rem; list-style:none; padding:0; }
  .tag { padding:.4rem .8rem; border-radius:1rem; display:flex; align-items:center; gap:.3rem; }
  .tag-low { background:#fff3cd; color:#856404; }
  .tag-medium { background:#ffe0b2; color:#bf6500; }
  .tag-high { background:#f8d7da; color:#721c24; }
  .x { background:transparent; border:none; cursor:pointer; font-size:.8rem; }
  .muted { color:#888; }
</style>
