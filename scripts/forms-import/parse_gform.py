"""Convierte un Google Form público al JSON que usan automap.py y build_plan.py.

Uso: python parse_gform.py <url-o-archivo.html> <salida.json>
"""
import json
import re
import sys
import urllib.request

TYPES = {
    0: "TEXT", 1: "PARAGRAPH_TEXT", 2: "MULTIPLE_CHOICE", 3: "LIST", 4: "CHECKBOX",
    5: "SCALE", 6: "SECTION_HEADER", 7: "GRID", 8: "PAGE_BREAK", 9: "DATE",
    10: "TIME", 11: "IMAGE", 12: "VIDEO", 13: "FILE_UPLOAD", 18: "RATING",
}


def main(src: str, dst: str) -> None:
    if src.startswith("http"):
        request = urllib.request.Request(src, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(request, timeout=60) as response:
            html = response.read().decode("utf-8")
    else:
        with open(src, encoding="utf-8") as fh:
            html = fh.read()
    match = re.search(r"FB_PUBLIC_LOAD_DATA_ = (.*?);\s*</script>", html, re.S)
    if not match:
        sys.exit("No se encontró FB_PUBLIC_LOAD_DATA_")
    data = json.loads(match.group(1))
    meta = data[1]
    items = []
    for raw in meta[1] or []:
        code = raw[3]
        item = {
            "gid": raw[0],
            "type": TYPES.get(code, f"UNKNOWN_{code}"),
            "title": (raw[1] or "").strip(),
            "helpText": (raw[2] or "").strip(),
        }
        entries = raw[4] if len(raw) > 4 and raw[4] else []
        if entries:
            first = entries[0]
            item["required"] = bool(first[2]) if len(first) > 2 else False
            options = first[1] or []
            if code in (2, 3, 4):
                item["options"] = [o[0] for o in options if not (len(o) > 4 and o[4])]
                item["hasOther"] = any(len(o) > 4 and o[4] for o in options)
                gotos = {o[0]: o[2] for o in options if len(o) > 2 and o[2] is not None}
                if gotos:
                    item["goto"] = gotos
            elif code == 5:
                item["options"] = [o[0] for o in options]
            elif code == 7:
                item["rows"] = [e[3][0] if len(e) > 3 and e[3] else None for e in entries]
                item["columns"] = [o[0] for o in options]
            elif code == 9 and len(first) > 7 and first[7]:
                item["dateFlags"] = first[7]
        items.append(item)
    out = [{
        "title": meta[8] if len(meta) > 8 else None,
        "fileName": data[3] if len(data) > 3 else None,
        "description": meta[0],
        "items": items,
    }]
    with open(dst, "w", encoding="utf-8") as fh:
        json.dump(out, fh, ensure_ascii=False, indent=2)
    counts: dict[str, int] = {}
    for it in items:
        counts[it["type"]] = counts.get(it["type"], 0) + 1
    print(json.dumps({"title": out[0]["title"], "fileName": out[0]["fileName"],
                      "items": len(items), "byType": counts}, ensure_ascii=False))


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main(sys.argv[1], sys.argv[2])
