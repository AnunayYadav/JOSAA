import json
import re
import os
import glob

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
        # Check for JoSAA round in filename if possible, otherwise keep default
        match = re.search(r'round(\d+)', file_name_lower)
        if match:
            round_num = match.group(1)

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

if __name__ == "__main__":
    base_dir = r'c:\Users\ASUS\OneDrive\Desktop\Anunayy\AntiGravity\JOSAA'
    txt_files = glob.glob(os.path.join(base_dir, "*.txt"))
    
    all_results = []
    for txt_file in txt_files:
        all_results.extend(parse_josaa_data(txt_file))
        
    output_js_path = os.path.join(base_dir, 'data.js')
    with open(output_js_path, 'w', encoding='utf-8') as f:
        f.write("window.JOSAA_DATA = ")
        json.dump(all_results, f, indent=2)
        f.write(";")
    
    print(f"\nFinal Statistics:")
    print(f"Total files processed: {len(txt_files)}")
    print(f"Total entries parsed: {len(all_results)}")
    print(f"Data saved to {output_js_path}")
