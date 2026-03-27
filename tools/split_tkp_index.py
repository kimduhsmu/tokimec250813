#!/usr/bin/env python3
import re
from pathlib import Path


ROOT = Path(r"c:\Users\KJS\Desktop\tkp단가표Git")
INDEX_PATH = ROOT / "index.html"
SW_PATH = ROOT / "sw.js"


def read_text(path: Path) -> str:
    return path.read_text(encoding="utf-8")


def write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8", newline="\n")


def find_matching(text: str, start: int, open_char: str, close_char: str) -> int:
    depth = 0
    i = start
    in_string = None
    in_line_comment = False
    in_block_comment = False
    while i < len(text):
        ch = text[i]
        nxt = text[i + 1] if i + 1 < len(text) else ""
        if in_line_comment:
            if ch == "\n":
                in_line_comment = False
        elif in_block_comment:
            if ch == "*" and nxt == "/":
                in_block_comment = False
                i += 1
        elif in_string:
            if ch == "\\":
                i += 1
            elif ch == in_string:
                in_string = None
        else:
            if ch == "/" and nxt == "/":
                in_line_comment = True
                i += 1
            elif ch == "/" and nxt == "*":
                in_block_comment = True
                i += 1
            elif ch in ("'", '"', "`"):
                in_string = ch
            elif ch == open_char:
                depth += 1
            elif ch == close_char:
                depth -= 1
                if depth == 0:
                    return i
        i += 1
    raise ValueError(f"Unmatched {open_char}{close_char}")


def extract_const_assignment(text: str, name: str) -> tuple[str, tuple[int, int]]:
    match = re.search(rf"\bconst\s+{re.escape(name)}\s*=\s*", text)
    if not match:
        raise ValueError(f"const {name} not found")
    value_start = match.end()
    while value_start < len(text) and text[value_start].isspace():
        value_start += 1
    opener = text[value_start]
    if opener in "[{":
        closer = "]" if opener == "[" else "}"
        value_end = find_matching(text, value_start, opener, closer)
        end = value_end + 1
    else:
        end = text.index(";", value_start)
    while end < len(text) and text[end].isspace():
        end += 1
    if end < len(text) and text[end] == ";":
        end += 1
    return text[match.start():end], (match.start(), end)


def extract_iife_after_marker(text: str, marker: str) -> tuple[str, tuple[int, int]]:
    marker_idx = text.index(marker)
    start = text.index("(function () {", marker_idx)
    brace_idx = text.index("{", start)
    brace_end = find_matching(text, brace_idx, "{", "}")
    end = brace_end + 1
    while end < len(text) and text[end].isspace():
        end += 1
    if text[end:end + 4] != ")();":
        raise ValueError(f"IIFE terminator not found after marker {marker}")
    end += 4
    return text[marker_idx:end], (marker_idx, end)


def remove_spans(text: str, spans: list[tuple[int, int]]) -> str:
    parts = []
    cursor = 0
    for start, end in sorted(spans):
        parts.append(text[cursor:start])
        cursor = end
    parts.append(text[cursor:])
    return "".join(parts)


def dedent_block(block: str) -> str:
    lines = block.splitlines()
    non_empty = [line for line in lines if line.strip()]
    indent = min((len(line) - len(line.lstrip(" ")) for line in non_empty), default=0)
    return "\n".join(line[indent:] if len(line) >= indent else line for line in lines).strip() + "\n"


def indent_block(block: str, prefix: str) -> str:
    return "\n".join((prefix + line) if line else "" for line in block.splitlines())


def wrap_dom_ready(block: str) -> str:
    inner = indent_block(dedent_block(block).rstrip(), "    ")
    return "document.addEventListener('DOMContentLoaded', function () {\n" + inner + "\n});\n"


def replace_once(text: str, old: str, new: str) -> str:
    idx = text.find(old)
    if idx == -1:
        raise ValueError("Target text not found for replacement")
    return text[:idx] + new + text[idx + len(old):]


def main() -> None:
    content = read_text(INDEX_PATH)

    style_match = re.search(r"<style>\n?(.*?)\n?\s*</style>", content, re.DOTALL)
    if not style_match:
        raise ValueError("Style block not found")
    css = style_match.group(1).strip() + "\n"
    write_text(ROOT / "css" / "style.css", css)

    script_start = content.index("    <script>\n        document.addEventListener('DOMContentLoaded', function () {")
    script_end = content.index("    </script>", script_start)
    script_tag = content[script_start:script_end + len("    </script>")]
    script_body = content[script_start + len("    <script>\n        document.addEventListener('DOMContentLoaded', function () {\n"):script_end - len("\n        });")]

    contact_block, contact_span = extract_const_assignment(script_body, "contactData")
    write_text(ROOT / "data" / "data-contact.js", "// 연락처 데이터\n" + dedent_block(contact_block))

    std_block, std_span = extract_iife_after_marker(script_body, "// --- Standard Cylinder Calculator Logic ---")
    std_data_names = [
        "stdPriceData",
        "stdMountingData",
        "stdRodEndFittingData",
        "stdCushionData",
        "stdRodExtensionRateData",
        "stdBellowsStrokeC_40_50_63",
        "stdBellowsStrokeC_80_100",
        "stdBellowsStrokeC_125",
        "stdBellowsStrokeC_140_150",
        "stdBellowsStrokeC_160",
        "stdBellowsStrokeC_180",
        "stdBellowsStrokeC_200",
        "stdBellowsStrokeB_40_50_63",
        "stdBellowsStrokeB_80_100",
        "stdBellowsStrokeB_125",
        "stdBellowsStrokeB_140_150",
        "stdBellowsStrokeB_160",
        "stdBellowsStrokeB_180",
        "stdBellowsStrokeB_200",
        "stdBellowsInquiryStrokeMap",
        "stdBellowsPriceData",
    ]
    std_spans = []
    std_parts = ["// 표준 실린더 데이터"]
    std_logic = std_block
    for name in std_data_names:
        block, span = extract_const_assignment(std_logic, name)
        std_parts.append(dedent_block(block).rstrip())
        std_spans.append(span)
    write_text(ROOT / "data" / "data-std.js", "\n\n".join(std_parts) + "\n")
    std_logic = remove_spans(std_logic, std_spans)
    write_text(ROOT / "js" / "std.js", wrap_dom_ready(std_logic))

    sw_block, sw_span = extract_iife_after_marker(script_body, "(function () {\n                if (!document.getElementById('content-std-sw')) return;")
    sw_data_names = [
        "stdSwPriceData",
        "stdSwMountingData",
        "stdSwRodEndFittingData",
        "stdSwCushionData",
        "proximitySensorPrice",
        "stdSwRodExtensionRateData",
        "stdSwBellowsStrokeC_40_50_63",
        "stdSwBellowsStrokeC_80_100",
        "stdSwBellowsStrokeC_125",
        "stdSwBellowsStrokeB_40_50_63",
        "stdSwBellowsStrokeB_80_100",
        "stdSwBellowsStrokeB_125",
        "stdSwBellowsInquiryStrokeMap",
        "stdSwBellowsPriceData",
    ]
    sw_spans = []
    sw_parts = ["// 표준 스위치 실린더 데이터"]
    sw_logic = sw_block
    for name in sw_data_names:
        block, span = extract_const_assignment(sw_logic, name)
        sw_parts.append(dedent_block(block).rstrip())
        sw_spans.append(span)
    write_text(ROOT / "data" / "data-std-sw.js", "\n\n".join(sw_parts) + "\n")
    sw_logic = remove_spans(sw_logic, sw_spans)
    write_text(ROOT / "js" / "std-sw.js", wrap_dom_ready(sw_logic))

    cmp_block, cmp_span = extract_iife_after_marker(script_body, "(function () {\n                if (!document.getElementById('content-cmp')) return;")
    cmp_data, cmp_data_span = extract_const_assignment(cmp_block, "cmpPriceData")
    write_text(ROOT / "data" / "data-cmp.js", "// 박형 실린더 데이터\n" + dedent_block(cmp_data))
    cmp_logic = remove_spans(cmp_block, [cmp_data_span])
    write_text(ROOT / "js" / "cmp.js", wrap_dom_ready(cmp_logic))

    valve_block, valve_span = extract_iife_after_marker(script_body, "// --- TKP Valve Calculator Logic ---")
    valve_data, _ = extract_const_assignment(valve_block, "priceData")
    valve_data = valve_data.replace("const priceData =", "const valvePriceData =", 1)
    write_text(ROOT / "data" / "data-valve.js", "// 밸브/펌프 데이터\n" + dedent_block(valve_data))
    valve_logic = replace_once(valve_block, valve_data.replace("const valvePriceData =", "const priceData =", 1), "const priceData = valvePriceData;")
    write_text(ROOT / "js" / "valve.js", wrap_dom_ready(valve_logic))

    app_body = remove_spans(script_body, [contact_span, std_span, sw_span, cmp_span, valve_span])
    app_body = re.sub(r"\n{4,}", "\n\n\n", app_body.strip()) + "\n"
    write_text(ROOT / "js" / "app.js", wrap_dom_ready(app_body))

    head_injection = '    <link rel="stylesheet" href="./css/style.css">\n'
    content = content.replace("    <script src=\"https://cdn.tailwindcss.com\"></script>\n", "    <script src=\"https://cdn.tailwindcss.com\"></script>\n" + head_injection, 1)
    content = content.replace(style_match.group(0), "", 1)

    script_injection = """    <!-- 데이터 파일 -->
    <script src="./data/data-contact.js"></script>
    <script src="./data/data-std.js"></script>
    <script src="./data/data-std-sw.js"></script>
    <script src="./data/data-cmp.js"></script>
    <script src="./data/data-valve.js"></script>
    <script src="./js/app.js"></script>
    <script src="./js/std.js"></script>
    <script src="./js/std-sw.js"></script>
    <script src="./js/cmp.js"></script>
    <script src="./js/valve.js"></script>"""
    content = content.replace(script_tag, script_injection, 1)
    content = re.sub(r"\n{3,}", "\n\n", content)
    write_text(INDEX_PATH, content)

    sw = read_text(SW_PATH)
    cache_entries = [
        "  './css/style.css',",
        "  './data/data-contact.js',",
        "  './data/data-std.js',",
        "  './data/data-std-sw.js',",
        "  './data/data-cmp.js',",
        "  './data/data-valve.js',",
        "  './js/app.js',",
        "  './js/std.js',",
        "  './js/std-sw.js',",
        "  './js/cmp.js',",
        "  './js/valve.js',",
    ]
    files_anchor = "  'icon-512x512.png'\n];"
    replacement = "  'icon-512x512.png',\n" + "\n".join(cache_entries) + "\n];"
    sw = sw.replace(files_anchor, replacement, 1)
    sw = sw.replace("const CACHE_NAME = 'tkp-price-list-cache-v10';", "const CACHE_NAME = 'tkp-price-list-cache-v11';", 1)
    write_text(SW_PATH, sw)


if __name__ == "__main__":
    main()
