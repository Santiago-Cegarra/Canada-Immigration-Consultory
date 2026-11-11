"""Propone el mapeo de formularios nuevos con reglas reutilizables.

Cada pregunta se resuelve con la primera regla de rules.json que coincida:
[regex de página, regex de título, destino, tipo opcional]. Página y título se
comparan normalizados (minúsculas, sin acentos, sin números). Lo que no
resuelve ninguna regla se lista como pendiente; nada se adivina.

Uso: python automap.py <dir> <rules.json> <form1> [<form2> ...]
Lee <dir>/<form>.json (salida de parse_gform.py) y escribe
<dir>/<form>.mapping.json. Si existe <dir>/meta.json con
{"<form>": {"name", "slug", "description"}}, esos datos se copian al mapeo.
"""
import json
import re
import sys
import unicodedata

STRUCTURAL = {"PAGE_BREAK", "SECTION_HEADER"}
SKIP_TYPES = {
    "IMAGE", "VIDEO", "GRID", "CHECKBOX_GRID", "SCALE", "RATING",
    "TIME", "DATETIME", "DURATION", "FILE_UPLOAD",
}
DETAILS = {
    "organizations-background.heldGovernmentPosition": {
        "to": ["organizations-background.governmentPositionDetails"],
    },
    "health": {"to": ["health.healthDetails"]},
    "immigration-history": {
        "to": [f"immigration-history.immigrationIncidents.{f}" for f in
               ("country", "date", "situation", "result", "applicationNumber", "explanation")],
        "partial": "incidents",
    },
    "criminal-history": {"to": ["criminal-history.criminalHistoryDetails"]},
    "military-police-service": {"to": ["military-police-service.militaryPoliceDetails"]},
    "organizations-background": {"to": ["organizations-background.organizationsBackgroundDetails"]},
}


def norm(text):
    text = unicodedata.normalize("NFKD", text or "").encode("ascii", "ignore").decode()
    text = re.sub(r"#?\d+", "", text.lower())
    return re.sub(r"[^a-z]+", " ", text).strip()


def load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def contexts(items):
    page, out = "", []
    for it in items:
        if it["type"] == "PAGE_BREAK":
            page = norm(it["title"])
        out.append(page)
    return out



def main(directory, rules_path, names):
    config = load(rules_path)
    gaps, notes = config["gaps"], config["notes"]
    rules = [(re.compile(r[0]), re.compile(r[1]), r[2], r[3] if len(r) > 3 else None)
             for r in config["rules"]]

    def expand(payload):
        out = dict(payload)
        out.pop("onceTo", None)
        if "gap" in out:
            out["gap"] = gaps.get(out["gap"], out["gap"])
        for key in ("partial", "absorbed"):
            if key in out:
                out[key] = notes.get(out[key], out[key])
        return out

    try:
        meta = load(f"{directory}/meta.json")
    except FileNotFoundError:
        meta = {}
    pending = {}
    for name in names:
        form = load(f"{directory}/{name}.json")[0]
        items = form["items"]
        pages = contexts(items)
        grouped, missing = {}, 0
        resolved = 0
        fired, previous = set(), None
        for i, it in enumerate(items):
            if it["type"] in STRUCTURAL or it["type"] in SKIP_TYPES:
                continue
            title = norm(it["title"])
            payload = None
            for page_re, title_re, candidate, only_type in rules:
                if only_type and it["type"] != only_type:
                    continue
                if page_re.search(pages[i]) and title_re.search(title):
                    payload = candidate
                    break
            if payload is not None:
                resolved += 1
                if payload.get("inherit"):
                    if previous and "to" in previous:
                        first = previous["to"][0]
                        payload = DETAILS.get(first) or DETAILS.get(first.split(".")[0])
                    elif previous and "gap" in previous:
                        payload = {"gap": previous["gap"]}
                    else:
                        payload = None
                elif "onceTo" in payload:
                    # La primera vez va a `to`; las repeticiones, a `onceTo`.
                    marker = payload["to"][0]
                    if marker in fired:
                        payload = {"to": payload["onceTo"]}
                    else:
                        fired.add(marker)
            if payload is None:
                missing += 1
                slot = pending.setdefault(f"{pages[i]}|{title}", {"type": it["type"], "opts": it.get("options"), "forms": []})
                if name not in slot["forms"]:
                    slot["forms"].append(name)
                continue
            if not payload.get("inherit") and "absorbed" not in payload:
                previous = payload
            grouped.setdefault(json.dumps(expand(payload), sort_keys=True, ensure_ascii=False), []).append(i)
        entries = [dict(items=idx, **json.loads(p)) for p, idx in grouped.items()]
        with open(f"{directory}/{name}.mapping.json", "w", encoding="utf-8") as fh:
            json.dump({"form": form["title"], **meta.get(name, {}), "entries": entries},
                      fh, ensure_ascii=False, indent=1)
        print(f"{name}: resueltas={resolved} pendientes={missing}")
    print(f"\nPENDIENTES ÚNICOS: {len(pending)}")
    for key, slot in pending.items():
        opts = f" {slot['opts']}" if slot["opts"] else ""
        print(f"  {key}  <{slot['type']}>{opts[:120]}  [{','.join(slot['forms'])}]")


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main(sys.argv[1], sys.argv[2], sys.argv[3:])
