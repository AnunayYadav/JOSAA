import json
import re
import os
import glob

def clean_rank(rank_str):
    rank_str = rank_str.strip()
    if rank_str.endswith('.00'):
        return rank_str[:-3]
    if rank_str.endswith('.0'):
        return rank_str[:-2]
    return rank_str

def parse_jac_chandigarh_data(file_path):
    print(f"Parsing {os.path.basename(file_path)}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        try:
            with open(file_path, 'r', encoding='utf-16') as f:
                content = f.read()
        except:
             with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()

    lines = content.split('\n')
    data = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split('\t')
        if len(parts) < 8:
            continue
            
        sr_no = parts[0].strip()
        if not sr_no.isdigit():
            continue
            
        round_raw = parts[1].strip()
        if "Round" in round_raw:
            round_match = re.search(r'Round\s+(\d+)', round_raw)
            if round_match:
                round_num = round_match.group(1)
            elif "First SPOT" in round_raw or "1st SPOT" in round_raw:
                round_num = "SPOT 1"
            elif "Second SPOT" in round_raw or "2nd SPOT" in round_raw:
                round_num = "SPOT 2"
            else:
                round_num = round_raw
        else:
            round_num = round_raw

        inst_name = parts[2].strip()
        program = parts[3].strip()
        quota_raw = parts[4].strip()
        
        if quota_raw == "All India":
            quota = "AI"
        elif quota_raw == "Home State":
            quota = "HS"
        elif quota_raw == "Other State":
            quota = "OS"
        else:
            quota = quota_raw
            
        seat_type = parts[5].strip()
        gender = "Gender-Neutral"
        opening_rank = clean_rank(parts[6])
        closing_rank = clean_rank(parts[7])
        
        entry = {
            "institute": inst_name,
            "type": "JAC",
            "program": program,
            "quota": quota,
            "seat_type": seat_type,
            "gender": gender,
            "opening_rank": opening_rank,
            "closing_rank": closing_rank,
            "source": "JAC",
            "round": round_num
        }
        data.append(entry)
        
    return data

def parse_uptac_data(file_path):
    print(f"Parsing {os.path.basename(file_path)}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        try:
            with open(file_path, 'r', encoding='utf-16') as f:
                content = f.read()
        except:
             with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()

    lines = content.split('\n')
    data = []
    
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split('\t')
        if len(parts) < 10:
            continue
            
        sr_no = parts[0].strip()
        if not sr_no.isdigit():
            continue
            
        round_raw = parts[1].strip()
        if "Round" in round_raw:
            round_match = re.search(r'Round\s+(\d+)', round_raw)
            if round_match:
                round_num = round_match.group(1)
            else:
                round_num = round_raw
        else:
            round_num = round_raw

        inst_name = parts[2].strip()
        program = parts[3].strip()
        quota_raw = parts[5].strip()
        
        if quota_raw == "All India":
            quota = "AI"
        elif quota_raw == "Home State":
            quota = "HS"
        elif quota_raw == "Other State":
            quota = "OS"
        else:
            quota = quota_raw
            
        seat_type = parts[6].strip()
        gender_raw = parts[7].strip()
        if "Both Male" in gender_raw:
            gender = "Gender-Neutral"
        elif "Female" in gender_raw:
            gender = "Female-only"
        else:
            gender = gender_raw
            
        opening_rank = clean_rank(parts[8])
        closing_rank = clean_rank(parts[9])
        
        entry = {
            "institute": inst_name,
            "type": "UPTAC",
            "program": program,
            "quota": quota,
            "seat_type": seat_type,
            "gender": gender,
            "opening_rank": opening_rank,
            "closing_rank": closing_rank,
            "source": "UPTAC",
            "round": round_num
        }
        data.append(entry)
        
    return data

def parse_josaa_data(file_path):
    print(f"Parsing {os.path.basename(file_path)}...")
    # Using utf-16 or utf-8 based on typical text extracts, but trial and error
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        try:
            with open(file_path, 'r', encoding='utf-16') as f:
                content = f.read()
        except:
             with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()

    lines = content.split('\n')
    data = []
    header_found = False
    source = "JOSAA"
    round_num = "6"  # Default
    
    file_name_lower = os.path.basename(file_path).lower()
    if "csab" in file_name_lower:
        source = "CSAB"
        # Extract round number if present (e.g. csab1.txt -> Round 1)
        match = re.search(r'csab(\d+)', file_name_lower)
        if match:
            round_num = match.group(1)
        else:
            round_num = "Special"
    else:
        # Check for JoSAA round in filename (e.g. data1.txt, round2.txt)
        match = re.search(r'(?:round|data)(\d+)', file_name_lower)
        if match:
            round_num = match.group(1)
        elif "data6" in file_name_lower or file_name_lower == "data.txt":
            round_num = "6"

    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        if "Institute" in line and "Academic Program Name" in line:
            header_found = True
            continue
            
        if header_found:
            parts = line.split('\t')
            if len(parts) < 7:
                parts = re.split(r' {2,}', line)
            
            if len(parts) >= 7:
                inst_name = parts[0].strip()
                inst_type = "GFTI"
                if "Indian Institute of Technology" in inst_name:
                    inst_type = "IIT"
                elif "National Institute of Technology" in inst_name or "NIT" in inst_name:
                    inst_type = "NIT"
                elif "Indian Institute of Information Technology" in inst_name:
                    inst_type = "IIIT"
                elif "IIEST" in inst_name:
                    inst_type = "IIEST"
                elif "School of Planning and Architecture" in inst_name or "SPA" in inst_name:
                    inst_type = "SPA"

                entry = {
                    "institute": inst_name,
                    "type": inst_type,
                    "program": parts[1].strip(),
                    "quota": parts[2].strip(),
                    "seat_type": parts[3].strip(),
                    "gender": parts[4].strip(),
                    "opening_rank": parts[5].strip(),
                    "closing_rank": parts[6].strip(),
                    "source": source,
                    "round": round_num
                }
                data.append(entry)
    
    return data

def parse_ggsipu_pdf_data(file_path):
    # This function is kept for reference or direct pdf parsing if needed,
    # but the primary data source is now the extracted .txt file.
    import pdfplumber
    print(f"Parsing PDF {os.path.basename(file_path)}...")
    data = []
    pattern = r'Min\s+Rank\s*-\s*(\d+)(?:\([^)]*\))?\s+Max\s+Rank\s*-\s*(\d+)(?:\([^)]*\))?'
    
    round_num = "1"
    file_name_lower = os.path.basename(file_path).lower()
    round_match = re.search(r'round(\d+)', file_name_lower)
    if round_match:
        round_num = round_match.group(1)
        
    try:
        with pdfplumber.open(file_path) as pdf:
            for idx, page in enumerate(pdf.pages):
                tables = page.extract_tables()
                for t_idx, table in enumerate(tables):
                    if not table:
                        continue
                    
                    headers = None
                    header_row_idx = -1
                    for r_idx, row in enumerate(table):
                        if row and any(cell and "Sl.No." in cell for cell in row) and any(cell and "Institute" in cell for cell in row):
                            headers = [cell.strip().replace('\n', ' ') if cell else '' for cell in row]
                            header_row_idx = r_idx
                            break
                            
                    if headers is None:
                        continue
                    
                    for r_idx, row in enumerate(table[header_row_idx + 1:]):
                        if len(row) < 3 or not row[0]:
                            continue
                        
                        sl_no = row[0].strip()
                        if not sl_no.isdigit():
                            continue
                        
                        # Skip duplicate header rows 1-9 on subsequent pages
                        if idx > 0 and 1 <= int(sl_no) <= 9:
                            continue
                        
                        inst_name = row[1].strip().replace('\n', ' ')
                        course = row[2].strip().replace('\n', ' ')
                        
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
                                        "round": round_num
                                    })
    except Exception as e:
        print(f"Error parsing {file_path}: {e}")
        
    return data

def parse_ggsipu_txt_data(file_path):
    print(f"Parsing {os.path.basename(file_path)}...")
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        try:
            with open(file_path, 'r', encoding='utf-16') as f:
                content = f.read()
        except:
             with open(file_path, 'r', encoding='latin-1') as f:
                content = f.read()

    lines = content.split('\n')
    data = []
    
    round_num = "1"
    file_name_lower = os.path.basename(file_path).lower()
    round_match = re.search(r'ggsipu.*?(\d+)', file_name_lower)
    if round_match:
        round_num = round_match.group(1)
        
    for line in lines:
        line = line.strip()
        if not line:
            continue
            
        parts = line.split('\t')
        if len(parts) < 8:
            continue
            
        sr_no = parts[0].strip()
        if not sr_no.isdigit():
            continue
            
        round_val = parts[1].strip()
        round_val_match = re.search(r'Round\s+(\d+)', round_val, re.IGNORECASE)
        if round_val_match:
            r_num = round_val_match.group(1)
        else:
            r_num = round_num

        inst_name = parts[2].strip()
        program = parts[3].strip()
        quota_raw = parts[4].strip()
        
        if quota_raw == "All India":
            quota = "AI"
        elif quota_raw == "Home State":
            quota = "HS"
        elif quota_raw == "Other State":
            quota = "OS"
        else:
            quota = quota_raw
            
        seat_type = parts[5].strip()
        gender = "Gender-Neutral"
        opening_rank = clean_rank(parts[6])
        closing_rank = clean_rank(parts[7])
        
        entry = {
            "institute": inst_name,
            "type": "GGSIPU",
            "program": program,
            "quota": quota,
            "seat_type": seat_type,
            "gender": gender,
            "opening_rank": opening_rank,
            "closing_rank": closing_rank,
            "source": "GGSIPU",
            "round": r_num
        }
        data.append(entry)
        
    return data

if __name__ == "__main__":
    # Determine base root directory dynamically relative to this script's location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(script_dir) # Root JOSAA folder
    
    data_dir = os.path.join(base_dir, "data")
    txt_files = glob.glob(os.path.join(data_dir, "*.txt"))
    pdf_files = glob.glob(os.path.join(base_dir, "*.pdf"))
    
    all_results = []
    for txt_file in txt_files:
        file_name_lower = os.path.basename(txt_file).lower()
        if "jac_chandigarh" in file_name_lower:
            all_results.extend(parse_jac_chandigarh_data(txt_file))
        elif "uptac" in file_name_lower:
            all_results.extend(parse_uptac_data(txt_file))
        elif "ggsipu" in file_name_lower:
            all_results.extend(parse_ggsipu_txt_data(txt_file))
        else:
            all_results.extend(parse_josaa_data(txt_file))

    # We do not process pdf_files anymore for GGSIPU since txt files are used instead.
    
    output_js_path = os.path.join(base_dir, 'data.js')
    with open(output_js_path, 'w', encoding='utf-8') as f:
        f.write("window.JOSAA_DATA = ")
        json.dump(all_results, f, indent=2)
        f.write(";")
    
    print(f"\nFinal Statistics:")
    print(f"Total txt files processed: {len(txt_files)}")
    print(f"Total pdf files processed: {len(pdf_files)}")
    print(f"Total entries parsed: {len(all_results)}")
    print(f"Data saved to {output_js_path}")
