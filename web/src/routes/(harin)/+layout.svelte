<!-- 하린이 도메인 페이지 공통 레이아웃 — Phase 0 골격 -->
<script lang="ts">
  // Phase 1에서 사이드바/네비 통합
  interface Props {
    children?: import('svelte').Snippet;
  }
  let { children }: Props = $props();
</script>

<div class="harin-shell">
  {@render children?.()}
</div>

<style>
  .harin-shell {
    padding: 1.5rem;
    max-width: 1100px;
    margin: 0 auto;
  }
</style>
