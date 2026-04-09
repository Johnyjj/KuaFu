from io import BytesIO
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill
from sqlalchemy.orm import Session
from app.models.project import Project
from app.models.task import Task, TaskLog


def generate_excel(db: Session, project: Project) -> bytes:
    wb = Workbook()

    # Sheet 1: 项目信息
    ws1 = wb.active
    ws1.title = "项目概览"
    ws1.append(["项目名称", project.name])
    ws1.append(["状态", project.status.value])
    ws1.append(["创建时间", str(project.created_at)])

    tasks = db.query(Task).filter(Task.project_id == project.id).all()
    total = len(tasks)
    done = sum(1 for t in tasks if t.status.value == "done")
    ws1.append(["总任务数", total])
    ws1.append(["已完成", done])
    ws1.append(["完成率", f"{round(done/total*100)}%" if total else "0%"])

    # Sheet 2: 任务明细
    ws2 = wb.create_sheet("任务明细")
    headers = ["标题", "负责人", "状态", "优先级", "进度(%)", "截止日期", "最后更新"]
    ws2.append(headers)
    for cell in ws2[1]:
        cell.font = Font(bold=True, color="FFFFFF")
        cell.fill = PatternFill(fill_type="solid", fgColor="2563EB")

    for t in tasks:
        ws2.append([
            t.title,
            t.assignee.name if t.assignee else "-",
            t.status.value,
            t.priority.value,
            t.progress,
            str(t.due_date) if t.due_date else "-",
            str(t.updated_at)[:16],
        ])

    # Sheet 3: 进展日志
    ws3 = wb.create_sheet("进展日志")
    ws3.append(["任务", "记录人", "进度(%)", "状态", "内容", "时间"])
    for cell in ws3[1]:
        cell.font = Font(bold=True)

    for t in tasks:
        logs = db.query(TaskLog).filter(TaskLog.task_id == t.id).order_by(TaskLog.created_at).all()
        for log in logs:
            ws3.append([
                t.title,
                log.user.name,
                log.progress,
                log.status,
                log.content,
                str(log.created_at)[:16],
            ])

    buf = BytesIO()
    wb.save(buf)
    return buf.getvalue()
