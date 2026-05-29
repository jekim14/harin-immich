<!-- 하린이 일기 × Immich fork — fork 상의 우리 변경 안내 -->

# Harin's Moments × Immich fork

이 저장소는 [Immich](https://github.com/immich-app/immich) 의 fork이며, **Harin's Moments** 도메인 모듈(일지/성장/건강/마일스톤/동영상)을 격리된 디렉터리에 추가한 상태입니다.

## 우리 변경의 위치

- `server/src/modules/harin/` — NestJS 도메인 모듈 (일지, 성장, 건강, 마일스톤)
- `web/src/routes/(harin)/` — SvelteKit 라우트 그룹

기존 Immich 파일 수정은 `server/src/app.module.ts` 의 import 한 줄 + ApiModule `imports` 배열에 `HarinModule` 추가만.

## 브랜치 전략

- `main` — upstream Immich `main` 추적
- `harin/main` — 우리 작업 브랜치 (현재 분기)

### upstream 머지 절차

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
git checkout harin/main
git rebase main
git push origin harin/main --force-with-lease
```

## 로컬 실행

```bash
# 처음 한 번
cp docker/example.env .env
# .env 편집 (UPLOAD_LOCATION, DB_DATA_LOCATION, DB_PASSWORD)

# 컨테이너 기동
docker compose -f docker/docker-compose.yml up -d

# 브라우저 접속
# http://localhost:2283
```

## 설계 문서

- spec: `f:\문서\Claude\harin's history\docs\superpowers\specs\2026-05-28-harin-immich-fork-design.md`
- Phase 0 plan: `f:\문서\Claude\harin's history\docs\superpowers\plans\2026-05-28-phase-0-immich-fork-bootstrap.md`
