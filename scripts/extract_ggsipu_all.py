import pdfplumber
import re
import json

pdf_file = "round1ggsipu.pdf"
data = []

pattern = r'Min\s+Rank\s*-\s*(\d+)(?:\([^)]*\))?\s+Max\s+Rank\s*-\s*(\d+)(?:\([^)]*\))?'

with pdfplumber.open(pdf_file) as pdf:
    for idx, page in enumerate(pdf.pages):
        tables = page.extract_tables()
        print(f"Page {idx} - Found tables: {len(tables)}")
        for t_idx, table in enumerate(tables):
            if not table:
                continue
            headers = table[0]
            # Verify headers contain Sl.No., Institute, Course
            if "Sl.No." not in headers or "Institute" not in headers:
                print(f"Skipping table on page {idx} as it lacks standard headers. Headers found: {headers[:5]}")
                continue
            
            for r_idx, row in enumerate(table[1:]):
                if len(row) < 3 or not row[0]:
                    continue # Skip empty or invalid rows
                
                sl_no = row[0].strip()
                if not sl_no.isdigit():
                    continue # Skip sub-headers or other text
                
                inst_name = row[1].strip().replace('\n', ' ')
                course = row[2].strip().replace('\n', ' ')
                
                # Check for category cutoffs in subsequent columns
                for col_idx in range(3, len(row)):
                    if col_idx >= len(headers):
                        break
                    cell_val = row[col_idx]
                    if cell_val and cell_val.strip():
                        cell_clean = cell_val.replace('\n', ' ')
                        match = re.search(pattern, cell_clean, re.IGNORECASE)
                        if match:
                            opening = match.group(1)
                            closing = match.group(2)
                            cat = headers[col_idx]
                            
                            # Determine Quota from Category Suffix
                            if cat.endswith("HS"):
                                quota = "HS"
                            elif cat.endswith("OS"):
                                quota = "OS"
                            elif cat.endswith("AI"):
                                quota = "AI"
                            else:
                                quota = "AI"
                                
                            data.append({
                                "institute": inst_name,
                                "type": "GGSIPU",
                                "program": course,
                                "quota": quota,
                                "seat_type": cat,
                                "gender": "Gender-Neutral",
                                "opening_rank": opening,
                                "closing_rank": closing,
                                "source": "GGSIPU",
                                "round": "1"
                            })

print(f"\nTotal extracted GGSIPU round 1 rows: {len(data)}")
if data:
    print("Sample entry:", json.dumps(data[0], indent=2))
