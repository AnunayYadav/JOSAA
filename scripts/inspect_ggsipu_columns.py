import pdfplumber

with pdfplumber.open("round1ggsipu.pdf") as pdf:
    table = pdf.pages[0].extract_tables()[0]
    headers = table[0]
    print("All headers:", headers)
    print("Number of columns:", len(headers))
    for i, row in enumerate(table[1:6], 1):
        print(f"\nRow {i} - {row[2]}:")
        non_empty = []
        for col_idx, val in enumerate(row):
            if val and val.strip():
                non_empty.append((headers[col_idx], val.replace('\n', ' ')))
        print(non_empty)
