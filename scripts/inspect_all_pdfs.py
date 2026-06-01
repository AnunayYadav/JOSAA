import pdfplumber
import os

pdf_files = ["round1ggsipu.pdf", "round2ggsipu.pdf", "round3ggsipu.pdf"]

for pdf_file in pdf_files:
    if not os.path.exists(pdf_file):
        print(f"{pdf_file} does not exist.")
        continue
    with pdfplumber.open(pdf_file) as pdf:
        print(f"\n--- {pdf_file} ---")
        print("Total pages:", len(pdf.pages))
        first_page = pdf.pages[0]
        tables = first_page.extract_tables()
        print("Number of tables extracted:", len(tables))
        if tables:
            first_table = tables[0]
            print("Headers:", first_table[0])
            print("Number of columns:", len(first_table[0]))
