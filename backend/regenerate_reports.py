from pathlib import Path
import sys

ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(ROOT))

from app.db.session import SessionLocal
from app.models.entities import TestRun
from app.reports.generator import generate_reports


def main() -> None:
    db = SessionLocal()
    try:
        tests = db.query(TestRun).order_by(TestRun.created_at).all()
        total = len(tests)
        print(f"Found {total} test runs. Regenerating reports...")

        updated = 0
        for index, test in enumerate(tests, start=1):
            print(f"[{index}/{total}] Regenerating report for test {test.id} ({test.target_model})")
            pdf_path, docx_path = generate_reports(test)
            if test.details is None:
                print("  Warning: test details missing; report generated with empty findings.")
            updated += 1

        print(f"Done. Regenerated {updated} reports.")
    finally:
        db.close()


if __name__ == "__main__":
    main()
