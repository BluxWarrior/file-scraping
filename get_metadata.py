from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.by import By
import time
import json

driver = webdriver.Chrome()


def get_folders():
    driver.get("https://hendryfla.civicweb.net/filepro/documents/6759/")
    time.sleep(2)

    # get folder elements
    folder_elements = driver.find_elements(
        By.CSS_SELECTOR, "a[class='folder-link']")

    # get links
    folders = {}
    for fe in folder_elements:
        folders[fe.text] = fe.get_attribute("href")

    return folders


def get_pdfs(folder_link):
    driver.get(folder_link)
    time.sleep(2)

    # get pdf elements
    pdf_elements = driver.find_elements(
        By.CSS_SELECTOR, "a[class='document-link']")

    # get links
    pdfs = {}
    for pe in pdf_elements:
        pdfs[pe.text] = pe.get_attribute("href")

    return pdfs


# folders = get_folders()
# with open("folders.json", "w") as f:
#     json.dump(folders, f)
with open("folders.json", "r") as f:
    folders = json.load(f)
all_pdfs = {}
for year in folders:
    pdfs = get_pdfs(folders[year])
    all_pdfs[year] = pdfs
    print(year, len(pdfs))
with open("pdfs.json", "w") as f:
    json.dump(all_pdfs, f)
# with open("pdfs.json", "r") as f:
#     all_pdfs = json.load(f)
