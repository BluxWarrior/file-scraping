import PyPDF2
import json


def merge_pdfs(paths, output_path):
    pdf_writer = PyPDF2.PdfWriter()

    # Loop through all PDF files
    for path in paths:
        try:
            pdf_reader = PyPDF2.PdfReader(path)
            for page_num in range(len(pdf_reader.pages)):
                # Add each page to the writer object
                page = pdf_reader.pages[page_num]
                pdf_writer.add_page(page)
        except:
            pass

    # Write out the merged PDF
    with open(output_path, "wb") as out:
        pdf_writer.write(out)


with open("pdfs.json", "r") as f:
    all_pdfs = json.load(f)

for year in all_pdfs:
    print(year)
    pdfs = []
    for pdf_name in all_pdfs[year]:
        pdfs.append(f"./ocr_data/{year}/{pdf_name}.pdf")
    merge_pdfs(pdfs, f"./ocr_data/{year}/{year}.pdf")

# print(all_pdfs)
