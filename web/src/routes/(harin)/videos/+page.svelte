<!-- 동영상 페이지 — YouTube 채널 임포트 + 수동 추가 -->
<script lang="ts">
  import { videoApi, extractYouTubeId, type Video } from '$lib/harin/api';

  let items = $state<Video[]>([]);
  let loading = $state(false);
  let creating = $state(false);
  let syncing = $state(false);
  let manualUrl = $state('');
  let manualTitle = $state('');
  let manualNote = $state('');
  let channelUrl = $state('https://www.youtube.com/@우리하린이');
  let apiKey = $state('');
  let syncMsg = $state('');
  let playingId = $state<string | null>(null);

  async function load() {
    loading = true;
    try {
      items = await videoApi.list();
    } catch (e) {
      console.error('video 로드 실패', e);
      items = [];
    } finally {
      loading = false;
    }
  }

  async function addManual(e: SubmitEvent) {
    e.preventDefault();
    const id = extractYouTubeId(manualUrl);
    if (!id) {
      alert('올바른 YouTube URL을 입력해 주세요.');
      return;
    }
    await videoApi.create({
      videoId: id,
      channelId: '',
      title: manualTitle.trim() || `영상 ${id}`,
      description: '',
      thumbnailUrl: `https://img.youtube.com/vi/${id}/mqdefault.jpg`,
      publishedAt: null,
      duration: '',
      date: new Date().toISOString().slice(0, 10),
      note: manualNote.trim(),
      source: 'manual',
    });
    manualUrl = '';
    manualTitle = '';
    manualNote = '';
    creating = false;
    await load();
  }

  async function sync() {
    syncing = true;
    syncMsg = '';
    try {
      const r = await videoApi.syncChannel({
        channelUrl: channelUrl || undefined,
        apiKey: apiKey || undefined,
      });
      syncMsg = `✅ ${r.importedCount}개 영상 임포트됨 (channelId=${r.channelId})`;
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      syncMsg = `❌ ${msg}`;
    } finally {
      syncing = false;
    }
  }

  async function remove(id: string) {
    if (!confirm('이 동영상을 삭제할까요?')) return;
    await videoApi.remove(id);
    await load();
  }

  $effect(() => {
    load();
  });
</script>

<svelte:head><title>동영상 — Harin's Moments</title></svelte:head>

<header class="header">
  <h1>🎬 동영상</h1>
  <button class="primary" onclick={() => (creating = !creating)}>{creating ? '취소' : '+ 수동 추가'}</button>
</header>

<section class="sync-card">
  <h2>📺 우리하린이 채널 임포트</h2>
  <p class="muted">채널의 모든 영상을 메타데이터로 가져옵니다. 첫 실행 시 YouTube Data API 키가 필요합니다.</p>
  <div class="form-row">
    <input type="text" placeholder="채널 URL (예: https://youtube.com/@우리하린이)" bind:value={channelUrl} />
    <input type="password" placeholder="YouTube Data API key (서버 env에 설정 시 생략 가능)" bind:value={apiKey} />
    <button class="primary" onclick={sync} disabled={syncing}>{syncing ? '동기화 중...' : '동기화'}</button>
  </div>
  {#if syncMsg}<p class="sync-msg">{syncMsg}</p>{/if}
</section>

{#if creating}
  <form class="form" onsubmit={addManual}>
    <input type="url" placeholder="YouTube URL" bind:value={manualUrl} required />
    <input type="text" placeholder="제목" bind:value={manualTitle} />
    <input type="text" placeholder="메모" bind:value={manualNote} />
    <button type="submit" class="primary">추가</button>
  </form>
{/if}

{#if loading}
  <p class="muted">불러오는 중...</p>
{:else if items.length === 0}
  <p class="muted empty">아직 동영상이 없습니다.</p>
{:else}
  <div class="grid">
    {#each items as v (v.id)}
      <article class="card">
        {#if playingId === v.id}
          <div class="player">
            <iframe
              title={v.title}
              src="https://www.youtube.com/embed/{v.videoId}?autoplay=1"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen></iframe>
          </div>
        {:else}
          <button class="thumb" onclick={() => (playingId = v.id)}>
            <img src={v.thumbnailUrl || `https://img.youtube.com/vi/${v.videoId}/mqdefault.jpg`} alt={v.title} loading="lazy" />
            <span class="play">▶</span>
          </button>
        {/if}
        <h4>{v.title}</h4>
        <div class="meta">
          {#if v.date}<time>{v.date}</time>{/if}
          <span class="source-{v.source}">{v.source === 'imported' ? '📥 임포트' : '✏️ 수동'}</span>
        </div>
        {#if v.note}<p class="note">{v.note}</p>{/if}
        <button class="delete" onclick={() => remove(v.id)}>삭제</button>
      </article>
    {/each}
  </div>
{/if}

<style>
  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
  .sync-card { background:#f5f9ff; border:1px solid #b5d8ff; padding:1rem; border-radius:.6rem; margin-bottom:1.5rem; }
  .sync-card h2 { margin:0 0 .4rem; font-size:1.05rem; }
  .sync-card .form-row { display:flex; gap:.5rem; flex-wrap:wrap; margin-top:.6rem; }
  .sync-card input { flex:1; min-width:220px; padding:.5rem; border:1px solid #ccc; border-radius:.4rem; }
  .sync-msg { margin-top:.5rem; padding:.5rem; background:white; border-radius:.4rem; font-family:monospace; font-size:.85rem; }
  .form { display:grid; gap:.5rem; padding:1rem; border:1px solid #ddd; border-radius:.5rem; background:#fafafa; margin-bottom:1rem; }
  .form input { padding:.5rem; border:1px solid #ccc; border-radius:.4rem; font-size:1rem; }
  button.primary { background:#4a8; color:white; border:none; padding:.5rem 1rem; border-radius:.4rem; cursor:pointer; }
  button.primary:disabled { background:#aaa; cursor:not-allowed; }
  .grid { display:grid; grid-template-columns:repeat(auto-fill, minmax(280px, 1fr)); gap:1rem; }
  .card { background:white; border:1px solid #eee; border-radius:.6rem; padding:1rem; }
  .thumb { position:relative; display:block; width:100%; border:none; padding:0; background:none; cursor:pointer; }
  .thumb img { width:100%; aspect-ratio:16/9; object-fit:cover; border-radius:.4rem; display:block; }
  .play { position:absolute; top:50%; left:50%; transform:translate(-50%,-50%); width:48px; height:48px; background:rgba(0,0,0,.7); color:white; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; }
  .player iframe { width:100%; aspect-ratio:16/9; border:none; border-radius:.4rem; }
  .card h4 { margin:.6rem 0 .3rem; font-size:1rem; line-height:1.3; }
  .meta { display:flex; justify-content:space-between; font-size:.8rem; color:#888; }
  .source-imported { color:#4a8; }
  .source-manual { color:#888; }
  .note { color:#666; font-size:.9rem; margin:.5rem 0; }
  .delete { background:transparent; border:1px solid #d66; color:#d66; padding:.2rem .6rem; border-radius:.3rem; cursor:pointer; font-size:.8rem; }
  .muted { color:#888; }
  .empty { text-align:center; padding:2rem; }
</style>
