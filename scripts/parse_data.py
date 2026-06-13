import json
import re
import os
import glob
import math

def clean_rank(rank_str):
    rank_str = rank_str.strip()
    if rank_str.endswith('.00'):
        return rank_str[:-3]
    if rank_str.endswith('.0'):
        return rank_str[:-2]
    return rank_str

def normalize_quota(q_str):
    q_str = q_str.strip()
    q_lower = q_str.lower()
    if "all india" in q_lower or q_lower == "ai":
        return "AI"
    if "home state" in q_lower or q_lower == "hs":
        if "goa" in q_lower:
            return "GO"
        return "HS"
    if "other state" in q_lower or q_lower == "os":
        return "OS"
    if "jammu" in q_lower or q_lower == "jk":
        return "JK"
    if "ladakh" in q_lower or q_lower == "la":
        return "LA"
    if q_lower == "goa" or q_lower == "go":
        return "GO"
    return q_str

def normalize_seat_type(s_str):
    s_str = s_str.strip()
    s_upper = s_str.upper()
    if s_upper in ["OPEN", "GEN"]:
        return "OPEN"
    if s_upper in ["OPEN (PWD)", "OPEN(PWD)", "GEN (PWD)", "GEN(PWD)"]:
        return "OPEN (PwD)"
    if s_upper in ["EWS", "GEN-EWS", "GEN_EWS"]:
        return "EWS"
    if s_upper in ["EWS (PWD)", "EWS(PWD)", "GEN-EWS (PWD)", "GEN-EWS(PWD)"]:
        return "EWS (PwD)"
    if s_upper in ["OBC", "OBC-NCL", "OBC_NCL"]:
        return "OBC-NCL"
    if s_upper in ["OBC (PWD)", "OBC(PWD)", "OBC-NCL (PWD)", "OBC-NCL(PWD)"]:
        return "OBC-NCL (PwD)"
    if s_upper == "SC":
        return "SC"
    if s_upper in ["SC (PWD)", "SC(PWD)"]:
        return "SC (PwD)"
    if s_upper == "ST":
        return "ST"
    if s_upper in ["ST (PWD)", "ST(PWD)"]:
        return "ST (PwD)"
    return s_str

def normalize_gender(g_str):
    g_str = g_str.strip()
    g_lower = g_str.lower()
    if "female" in g_lower:
        return "Female-only (including Supernumerary)"
    if "neutral" in g_lower:
        return "Gender-Neutral"
    return g_str

def normalize_program_name(p_str):
    p_str = p_str.strip()
    p_str = p_str.replace(" & ", " and ")
    return p_str

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
            "round": round_num,
            "year": "2025"
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
            "round": round_num,
            "year": "2025"
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
    
    # Extract year if present (4 digits, e.g. 2022, 2023, 2024, 2025)
    year_match = re.search(r'(?:20\d{2})', file_name_lower)
    if year_match:
        year = year_match.group(0)
    else:
        year = "2025"  # Default
        
    if "csab" in file_name_lower:
        source = "CSAB"
        # Extract round number: e.g. csab2022_1.txt -> 1; csab1.txt -> 1
        match = re.search(r'csab(?:20\d{2})?_?(\d+)', file_name_lower)
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
                    "program": normalize_program_name(parts[1].strip()),
                    "quota": normalize_quota(parts[2].strip()),
                    "seat_type": normalize_seat_type(parts[3].strip()),
                    "gender": normalize_gender(parts[4].strip()),
                    "opening_rank": parts[5].strip(),
                    "closing_rank": parts[6].strip(),
                    "source": source,
                    "round": round_num,
                    "year": year
                }
                data.append(entry)
    
    return data

def parse_ggsipu_pdf_data(file_path):
    # This function is kept for reference or direct pdf parsing if needed,
    # but the primary data source is now the extracted .txt file.
    try:
        import pdfplumber
    except ImportError:
        print("Error: pdfplumber module not found. Please install it using 'pip install pdfplumber' to parse PDFs.")
        return []
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
                                        "round": round_num,
                                        "year": "2025"
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
            "round": r_num,
            "year": "2025"
        }
        data.append(entry)
        
    return data

# Helper to tokenize rows grouping priority markers e.g. 73137 (VI) -> "73137 (VI)"
def tokenize_row(line):
    tokens = line.split()
    merged = []
    for tok in tokens:
        if tok.startswith('(') and tok.endswith(')') and merged:
            merged[-1] += " " + tok
        elif tok == '-' or (tok.startswith('(') and merged):
            if tok.startswith('('):
                merged[-1] += " " + tok
            else:
                merged.append(tok)
        else:
            merged.append(tok)
    return merged

# ----------------- DTU / NSUT PARSER -----------------
categories_delhi = ["GNGND", "GNGLD", "EWGND", "EWGLD", "OBGND", "OBGLD", "SCGND", "SCGLD", "STGND", "STGLD", "GNSGD", "GNPDD", "EWPDD", "OBPDD", "SCPDD", "STPDD"]
categories_outside = ["GNGNO", "GNGLO", "EWGNO", "EWGLO", "OBGNO", "OBGLO", "SCGNO", "SCGLO", "STGNO", "STGLO", "GNPDO", "EWPDO", "OBPDO", "SCPDO"]

categories_cw_delhi = ["GNCWD", "EWCWD", "OBCWD", "SCCWD", "STCWD"]
categories_cw_outside = ["GNCWO", "EWCWO", "OBCWO", "SCCWO", "STCWO"]

def align_dtu_nsut_row(row_ranks, is_delhi, is_defence, medians):
    if is_defence:
        cats = categories_cw_delhi if is_delhi else categories_cw_outside
    else:
        cats = categories_delhi if is_delhi else categories_outside
        
    vals = row_ranks
    
    def get_valid_indices(val_idx, cat_idx, current):
        if val_idx == len(vals):
            mapping = {cats[current[i]]: vals[i] for i in range(len(vals)) if vals[i] is not None}
            if not is_defence:
                if "GNGND" not in mapping and "GNGNO" not in mapping:
                    return []
                neutral = [c for c in ["GNGND", "EWGND", "OBGND", "SCGND", "STGND", "GNGNO", "EWGNO", "OBGNO", "SCGNO", "STGNO"] if c in mapping]
                if any(mapping[neutral[i]] > mapping[neutral[i+1]] for i in range(len(neutral)-1)):
                    return []
                female = [c for c in ["GNGLD", "EWGLD", "OBGLD", "SCGLD", "STGLD", "GNGLO", "EWGLO", "OBGLO", "SCGLO", "STGLO"] if c in mapping]
                if any(mapping[female[i]] > mapping[female[i+1]] for i in range(len(female)-1)):
                    return []
                pairs = [("GNGND", "GNGLD"), ("EWGND", "EWGLD"), ("OBGND", "OBGLD"), ("SCGND", "SCGLD"), ("STGND", "STGLD"),
                         ("GNGNO", "GNGLO"), ("EWGNO", "EWGLO"), ("OBGNO", "OBGLO"), ("SCGNO", "SCGLO"), ("STGNO", "STGLO")]
                for n, f in pairs:
                    if n in mapping and f in mapping and mapping[n] > mapping[f] * 1.15:
                        return []
                    if f in mapping and n not in mapping:
                        return []
            else:
                def_cats = [c for c in ["GNCWD", "EWCWD", "OBCWD", "SCCWD", "STCWD", "GNCWO", "EWCWO", "OBCWO", "SCCWO", "STCWO"] if c in mapping]
                if any(mapping[def_cats[i]] > mapping[def_cats[i+1]] for i in range(len(def_cats)-1)):
                    return []
            return [current[:]]
            
        res = []
        for c in range(cat_idx, len(cats)):
            current.append(c)
            res.extend(get_valid_indices(val_idx + 1, c + 1, current))
            current.pop()
        return res

    candidates = get_valid_indices(0, 0, [])
    if not candidates:
        return {cats[i]: vals[i] for i in range(min(len(vals), len(cats)))}
        
    best_candidate = None
    best_score = float('inf')
    for cand in candidates:
        score = 0
        for i, cat_idx in enumerate(cand):
            val = vals[i]
            if val is not None:
                cat_name = cats[cat_idx]
                ref_val = medians.get(cat_name, 50000)
                score += (math.log(val) - math.log(ref_val)) ** 2
        if score < best_score:
            best_score = score
            best_candidate = cand
            
    return {cats[best_candidate[i]]: vals[i] for i in range(len(vals))}

nsut_branch_mappings = {
    "CSAI": "Computer Science and Engineering (Artificial Intelligence)",
    "CSE": "Computer Science and Engineering",
    "CSDS": "Computer Science and Engineering (Data Science)",
    "IT": "Information Technology",
    "ITNS": "Information Technology (Network and Information Security)",
    "MAC": "Mathematics and Computing",
    "ECE": "Electronics and Communication Engineering",
    "EVDT": "Electronics Engineering (VLSI Design and Technology)",
    "EE": "Electrical Engineering",
    "ICE": "Instrumentation and Control Engineering",
    "ME": "Mechanical Engineering",
    "BT": "Bio-Technology",
    "CSDA*": "Computer Science and Engineering (Big Data Analytics) [East Campus]",
    "CIOT*": "Computer Science and Engineering (Internet of Things) [East Campus]",
    "ECAM*": "Electronics and Communication Engineering (Artificial Intelligence and Machine Learning) [East Campus]",
    "MEEV**": "Mechanical Engineering (Electric Vehicles) [West Campus]",
    "CE**": "Civil Engineering [West Campus]",
    "GI**": "Geoinformatics [West Campus]",
    "B.Arch.**": "Bachelor of Architecture [West Campus]"
}

def parse_dtu_nsut(sec_name, sec_lines, inst_name):
    is_nsut = "NSUT" in inst_name
    round_match = re.search(r'Round\s*(\d+)', sec_name, re.I)
    round_num = round_match.group(1) if round_match else "5"
    
    parsed_entries = []
    region = "DELHI"
    quota = "HS"
    is_defence = False
    is_km = False
    
    branch_rows = []
    curr_s_no = None
    curr_branch_text = ""
    
    for line in sec_lines:
        line_str = line.strip()
        if not line_str:
            continue
            
        if "DELHI REGION" in line_str:
            region = "DELHI"
            quota = "HS"
            is_defence = False
            is_km = False
            continue
        elif "OUTSIDE DELHI REGION" in line_str:
            region = "OUTSIDE"
            quota = "OS"
            is_defence = False
            is_km = False
            continue
        elif "Defense (CW)" in line_str or "Defense" in line_str or "Delhi CW" in line_str or "Outside Delhi-CW" in line_str:
            is_defence = True
            is_km = False
            continue
        elif "Kashmiri Migrants" in line_str or "Kashmiri Migrant" in line_str:
            is_km = True
            is_defence = False
            continue
            
        if is_nsut:
            match_sno = re.match(r'^([A-Z\*a-z\-\.\/2]+)(?:\s+(.*))?$', line_str)
            if match_sno:
                code = match_sno.group(1)
                is_valid_code = code in nsut_branch_mappings or any(code.startswith(x) for x in ["CS", "IT", "MA", "EC", "EV", "EE", "IC", "ME", "BT", "CE", "GI", "B.Arch"])
                if is_valid_code and code not in ["Category", "Branch", "NETAJI", "Sector-3", "B.TECH.", "Modified"]:
                    curr_s_no = code
                    curr_branch_text = match_sno.group(2) or ""
                else:
                    match_sno = None
        else:
            match_sno = re.match(r'^(\d+)(?:\s+(.*))?$', line_str)
            if match_sno:
                curr_s_no = match_sno.group(1)
                curr_branch_text = match_sno.group(2) or ""
                
        if not match_sno and curr_s_no is not None:
            curr_branch_text += " " + line_str
                
        if curr_s_no is not None:
            tokens = curr_branch_text.split()
            if tokens:
                last_tok = tokens[-1]
                is_rank = last_tok.isdigit() or last_tok == '-' or (last_tok.endswith(')') and len(tokens) >= 2 and tokens[-2].isdigit())
                if is_rank:
                    branch_rows.append({
                        "s_no": curr_s_no,
                        "branch_line": curr_branch_text,
                        "region": region,
                        "quota": quota,
                        "is_defence": is_defence,
                        "is_km": is_km
                    })
                    curr_s_no = None
                    curr_branch_text = ""
                    
    delhi_medians = {
        "GNGND": 30000, "GNGLD": 40000, "EWGND": 60000, "EWGLD": 80000,
        "OBGND": 100000, "OBGLD": 150000, "SCGND": 250000, "SCGLD": 300000,
        "STGND": 600000, "STGLD": 700000, "GNSGD": 50000, "GNPDD": 300000,
        "EWPDD": 400000, "OBPDD": 500000, "SCPDD": 600000, "STPDD": 800000
    }
    outside_medians = {
        "GNGNO": 10000, "GNGLO": 15000, "EWGNO": 20000, "EWGLO": 25000,
        "OBGNO": 35000, "OBGLO": 45000, "SCGNO": 100000, "SCGLO": 120000,
        "STGNO": 200000, "STGLO": 250000, "GNPDO": 150000, "EWPDO": 200000,
        "OBPDO": 300000, "SCPDO": 400000
    }
    
    for row in branch_rows:
        tokens = row["branch_line"].split()
        rank_start = len(tokens)
        for i in range(len(tokens)-1, -1, -1):
            tok = tokens[i]
            is_rank = tok.isdigit() or tok == '-' or (tok.endswith(')') and i > 0 and tokens[i-1].isdigit())
            if is_rank:
                rank_start = i
            else:
                break
                
        if is_nsut:
            branch_code = row["s_no"]
            branch_name = nsut_branch_mappings.get(branch_code, branch_code)
            raw_ranks = tokens
        else:
            branch_name = " ".join(tokens[:rank_start]).strip()
            raw_ranks = tokens[rank_start:]
        
        cleaned_ranks = []
        for r in raw_ranks:
            if r.isdigit() or r == '-':
                cleaned_ranks.append(r)
            elif r.endswith(')') and len(cleaned_ranks) > 0:
                pass
                
        ranks = [int(x) if x.isdigit() else None for x in cleaned_ranks]
        
        if row["is_km"]:
            for val in ranks:
                if val is not None:
                    parsed_entries.append({
                        "institute": inst_name,
                        "type": "JACD",
                        "program": branch_name,
                        "quota": "AI",
                        "seat_type": "KM",
                        "gender": "Gender-Neutral",
                        "opening_rank": str(val),
                        "closing_rank": str(val),
                        "source": "JAC_DELHI",
                        "round": round_num,
                        "year": "2025"
                    })
            continue
            
        is_delhi = (row["region"] == "DELHI")
        medians = delhi_medians if is_delhi else outside_medians
        aligned = align_dtu_nsut_row(ranks, is_delhi, row["is_defence"], medians)
        
        for cat, val in aligned.items():
            if val is not None:
                gender = "Female-only" if ("GLD" in cat or "GLO" in cat) else "Gender-Neutral"
                parsed_entries.append({
                    "institute": inst_name,
                    "type": "JACD",
                    "program": branch_name,
                    "quota": row["quota"],
                    "seat_type": cat,
                    "gender": gender,
                    "opening_rank": str(val),
                    "closing_rank": str(val),
                    "source": "JAC_DELHI",
                    "round": round_num,
                    "year": "2025"
                })
                
    return parsed_entries

# ----------------- IGDTUW PARSER -----------------
def parse_igdtuw(sec_name, sec_lines):
    round_match = re.search(r'Round\s*(\d+)', sec_name, re.I)
    round_num = round_match.group(1) if round_match else "5"
    
    parsed_entries = []
    quota = "HS"
    branches = []
    
    for line in sec_lines:
        line_str = line.strip()
        if not line_str:
            continue
            
        if "Delhi Region" in line_str:
            quota = "HS"
            continue
        elif "Out Side Delhi Region" in line_str or "Outside Delhi Region" in line_str:
            quota = "OS"
            continue
            
        tokens = line_str.split()
        if len(tokens) >= 5 and all(t in ["CSE-AI", "CSE", "ECE-AI", "ECE", "IT", "AIML", "MAE", "DMAM", "MAC", "B.Arch", "B.Arch(Paper 2)", "B.Arch(Paper-2)", "(Paper", "2)", "Paper", "2"] for t in tokens[:4]):
            branches = []
            skip_next = False
            for i, t in enumerate(tokens):
                if skip_next:
                    skip_next = False
                    continue
                if t == "B.Arch" and i + 1 < len(tokens) and tokens[i+1].startswith("("):
                    branches.append("B.Arch")
                    skip_next = True
                elif t == "(Paper" or t == "2)" or t == "Paper" or t == "2":
                    pass
                else:
                    branches.append(t)
            continue
            
        if branches and len(tokens) >= 2:
            merged_tokens = tokenize_row(line_str)
            cat = merged_tokens[0]
            
            if len(cat) >= 2 and any(cat.startswith(p) for p in ["GN", "OB", "SC", "ST", "EW", "SG", "KM"]):
                ranks_vals = merged_tokens[1:]
                for i, r_val in enumerate(ranks_vals):
                    if i >= len(branches):
                        break
                    
                    branch_name = branches[i]
                    if r_val != "-" and r_val.strip() != "":
                        num_match = re.match(r'^(\d+)', r_val)
                        if num_match:
                            val = int(num_match.group(1))
                            parsed_entries.append({
                                "institute": "Indira Gandhi Delhi Technical University for Women (IGDTUW)",
                                "type": "JACD",
                                "program": branch_name,
                                "quota": "AI" if cat == "KM" else quota,
                                "seat_type": cat,
                                "gender": "Female-only",
                                "opening_rank": str(val),
                                "closing_rank": str(val),
                                "source": "JAC_DELHI",
                                "round": round_num,
                                "year": "2025"
                            })
                            
    return parsed_entries

# ----------------- IIITD PARSER -----------------
def align_iiitd_row(row_ranks, branches, medians):
    vals = row_ranks
    
    def get_valid_indices(val_idx, branch_idx, current):
        if val_idx == len(vals):
            return [current[:]]
        res = []
        for b in range(branch_idx, len(branches)):
            current.append(b)
            res.extend(get_valid_indices(val_idx + 1, b + 1, current))
            current.pop()
        return res
        
    candidates = get_valid_indices(0, 0, [])
    if not candidates:
        return {branches[i]: vals[i] for i in range(min(len(vals), len(branches)))}
        
    best_candidate = None
    best_score = float('inf')
    for cand in candidates:
        score = 0
        for i, branch_idx in enumerate(cand):
            val = vals[i]
            if val is not None:
                b_name = branches[branch_idx]
                ref_val = medians.get(b_name, 15000)
                score += (math.log(val) - math.log(ref_val)) ** 2
        if score < best_score:
            best_score = score
            best_candidate = cand
            
    return {branches[best_candidate[i]]: vals[i] for i in range(len(vals))}

def parse_iiitd(sec_name, sec_lines):
    round_match = re.search(r'Round\s*(\d+)', sec_name, re.I)
    round_num = round_match.group(1) if round_match else "5"
    
    parsed_entries = []
    branches = []
    has_jee = any("JEE" in l for l in sec_lines[:15])
    is_jee_first = True
    
    for l in sec_lines[:15]:
        if "JEE Rank" in l and "IIIT" in l:
            if l.index("JEE") > l.index("IIIT"):
                is_jee_first = False
            break
            
    iiitd_branch_medians = {
        "CSAI": 5000, "CSE": 8000, "CSAM": 12000, "CSEcon": 12000,
        "CSD": 14000, "CSB": 18000, "CSSS": 20000, "ECE": 22000, "EVE": 25000
    }
    
    for line in sec_lines:
        line_str = line.strip()
        if not line_str:
            continue
            
        tokens = line_str.split()
        if len(tokens) >= 4 and all(t in ["CSAM", "CSAI", "CSB", "CSD", "CSEcon", "CSE", "CSSS", "EVE", "ECE", "Category"] for t in tokens):
            branches = [t for t in tokens if t != "Category"]
            continue
            
        if branches and len(tokens) >= 2:
            cat = tokens[0]
            if len(cat) >= 2 and any(cat.startswith(p) for p in ["GN", "OB", "SC", "ST", "EW", "KM"]):
                raw_nums = [int(t) for t in tokens[1:] if t.isdigit()]
                
                extracted_ranks = []
                if has_jee:
                    num_pairs = len(raw_nums) // 2
                    for i in range(num_pairs):
                        if is_jee_first:
                            jee_val = raw_nums[2*i]
                        else:
                            jee_val = raw_nums[2*i + 1]
                        extracted_ranks.append(jee_val)
                else:
                    extracted_ranks = raw_nums
                    
                aligned = align_iiitd_row(extracted_ranks, branches, iiitd_branch_medians)
                quota = "AI" if "KM" in cat else ("OS" if "OD" in cat or cat.endswith("O") else "HS")
                
                for b_name, val in aligned.items():
                    gender = "Female-only" if ("GLD" in cat or "GLO" in cat) else "Gender-Neutral"
                    parsed_entries.append({
                        "institute": "Indraprastha Institute of Information Technology Delhi (IIITD)",
                        "type": "JACD",
                        "program": b_name,
                        "quota": quota,
                        "seat_type": cat,
                        "gender": gender,
                        "opening_rank": str(val),
                        "closing_rank": str(val),
                        "source": "JAC_DELHI",
                        "round": round_num,
                        "year": "2025"
                    })
                    
    return parsed_entries

def parse_jac_delhi_data(file_path):
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

    content = content.replace('\r\n', '\n')
    lines = content.split('\n')

    # Split into sections
    sections = {}
    current_sec = None
    sec_lines = []

    for line in lines:
        line_str = line.strip()
        if line_str.startswith('//'):
            if current_sec:
                sections[current_sec] = sec_lines
            current_sec = line_str[2:].strip()
            sec_lines = []
        elif current_sec:
            sec_lines.append(line)
    if current_sec:
        sections[current_sec] = sec_lines

    parsed_entries = []
    for sec_name, sec_lines in sections.items():
        if "IIITD" in sec_name or "IIIT Delhi" in sec_name:
            entries = parse_iiitd(sec_name, sec_lines)
        elif "IGDTUW" in sec_name:
            entries = parse_igdtuw(sec_name, sec_lines)
        elif "DTU" in sec_name:
            entries = parse_dtu_nsut(sec_name, sec_lines, "Delhi Technological University (DTU)")
        elif "NSUT" in sec_name:
            entries = parse_dtu_nsut(sec_name, sec_lines, "Netaji Subhas University of Technology (NSUT)")
        else:
            entries = []
        parsed_entries.extend(entries)

    return parsed_entries

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
        elif "jacdelhi" in file_name_lower:
            all_results.extend(parse_jac_delhi_data(txt_file))
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
