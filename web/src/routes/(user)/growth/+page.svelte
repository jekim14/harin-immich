<!-- 성장 기록 페이지 — 표 + SVG 라인 차트 -->
<script lang="ts">
  import UserPageLayout from '$lib/components/layouts/UserPageLayout.svelte';
  import { growthApi, type Growth } from '$lib/harin/api';

  let items = $state<Growth[]>([]);
  let loading = $state(false);
  let creating = $state(false);
  let uploadingAssets = $state(false);
  let form = $state({
    date: new Date().toISOString().slice(0, 10),
    heightCm: '' as string,
    weightKg: '' as string,
    headCircCm: '' as string,
    note: '',
    isCheckup: false,
    examRound: '' as string,
    examPlace: '',
    assetIds: [] as string[],
  });
  let activeMetrics = $state<Set<'height' | 'weight' | 'head'>>(new Set(['height', 'weight']));

  // 영유아 검진 차수별 안내 (만 나이 기준)
  const CHECKUP_ROUNDS: Array<{ round: number; label: string }> = [
    { round: 1, label: '1차 (생후 14~35일)' },
    { round: 2, label: '2차 (4~6개월)' },
    { round: 3, label: '3차 (9~12개월)' },
    { round: 4, label: '4차 (18~24개월)' },
    { round: 5, label: '5차 (30~36개월)' },
    { round: 6, label: '6차 (42~48개월)' },
    { round: 7, label: '7차 (54~60개월)' },
    { round: 8, label: '8차 (66~71개월)' },
    { round: 9, label: '9차 (학교 입학 전)' },
  ];

  // Immich에 사진/PDF 업로드 → asset_id 반환
  async function uploadFiles(files: FileList): Promise<string[]> {
    const ids: string[] = [];
    const deviceId = 'harin-moments-growth';
    for (const file of files) {
      const fd = new FormData();
      fd.append('assetData', file);
      fd.append('deviceAssetId', `growth-${Date.now()}-${file.name}`);
      fd.append('deviceId', deviceId);
      fd.append('fileCreatedAt', new Date(file.lastModified).toISOString());
      fd.append('fileModifiedAt', new Date(file.lastModified).toISOString());
      const res = await fetch('/api/assets', { method: 'POST', body: fd, credentials: 'include' });
      if (!res.ok) {
        console.error('asset upload 실패', res.status, await res.text().catch(() => ''));
        continue;
      }
      const data = (await res.json()) as { id?: string };
      if (data.id) ids.push(data.id);
    }
    return ids;
  }

  async function handleFilePick(e: Event) {
    const input = e.currentTarget as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    uploadingAssets = true;
    try {
      const newIds = await uploadFiles(input.files);
      form.assetIds = [...form.assetIds, ...newIds];
    } finally {
      uploadingAssets = false;
      input.value = '';
    }
  }

  function removeAsset(id: string) {
    form.assetIds = form.assetIds.filter((x) => x !== id);
  }

  async function load() {
    loading = true;
    try {
      items = await growthApi.list();
    } catch (e) {
      console.error('성장 로드 실패', e);
    } finally {
      loading = false;
    }
  }

  async function save(e: SubmitEvent) {
    e.preventDefault();
    await growthApi.create({
      date: form.date,
      heightCm: form.heightCm ? parseFloat(form.heightCm) : null,
      weightKg: form.weightKg ? parseFloat(form.weightKg) : null,
      headCircCm: form.headCircCm ? parseFloat(form.headCircCm) : null,
      note: form.note.trim(),
      isCheckup: form.isCheckup,
      examRound: form.isCheckup && form.examRound ? parseInt(form.examRound, 10) : null,
      examPlace: form.isCheckup ? form.examPlace.trim() : '',
      assetIds: form.assetIds,
    });
    form = {
      date: new Date().toISOString().slice(0, 10),
      heightCm: '',
      weightKg: '',
      headCircCm: '',
      note: '',
      isCheckup: false,
      examRound: '',
      examPlace: '',
      assetIds: [],
    };
    creating = false;
    await load();
  }

  async function remove(id: string) {
    if (!confirm('이 기록을 삭제할까요?')) return;
    await growthApi.remove(id);
    await load();
  }

  function toggleMetric(m: 'height' | 'weight' | 'head') {
    const s = new Set(activeMetrics);
    s.has(m) ? s.delete(m) : s.add(m);
    activeMetrics = s;
  }

  let chart = $derived.by(() => {
    const W = 600, H = 240, padL = 40, padR = 10, padT = 20, padB = 30;
    const innerW = W - padL - padR;
    const innerH = H - padT - padB;
    if (items.length === 0) return { W, H, lines: [], xLabels: [], yLabels: [] };

    const series: { key: 'height' | 'weight' | 'head'; label: string; color: string; vals: (number | null)[] }[] = [];
    if (activeMetrics.has('height')) series.push({ key: 'height', label: '키 cm', color: '#e87b6b', vals: items.map((g) => g.heightCm) });
    if (activeMetrics.has('weight')) series.push({ key: 'weight', label: '몸무게 kg', color: '#9b8bd6', vals: items.map((g) => g.weightKg) });
    if (activeMetrics.has('head')) series.push({ key: 'head', label: '머리 cm', color: '#7bc8a4', vals: items.map((g) => g.headCircCm) });

    const allVals = series.flatMap((s) => s.vals.filter((v): v is number => v != null));
    const yMin = allVals.length ? Math.min(...allVals) * 0.95 : 0;
    const yMax = allVals.length ? Math.max(...allVals) * 1.05 : 1;

    const lines = series.map((s) => {
      const pts = s.vals
        .map((v, i) => {
          if (v == null) return null;
          const x = padL + (items.length > 1 ? (i / (items.length - 1)) * innerW : innerW / 2);
          const y = padT + innerH - ((v - yMin) / (yMax - yMin)) * innerH;
          return `${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .filter(Boolean);
      return { ...s, path: pts.join(' L ') };
    });

    const xLabels = items.map((g, i) => ({
      x: padL + (items.length > 1 ? (i / (items.length - 1)) * innerW : innerW / 2),
      label: g.date.slice(5),
    }));
    const yLabels = [0, 0.5, 1].map((t) => ({
      y: padT + innerH - t * innerH,
      val: (yMin + t * (yMax - yMin)).toFixed(1),
    }));

    return { W, H, lines, xLabels, yLabels };
  });

  $effect(() => {
    load();
  });
</script>

<svelte:head><title>성장 — Harin's Moments</title></svelte:head>

<UserPageLayout title="📏 성장 기록">
<div class="page-actions">
  <button class="primary" onclick={() => (creating = !creating)}>{creating ? '취소' : '+ 기록 추가'}</button>
</div>

{#if creating}
  <form class="form" onsubmit={save}>
    <div class="row">
      <label>날짜 <input type="date" bind:value={form.date} required /></label>
    </div>
    <div class="row">
      <label>키 cm <input type="number" step="0.1" bind:value={form.heightCm} placeholder="105.5" /></label>
      <label>몸무게 kg <input type="number" step="0.1" bind:value={form.weightKg} placeholder="17.2" /></label>
      <label>머리둘레 cm <input type="number" step="0.1" bind:value={form.headCircCm} placeholder="50.0" /></label>
    </div>
    <input type="text" placeholder="메모" bind:value={form.note} />

    <label class="checkup-toggle">
      <input type="checkbox" bind:checked={form.isCheckup} />
      🏥 영유아 검진 결과서로 기록
    </label>

    {#if form.isCheckup}
      <div class="checkup-fields">
        <div class="row">
          <label>
            검진 차수
            <select bind:value={form.examRound}>
              <option value="">선택</option>
              {#each CHECKUP_ROUNDS as r}
                <option value={String(r.round)}>{r.label}</option>
              {/each}
            </select>
          </label>
          <label class="grow">
            검진 기관
            <input type="text" placeholder="OO소아과의원" bind:value={form.examPlace} />
          </label>
        </div>

        <label class="file-input">
          📎 결과서 사진/스캔 첨부 (여러 장 가능)
          <input type="file" accept="image/*,application/pdf" multiple onchange={handleFilePick} />
        </label>

        {#if uploadingAssets}<p class="muted">업로드 중...</p>{/if}

        {#if form.assetIds.length > 0}
          <div class="asset-list">
            {#each form.assetIds as id}
              <div class="asset-chip">
                <a href={`/photos/${id}`} target="_blank" rel="noopener">{id.slice(0, 8)}…</a>
                <button type="button" class="x" onclick={() => removeAsset(id)}>✕</button>
              </div>
            {/each}
          </div>
        {/if}
      </div>
    {/if}

    <button type="submit" class="primary">저장</button>
  </form>
{/if}

<section class="chart">
  <div class="chips">
    <button class:active={activeMetrics.has('height')} onclick={() => toggleMetric('height')}>키</button>
    <button class:active={activeMetrics.has('weight')} onclick={() => toggleMetric('weight')}>몸무게</button>
    <button class:active={activeMetrics.has('head')} onclick={() => toggleMetric('head')}>머리둘레</button>
  </div>
  {#if items.length === 0}
    <p class="muted empty">아직 데이터가 없습니다.</p>
  {:else}
    <svg viewBox="0 0 {chart.W} {chart.H}" preserveAspectRatio="xMidYMid meet" class="chart-svg">
      {#each chart.yLabels as l}
        <line x1="40" x2={chart.W - 10} y1={l.y} y2={l.y} stroke="#eee" />
        <text x="35" y={l.y + 3} text-anchor="end" font-size="10" fill="#888">{l.val}</text>
      {/each}
      {#each chart.lines as ln}
        <path d="M {ln.path}" fill="none" stroke={ln.color} stroke-width="2" />
      {/each}
      {#each chart.xLabels as l, i}
        {#if i % Math.max(1, Math.floor(chart.xLabels.length / 6)) === 0}
          <text x={l.x} y={chart.H - 10} text-anchor="middle" font-size="10" fill="#888">{l.label}</text>
        {/if}
      {/each}
    </svg>
    <div class="legend">
      {#each chart.lines as ln}
        <span style="color:{ln.color}">● {ln.label}</span>
      {/each}
    </div>
  {/if}
</section>

<section class="table-wrap">
  <h2>기록 목록</h2>
  {#if loading}<p class="muted">불러오는 중...</p>{/if}
  <table>
    <thead>
      <tr><th>날짜</th><th>유형</th><th>키 cm</th><th>몸무게 kg</th><th>머리 cm</th><th>메모</th><th>첨부</th><th></th></tr>
    </thead>
    <tbody>
      {#each [...items].reverse() as g (g.id)}
        <tr class:checkup-row={g.isCheckup}>
          <td>{g.date}</td>
          <td>
            {#if g.isCheckup}
              <span class="badge-checkup">🏥 검진 {g.examRound ?? ''}차</span>
              {#if g.examPlace}<div class="exam-place">{g.examPlace}</div>{/if}
            {:else}
              <span class="badge-measure">측정</span>
            {/if}
          </td>
          <td>{g.heightCm ?? '—'}</td>
          <td>{g.weightKg ?? '—'}</td>
          <td>{g.headCircCm ?? '—'}</td>
          <td>{g.note || ''}</td>
          <td>
            {#if g.assetIds.length > 0}
              {#each g.assetIds as id}
                <a href={`/photos/${id}`} target="_blank" rel="noopener" class="asset-link" title={id}>📎</a>
              {/each}
            {/if}
          </td>
          <td><button class="delete" onclick={() => remove(g.id)}>삭제</button></td>
        </tr>
      {/each}
    </tbody>
  </table>
</section>
</UserPageLayout>

<style>
  .header { display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem; }
  .form { display:grid; gap:.5rem; padding:1rem; border:1px solid #ddd; border-radius:.5rem; background:#fafafa; margin-bottom:1rem; }
  .form .row { display:flex; gap:.5rem; flex-wrap:wrap; }
  .form label { display:flex; flex-direction:column; flex:1; font-size:.85rem; color:#555; }
  .form input { padding:.5rem; border:1px solid #ccc; border-radius:.4rem; font-size:1rem; }
  button.primary { background:#4a8; color:white; border:none; padding:.5rem 1rem; border-radius:.4rem; cursor:pointer; }
  button.primary:hover { background:#3a7; }
  .chart { margin:1.5rem 0; padding:1rem; border:1px solid #eee; border-radius:.5rem; }
  .chips { display:flex; gap:.4rem; margin-bottom:.75rem; }
  .chips button { padding:.3rem .8rem; border:1px solid #ddd; background:white; border-radius:1rem; cursor:pointer; }
  .chips button.active { background:#4a8; color:white; border-color:#4a8; }
  .chart-svg { width:100%; max-width:600px; height:auto; }
  .legend { display:flex; gap:1rem; font-size:.85rem; margin-top:.5rem; }
  .table-wrap { margin-top:1.5rem; }
  table { width:100%; border-collapse:collapse; }
  th, td { padding:.5rem; border-bottom:1px solid #eee; text-align:left; }
  th { background:#f5f5f5; font-size:.85rem; }
  .delete { background:transparent; border:1px solid #d66; color:#d66; padding:.2rem .6rem; border-radius:.3rem; cursor:pointer; font-size:.8rem; }
  .muted { color:#888; }
  .empty { text-align:center; padding:1rem; }

  /* 영유아 검진 */
  .checkup-toggle { display:flex; align-items:center; gap:.4rem; font-size:.95rem; padding:.4rem .2rem; }
  .checkup-fields { display:grid; gap:.5rem; padding:.75rem; background:#fff8e8; border:1px dashed #e8b65b; border-radius:.5rem; }
  .checkup-fields .grow { flex:2; }
  .file-input { display:flex; flex-direction:column; gap:.3rem; font-size:.85rem; color:#555; }
  .file-input input[type="file"] { padding:.3rem; }
  .asset-list { display:flex; flex-wrap:wrap; gap:.4rem; }
  .asset-chip { background:white; border:1px solid #ddd; padding:.2rem .5rem; border-radius:1rem; font-size:.8rem; display:flex; align-items:center; gap:.3rem; }
  .asset-chip .x { background:transparent; border:none; cursor:pointer; color:#999; }
  .badge-checkup { background:#fff3cd; color:#8a6d3b; padding:.15rem .5rem; border-radius:.4rem; font-size:.8rem; font-weight:600; }
  .badge-measure { color:#888; font-size:.8rem; }
  .exam-place { color:#888; font-size:.75rem; margin-top:.15rem; }
  .checkup-row { background:#fffdf5; }
  .asset-link { text-decoration:none; margin-right:.2rem; }
</style>
