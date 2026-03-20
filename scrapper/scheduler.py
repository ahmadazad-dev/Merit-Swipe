from pipeline import run_pipeline
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.events import EVENT_JOB_MISSED, EVENT_JOB_ERROR
from datetime import datetime
import time

_entity_ids = list(range(0, 50))

def _run_all():
    for _eid in _entity_ids:
        print(f"RUnning for the id {_eid}")
        run_pipeline(_eid)
        time.sleep(5)

def _job_listener(_event):
    if _event.code == EVENT_JOB_MISSED:
        print(f"Job missed at {_event.scheduled_run_time} — previous run still in progress")
    elif _event.code == EVENT_JOB_ERROR:
        print(f"Job failed: {_event.exception}")

_scheduler = BlockingScheduler()
_scheduler.add_job(_run_all, 'interval', max_instances=1, next_run_time=datetime.now(), hours=12)
_scheduler.add_listener(_job_listener, EVENT_JOB_MISSED | EVENT_JOB_ERROR)

print("Scheduler started — running every 12 hours")

try:
    _scheduler.start()
except KeyboardInterrupt:
    print("Scheduler stopped.")