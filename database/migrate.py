"""
SurgiGate Database Migration & Schema Management CLI
Usage:
    python database/migrate.py up           # Upgrade to latest migration (head)
    python database/migrate.py down         # Rollback one migration (-1)
    python database/migrate.py current      # Display current revision
    python database/migrate.py history      # Display migration history
    python database/migrate.py test-cycle   # Run full upgrade -> downgrade -> upgrade cycle test
"""

import sys
import os
from alembic.config import Config
from alembic import command

# Add workspace root to sys.path
BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if BASE_DIR not in sys.path:
    sys.path.insert(0, BASE_DIR)


def get_alembic_config() -> Config:
    ini_path = os.path.join(BASE_DIR, "alembic.ini")
    if not os.path.exists(ini_path):
        raise FileNotFoundError(f"Alembic configuration not found at: {ini_path}")
    alembic_cfg = Config(ini_path)
    return alembic_cfg


def upgrade_head():
    print("[SurgiGate Migration] Applying migrations to HEAD...")
    cfg = get_alembic_config()
    command.upgrade(cfg, "head")
    print("[SurgiGate Migration] Database upgraded successfully to HEAD.")


def downgrade_one():
    print("[SurgiGate Migration] Rolling back 1 migration step...")
    cfg = get_alembic_config()
    command.downgrade(cfg, "-1")
    print("[SurgiGate Migration] Rollback completed.")


def show_current():
    cfg = get_alembic_config()
    command.current(cfg)


def show_history():
    cfg = get_alembic_config()
    command.history(cfg)


def test_cycle():
    print("==================================================")
    print("Testing Full Migration Lifecycle (UP -> DOWN -> UP)")
    print("==================================================")
    cfg = get_alembic_config()
    
    print("\n[Step 1] Running upgrade to HEAD...")
    command.upgrade(cfg, "head")
    print("[OK] Upgrade to HEAD succeeded.")
    
    print("\n[Step 2] Running downgrade to base...")
    command.downgrade(cfg, "base")
    print("[OK] Downgrade to base succeeded.")
    
    print("\n[Step 3] Re-applying upgrade to HEAD...")
    command.upgrade(cfg, "head")
    print("[OK] Re-upgrade to HEAD succeeded.")
    print("\n[SUCCESS] Full migration lifecycle validated without errors!\n")


if __name__ == "__main__":
    action = sys.argv[1] if len(sys.argv) > 1 else "up"
    if action == "up":
        upgrade_head()
    elif action == "down":
        downgrade_one()
    elif action == "current":
        show_current()
    elif action == "history":
        show_history()
    elif action == "test-cycle":
        test_cycle()
    else:
        print(f"Unknown command '{action}'. Available: up, down, current, history, test-cycle")
        sys.exit(1)
