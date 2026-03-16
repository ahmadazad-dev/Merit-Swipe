import json
import os
import pandas as pd

def load_data(filepath):
   
   if not os.path.exists(filepath):
      print(f"Error Opening path '{filepath}' not found")
      return None
   
   try:      
      with open(filepath, 'r', encoding='utf-8') as file:
         data = json.load(file)
         return data
   except Exception as e:
      print(f"Error: {e}")

deals_data = load_data('deals_2.json')

if deals_data is not None:
   df = pd.DataFrame(deals_data)
   print(df.columns)