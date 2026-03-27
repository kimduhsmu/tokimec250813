import os
import re

src_path = r'C:\Users\KJS\Desktop\tkp단가표\index.html'
dest_html = r'C:\Users\KJS\Desktop\tkp단가표2\index.html'
dest_css = r'C:\Users\KJS\Desktop\tkp단가표2\css\main.css'
dest_js = r'C:\Users\KJS\Desktop\tkp단가표2\js\main.js'

with open(src_path, 'r', encoding='utf-8') as f:
    content = f.read()

# 1. CSS 추출
style_pattern = re.compile(r'<style>(.*?)</style>', re.DOTALL)
style_match = style_pattern.search(content)
css_content = style_match.group(1) if style_match else ''
# CSS 구문 오류 수정
css_content = css_content.replace('html, body {\n\t.password-modal-overlay', 'html, body {\n        min-height: 100dvh;\n    }\n    .password-modal-overlay')
css_content = css_content.replace('            min-height: 100dvh;\n        \n', '')
with open(dest_css, 'w', encoding='utf-8') as f:
    f.write(css_content.strip())

# 2. JS 추출 (메인 로직은 길이가 가장 긴 script 블록임)
script_pattern = re.compile(r'<script>(.*?)</script>', re.DOTALL)
script_matches = list(re.finditer(r'<script>(.*?)</script>', content, re.DOTALL))
main_script_match = max(script_matches, key=lambda m: len(m.group(1)))
js_content = main_script_match.group(1)

with open(dest_js, 'w', encoding='utf-8') as f:
    f.write(js_content.strip())

# 3. HTML 수정 (CSS와 메인 JS를 외부 파일 참조로 변경)
html_content = content[:style_match.start()] + '<link rel="stylesheet" href="./css/main.css">' + content[style_match.end():]

# 문자열 인덱스가 변했으므로 html_content에서 다시 찾음
script_matches2 = list(re.finditer(r'<script>(.*?)</script>', html_content, re.DOTALL))
main_script_match2 = max(script_matches2, key=lambda m: len(m.group(1)))
html_content = html_content[:main_script_match2.start()] + '<script src="./js/main.js"></script>' + html_content[main_script_match2.end():]

with open(dest_html, 'w', encoding='utf-8') as f:
    f.write(html_content)

print("Split and encoding fix successfully applied again!")
