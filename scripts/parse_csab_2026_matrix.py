import os
import json
import re
import time
import pdfplumber

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
    if s_upper in ["OBC (PWD)", "OBC(PWD)", "OBC-NCL (PWD)", "OBC-NCL(PWD)", "OBC-NCL(PWD)"]:
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

def determine_inst_type(inst_name):
    if "Indian Institute of Technology" in inst_name or "IIT" in inst_name:
        return "IIT"
    elif "National Institute of Technology" in inst_name or "NIT" in inst_name:
        return "NIT"
    elif "Indian Institute of Information Technology" in inst_name or "IIIT" in inst_name:
        return "IIIT"
    elif "IIEST" in inst_name:
        return "IIEST"
    elif "School of Planning and Architecture" in inst_name or "SPA" in inst_name:
        return "SPA"
    else:
        return "GFTI"

def parse_csab_2026_pdf(pdf_path):
    print(f"Parsing CSAB 2026 Vacant Seat Matrix PDF: {os.path.basename(pdf_path)}...")
    t0 = time.time()
    parsed_entries = []
    
    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        for page_idx, page in enumerate(pdf.pages):
            table = page.extract_table()
            if not table:
                continue
            for r in table:
                if not r or len(r) < 9:
                    continue
                
                sr_no = r[0].strip() if r[0] else ''
                if not sr_no.isdigit():
                    continue
                
                inst_name = r[1].replace('\n', ' ').strip()
                inst_code = r[2].replace('\n', ' ').strip()
                program_name = r[3].replace('\n', ' ').strip()
                program_code = r[4].replace('\n', ' ').strip()
                quota_raw = r[5].replace('\n', ' ').strip()
                seat_type_raw = r[6].replace('\n', ' ').strip()
                gender_raw = r[7].replace('\n', ' ').strip()
                vacancy_str = r[8].replace('\n', ' ').strip()
                
                try:
                    vacancy = int(vacancy_str)
                except ValueError:
                    vacancy = 0
                
                inst_type = determine_inst_type(inst_name)
                
                entry = {
                    "institute": inst_name,
                    "inst_code": inst_code,
                    "type": inst_type,
                    "program": program_name,
                    "program_code": program_code,
                    "quota": normalize_quota(quota_raw),
                    "seat_type": normalize_seat_type(seat_type_raw),
                    "gender": normalize_gender(gender_raw),
                    "vacancy": vacancy,
                    "opening_rank": "-",
                    "closing_rank": "-",
                    "source": "CSAB_2026_MATRIX",
                    "round": "Vacant Matrix",
                    "year": "2026"
                }
                parsed_entries.append(entry)
            
            if (page_idx + 1) % 100 == 0 or (page_idx + 1) == total_pages:
                print(f"  Processed page {page_idx + 1}/{total_pages} - {len(parsed_entries)} seat matrix records parsed")
                
    t1 = time.time()
    print(f"Parsing complete in {t1 - t0:.2f}s! Total vacant seat records extracted: {len(parsed_entries)}")
    return parsed_entries

if __name__ == "__main__":
    script_dir = os.path.dirname(os.path.abspath(__file__))
    base_dir = os.path.dirname(script_dir)
    pdf_path = os.path.join(base_dir, "data", "20260728482536888.pdf")
    
    if os.path.exists(pdf_path):
        entries = parse_csab_2026_pdf(pdf_path)
        output_json = os.path.join(base_dir, "data", "csab_vacant_2026.json")
        with open(output_json, 'w', encoding='utf-8') as f:
            json.dump(entries, f, indent=2)
        print(f"Saved parsed records to {output_json}")
    else:
        print(f"PDF file not found at {pdf_path}")
