"""
使用方式：
  cd backend
  python scripts/create_admin.py --name "管理员" --email admin@company.com --password your_password
"""
import sys
import argparse
sys.path.insert(0, ".")
from app.database import SessionLocal
from app.models.user import User, UserRole
from app.models import project, task  # noqa: F401 - ensure all models are loaded
from app.services.auth_service import hash_password


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--name", required=True)
    parser.add_argument("--email", required=True)
    parser.add_argument("--password", required=True)
    args = parser.parse_args()

    db = SessionLocal()
    if db.query(User).filter(User.email == args.email).first():
        print(f"用户 {args.email} 已存在")
        return
    user = User(name=args.name, email=args.email,
                password_hash=hash_password(args.password), role=UserRole.admin)
    db.add(user)
    db.commit()
    print(f"管理员账号创建成功：{args.email}")


if __name__ == "__main__":
    main()
