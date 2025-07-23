#!/bin/bash

# 🔮 InnerSpell 블로그 개발 백업 시스템
# 언제든지 안전하게 롤백할 수 있도록 백업 관리

BACKUP_DIR="/tmp/innerspell-backups"
PROJECT_DIR="/mnt/e/project/test-studio-firebase"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# 백업 디렉토리 생성
mkdir -p "$BACKUP_DIR"

# 현재 상태 백업 함수
backup_current_state() {
    local backup_name="$1"
    local backup_path="$BACKUP_DIR/${backup_name}_${TIMESTAMP}"
    
    echo "🔄 백업 생성 중: $backup_name"
    
    # 프로젝트 전체 백업 (node_modules 제외)
    rsync -av --exclude='node_modules' --exclude='.next' --exclude='dist' \
          "$PROJECT_DIR/" "$backup_path/"
    
    # 깃 상태 정보 저장
    cd "$PROJECT_DIR"
    git branch > "$backup_path/git_branch.txt"
    git status > "$backup_path/git_status.txt"
    git log --oneline -10 > "$backup_path/git_log.txt"
    
    echo "✅ 백업 완료: $backup_path"
    echo "$backup_path" > "$BACKUP_DIR/latest_backup.txt"
}

# 백업에서 복원 함수
restore_from_backup() {
    local backup_path="$1"
    
    if [ ! -d "$backup_path" ]; then
        echo "❌ 백업 디렉토리를 찾을 수 없습니다: $backup_path"
        return 1
    fi
    
    echo "🔄 복원 중: $backup_path"
    
    # 현재 상태를 임시 백업
    backup_current_state "before_restore"
    
    # 백업에서 복원 (node_modules 제외)
    rsync -av --exclude='node_modules' --exclude='.next' --exclude='dist' \
          "$backup_path/" "$PROJECT_DIR/"
    
    cd "$PROJECT_DIR"
    
    # 패키지 재설치
    echo "📦 패키지 재설치 중..."
    npm install
    
    echo "✅ 복원 완료"
}

# 백업 목록 출력
list_backups() {
    echo "📋 사용 가능한 백업 목록:"
    ls -la "$BACKUP_DIR" | grep -E "^d" | grep -v "^d.*\.$"
}

# 최신 백업 정보
get_latest_backup() {
    if [ -f "$BACKUP_DIR/latest_backup.txt" ]; then
        cat "$BACKUP_DIR/latest_backup.txt"
    else
        echo "백업이 없습니다."
    fi
}

# 빠른 롤백 (최신 백업으로)
quick_rollback() {
    local latest_backup=$(get_latest_backup)
    if [ "$latest_backup" != "백업이 없습니다." ]; then
        restore_from_backup "$latest_backup"
    else
        echo "❌ 롤백할 백업이 없습니다."
    fi
}

# 메인 로직
case "$1" in
    "backup")
        backup_current_state "${2:-manual_backup}"
        ;;
    "restore")
        restore_from_backup "$2"
        ;;
    "list")
        list_backups
        ;;
    "latest")
        get_latest_backup
        ;;
    "rollback")
        quick_rollback
        ;;
    *)
        echo "사용법: $0 {backup|restore|list|latest|rollback} [옵션]"
        echo ""
        echo "명령어:"
        echo "  backup [이름]     - 현재 상태 백업"
        echo "  restore [경로]    - 백업에서 복원"
        echo "  list             - 백업 목록 출력"
        echo "  latest           - 최신 백업 경로 출력"
        echo "  rollback         - 최신 백업으로 빠른 롤백"
        echo ""
        echo "예시:"
        echo "  $0 backup blog_dev_start"
        echo "  $0 rollback"
        ;;
esac