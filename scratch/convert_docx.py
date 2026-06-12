import zipfile
import xml.etree.ElementTree as ET
import os

def convert_docx_to_md(docx_path, output_md_path):
    try:
        with zipfile.ZipFile(docx_path) as z:
            xml_content = z.read('word/document.xml')
            root = ET.fromstring(xml_content)
            
            # Namespace for Word elements
            w_ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main'
            
            lines = []
            for elem in root.iter():
                # Check for paragraph
                if elem.tag == f'{{{w_ns}}}p':
                    # Extract all text runs in paragraph
                    p_text = []
                    is_heading = False
                    heading_level = None
                    
                    # Check paragraph properties for style/headings
                    pPr = elem.find(f'{{{w_ns}}}pPr')
                    if pPr is not None:
                        pStyle = pPr.find(f'{{{w_ns}}}pStyle')
                        if pStyle is not None:
                            val = pStyle.get(f'{{{w_ns}}}val')
                            if val and val.startswith('Heading'):
                                is_heading = True
                                heading_level = val.replace('Heading', '')

                    for r in elem.iter(f'{{{w_ns}}}t'):
                        if r.text:
                            p_text.append(r.text)
                    
                    text_str = ''.join(p_text).strip()
                    if text_str:
                        if is_heading:
                            level = int(heading_level) if heading_level.isdigit() else 1
                            lines.append(f"\n{'#' * level} {text_str}\n")
                        else:
                            lines.append(text_str)
                    else:
                        # Add blank lines for spacing
                        lines.append("")
                        
            # Write to output file
            with open(output_md_path, 'w', encoding='utf-8') as f:
                f.write('\n'.join(lines))
            print(f"Successfully converted {os.path.basename(docx_path)} -> {os.path.basename(output_md_path)}")
    except Exception as e:
        print(f"Error converting {os.path.basename(docx_path)}: {e}")

reference_dir = "/Users/ritesh/anima-link-s/Anima-Link-s/reference"
convert_docx_to_md(
    os.path.join(reference_dir, "Anima-Link_2-Person_Build_Phase_Document.docx"),
    os.path.join(reference_dir, "Anima-Link_2-Person_Build_Phase_Document.md")
)
convert_docx_to_md(
    os.path.join(reference_dir, "Anima-Link_Page_Mockup_Prompts.docx"),
    os.path.join(reference_dir, "Anima-Link_Page_Mockup_Prompts.md")
)
