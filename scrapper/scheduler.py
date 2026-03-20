from pipeline import run_pipeline
from apscheduler.schedulers.blocking import BlockingScheduler
import time
from datetime import datetime

def run_all_pipelines():
   for i in range(0,50) :
      print(f"\nRunning Pipeline for entity {i}")
      run_pipeline(i)
      time.sleep(5) # small pause between each entity, avoids hammering the API

scheduler = BlockingScheduler()
scheduler.add_job(run_all_pipelines, 'interval', max_instances=1, next_run_time=datetime.now(), hours=12)

# BlockingScheduler  — takes over the terminal, script stays running good for a dedicated script whose only job is scheduling
# BackgroundScheduler — runs in the background, your script continues good when you have a web server running alongside

# tell the scheduler: run this function every 12 hours
print(f"Scheduler Started Pipeline will run every 12 Hours")

# start it — this line blocks, the script stays alive
try:
   scheduler.start()
except KeyboardInterrupt:
   print("Scheduler stopped.")
