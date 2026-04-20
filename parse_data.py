import json
import re

file_path = r'c:\Users\ASUS\OneDrive\Desktop\Anunayy\AntiGravity\JOSAA\data.txt'
output_path = r'c:\Users\ASUS\OneDrive\Desktop\Anunayy\AntiGravity\JOSAA\data.json'

def parse_josaa_data(file_path):
    # Using utf-16 or utf-8 based on typical text extracts, but trial and error
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
    except:
        with open(file_path, 'r', encoding='utf-16') as f:
            content = f.read()

    lines = content.split('\n')
    data = []
    header_found = False
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

                entry = {
                    "institute": inst_name,
                    "type": inst_type,
                    "program": parts[1].strip(),
                    "quota": parts[2].strip(),
                    "seat_type": parts[3].strip(),
                    "gender": parts[4].strip(),
                    "opening_rank": parts[5].strip(),
                    "closing_rank": parts[6].strip()
                }
                data.append(entry)
    
    return data

if __name__ == "__main__":
    result = parse_josaa_data(file_path)
    output_js_path = r'c:\Users\ASUS\OneDrive\Desktop\Anunayy\AntiGravity\JOSAA\data.js'
    with open(output_js_path, 'w', encoding='utf-8') as f:
        f.write("window.JOSAA_DATA = ")
        json.dump(result, f, indent=2)
        f.write(";")
    print(f"Parsed {len(result)} entries and saved to {output_js_path}")
