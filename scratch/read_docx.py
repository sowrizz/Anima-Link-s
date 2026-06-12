import zipfile
import xml.etree.ElementTree as ET
import os

def extract_docx_text(docx_path):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # XML namespace for Word processing
            ns = {'w': 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'}
            
            texts = []
            for paragraph in root.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'):
                p_text = []
                for run in paragraph.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t'):
                    if run.text:
                        p_text.append(run.text)
                if p_text:
                    texts.append(''.join(p_text))
            return '\n'.join(texts)
    except Exception as e:
        return f"Error reading {os.path.basename(docx_path)}: {e}"

reference_dir = "/Users/ritesh/anima-link-s/Anima-Link-s/reference"
docx_files = [
    "Anima-Link_2-Person_Build_Phase_Document.docx",
    "Anima-Link_Page_Mockup_Prompts.docx"
]

for docx in docx_files:
    path = os.path.join(reference_dir, docx)
    print(f"====================================================================")
    print(f" FILE: {docx}")
    print(f"====================================================================")
    text = extract_docx_text(path)
    # Print first 2000 characters to verify content
    print(text[:2500])
    print(f"\n... (Total characters: {len(text)}) ...\n")
