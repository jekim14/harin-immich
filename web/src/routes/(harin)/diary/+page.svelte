<!-- 일지 목록 + 새 일지 작성 -->
<script lang="ts">
  import { diaryApi, type Diary } from '$lib/harin/api';

  let items = $state<Diary[]>([]);
  let loading = $state(false);
  let creating = $state(false);
  let newTitle = $state('');
  let newContent = $state('');
  let newDate = $state(new Date().toISOString().slice(0, 10));
  let newMood = $state('😊');
  let search = $state('');
  let month = $state('');

  async function load() {
    loading = true;
    try {
      items = await diaryApi.list({
        search: search || undefined,
        month: month || undefined,
      });
    } catch (e) {
      console.error('일지 로드 실패', e);
      items = [];
    } finally {
      loading = false;
    }
  }

  async function save(e: SubmitEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    await diaryApi.create({
      date: newDate,
      title: newTitle.trim(),
      content: newContent.trim(),
      mood: newMood,
      assetIds: [],
    });
    newTitle = '';
    newContent = '';
    creating = false;
    await load();
  }

  async function remove(id: string) {
    if (!confirm('이 일지를 삭제할까요?')) return;
    await diaryApi.remove(id);
    await load();
  }

  $effect(() => {
    load();
  });
</script>

<svelte:head><title>일지 — 하린이의 성장 일기</title></svelte:head>

<header class="header">
  <h1>📔 육아 일지</h1>
  <button class="primary" onclick={() => (creating = !creating)}>
    {creating ? '취소' : '+ 새 일지'}
  </button>
</header>

<div class="filters">
  <input type="search" placeholder="제목/내용 검색" bind:value={search} oninput={load} />
  <input type="month" bind:value={month} onchange={load} />
</div>

{#if creating}
  <form class="form" onsubmit={save}>
    <div class="row">
      <input type="date" bind:value={newDate} required />
      <select bind:value={newMood}>
        <option>😊</option><option>😄</option><option>😢</option>
        <option>😡</option><option>😴</option><option>🤒</option>
      </select>
    </div>
    <input type="text" placeholder="제목" bind:value={newTitle} required />
    <textarea placeholder="오늘 있었던 일을 기록해 보세요..." bind:value={newContent} rows="5"></textarea>
    <button type="submit" class="primary">저장</button>
  </form>
{/if}

{#if loading}
  <p class="muted">불러오는 중...</p>
{:else if items.length === 0}
  <p class="muted empty">아직 일지가 없습니다. 첫 일지를 써보세요.</p>
{:else}
  <ul class="timeline">
    {#each items as item (item.id)}
      <li class="card">
        <div class="card-head">
          <span class="mood">{item.mood}</span>
          <strong>{item.title}</strong>
          <time>{item.date}</time>
        </div>
        {#if item.content}
          <p class="content">{item.content}</p>
        {/if}
        <button class="delete" onclick={() => remove(item.id)}>삭제</button>
      </li>
    {/each}
  </ul>
{/if}

<style>
  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
  .filters { display:flex; gap:.5rem; margin-bottom:1rem; }
  .filters input { padding:.5rem; border:1px solid #ddd; border-radius:.5rem; }
  .filters input[type="search"] { flex:1; }
  .form { display:grid; gap:.5rem; padding:1rem; border:1px solid #ddd; border-radius:.5rem; margin-bottom:1rem; background:#fafafa; }
  .form .row { display:flex; gap:.5rem; }
  .form input, .form select, .form textarea { padding:.5rem; border:1px solid #ccc; border-radius:.4rem; font-family:inherit; font-size:1rem; }
  .form textarea { resize:vertical; }
  button.primary { background:#4a8; color:white; border:none; padding:.5rem 1rem; border-radius:.4rem; cursor:pointer; }
  button.primary:hover { background:#3a7; }
  .timeline { list-style:none; padding:0; margin:0; }
  .card { border:1px solid #eee; padding:1rem; margin-bottom:.75rem; border-radius:.5rem; background:white; }
  .card-head { display:flex; align-items:center; gap:.75rem; margin-bottom:.5rem; }
  .card-head time { margin-left:auto; color:#888; font-size:.85rem; }
  .mood { font-size:1.5rem; }
  .content { white-space:pre-wrap; line-height:1.6; margin:.5rem 0; }
  .delete { background:transparent; border:1px solid #d66; color:#d66; padding:.25rem .75rem; border-radius:.3rem; cursor:pointer; font-size:.85rem; }
  .muted { color:#888; }
  .empty { text-align:center; padding:2rem; }
</style>
