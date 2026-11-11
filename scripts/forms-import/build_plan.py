"""Mapea un Google Form exportado al constructor de formularios (solo simulación).

Lee el export del formulario, el banco de preguntas y un archivo de mapeo
revisable. Genera la composición (`sectionKeys`) y un reporte. No escribe en la
base de datos: el resultado es un plan JSON que otro paso valida e inserta.

Uso: python build_plan.py <form.json> <bank.json> <mapping.json> <plan.json>
"""
import json
import re
import sys

STRUCTURAL = {"PAGE_BREAK", "SECTION_HEADER"}
NO_EQUIVALENT_TYPES = {
    "CHECKBOX", "GRID", "CHECKBOX_GRID", "SCALE", "RATING", "TIME", "DATETIME",
    "DURATION", "FILE_UPLOAD", "IMAGE", "VIDEO",
}
COMPATIBLE = {
    "TEXT": {"text", "number", "email", "phone", "month", "textarea"},
    "PARAGRAPH_TEXT": {"textarea", "text"},
    "MULTIPLE_CHOICE": {"select", "yes-no"},
    "LIST": {"select", "yes-no"},
    "DATE": {"date", "month"},
    "CHECKBOX": {"yes-no"},
}
YES_NO = {"yes", "no", "sí", "si"}


def load(path):
    with open(path, encoding="utf-8") as fh:
        return json.load(fh)


def index_bank(bank):
    """section -> {'order': [...], 'items': {id: item}}."""
    return {
        s["key"]: {"def": s, "items": {i["id"]: i for i in s["items"]}}
        for s in bank
    }


def resolve_target(bank, path):
    parts = path.split(".")
    section = bank.get(parts[0])
    if not section:
        return None
    item = section["items"].get(parts[1])
    if not item:
        return None
    if item["kind"] == "question":
        return item if len(parts) == 2 else None
    if len(parts) != 3:
        return None
    return next((f for f in item["fields"] if f["id"] == parts[2]), None)


def rule_fields(rule):
    if not rule:
        return []
    return [r["fieldId"] for r in rule["anyOf"]] if "anyOf" in rule else [rule["fieldId"]]


def main(export_path, bank_path, mapping_path, plan_path):
    form = load(export_path)[0]
    bank = index_bank(load(bank_path))
    mapping = load(mapping_path)
    items = form["items"]
    problems, warnings = [], []

    by_item = {}
    for entry in mapping["entries"]:
        for i in entry["items"]:
            if i in by_item:
                problems.append(f"El elemento {i} aparece dos veces en el mapeo.")
            by_item[i] = entry

    used = {}  # section -> {itemId: set(fieldIds) | None}
    first_seen = {}
    stats = {"ok": 0, "partial": 0, "gap": 0, "absorbed": 0, "sin_tipo": 0}
    partial_rows, gap_groups, type_rows, required_rows = [], {}, [], []
    questions = 0

    for i, it in enumerate(items):
        if it["type"] in STRUCTURAL:
            continue
        entry = by_item.get(i)
        mapped = bool(entry and "to" in entry)
        if (it["type"] in NO_EQUIVALENT_TYPES and not mapped) or it["type"].startswith("UNKNOWN"):
            stats["sin_tipo"] += 1
            type_rows.append(f"[{i}] {it['type']}: {it['title'][:80]}")
            continue
        questions += 1
        if not entry:
            problems.append(f"[{i}] SIN MAPEAR: {it['type']} «{it['title'][:70]}»")
            continue
        if "gap" in entry:
            stats["gap"] += 1
            gap_groups.setdefault(entry["gap"], []).append(i)
            continue
        if "absorbed" in entry:
            stats["absorbed"] += 1
            partial_rows.append((i, it["title"], "(no hace falta)", entry["absorbed"]))
            continue

        notes = [entry["partial"]] if "partial" in entry else []
        for path in entry["to"]:
            target = resolve_target(bank, path)
            if not target:
                problems.append(f"[{i}] destino inexistente en el banco: {path}")
                continue
            parts = path.split(".")
            section_used = used.setdefault(parts[0], {})
            first_seen.setdefault(parts[0], i)
            if len(parts) == 3:
                section_used.setdefault(parts[1], set()).add(parts[2])
            else:
                section_used[parts[1]] = None

            allowed = COMPATIBLE.get(it["type"], set())
            options = {o.strip().lower() for o in it.get("options", [])}
            if it["type"] == "CHECKBOX":
                pass
            elif target["input"] == "yes-no" and options and not options <= YES_NO:
                notes.append(f"El banco espera Sí/No y Google ofrece {sorted(options)}.")
            elif target["input"] not in allowed:
                notes.append(f"Tipo distinto: {it['type']} en Google, {target['input']} en el banco.")
            if len(entry["to"]) == 1 and len(entry["items"]) == 1 and len(parts) == 2:
                if it.get("required") and not target.get("required"):
                    required_rows.append(f"[{i}] {path}: obligatoria en Google, opcional en el banco")
                if not it.get("required") and target.get("required") and not target.get("visibleWhen"):
                    required_rows.append(f"[{i}] {path}: opcional en Google, obligatoria en el banco")
        if it.get("hasOther"):
            notes.append("Google permite 'Otro' con texto libre; el banco no.")
        if notes:
            stats["partial"] += 1
            partial_rows.append((i, it["title"], ", ".join(entry["to"]), " ".join(dict.fromkeys(notes))))
        else:
            stats["ok"] += 1

    # --- composición -------------------------------------------------------
    keys, omitted = [], []
    for section_key in sorted(used, key=first_seen.get):
        section = bank[section_key]
        chosen = used[section_key]
        complete = all(
            item["id"] in chosen
            and (item["kind"] == "question" or chosen[item["id"]] == {f["id"] for f in item["fields"]})
            for item in section["def"]["items"]
        )
        if complete:
            keys.append(section_key)
            continue
        available = set()
        for item in section["def"]["items"]:
            if item["id"] not in chosen:
                if item["kind"] == "question" and item.get("required") and not item.get("visibleWhen"):
                    omitted.append(f"{section_key}.{item['id']} — {item['label'][:70]}")
                continue
            triggers = rule_fields(item.get("visibleWhen"))
            if triggers and not any(t in available for t in triggers):
                label = item.get("label") or item.get("title")
                warnings.append(
                    f"{section_key}.{item['id']} («{label[:50]}») pierde su condición "
                    f"({'/'.join(triggers)} no está en el formulario): se mostrará siempre"
                    + (" y será obligatoria." if item.get("required") else ".")
                )
            if item["kind"] == "question":
                keys.append(f"q:{section_key}:{item['id']}")
                available.add(item["id"])
                continue
            selected = chosen[item["id"]]
            ordered = [f["id"] for f in item["fields"] if f["id"] in selected]
            for field in item["fields"]:
                if field["id"] not in selected:
                    continue
                inner = rule_fields(field.get("visibleWhen"))
                if inner and not any(t in selected for t in inner):
                    warnings.append(f"{section_key}.{item['id']}.{field['id']} pierde su condición.")
            full = len(ordered) == len(item["fields"])
            keys.append(f"g:{section_key}:{item['id']}" + ("" if full else ":" + ",".join(ordered)))

    name = (mapping.get("name") or form["title"] or "").strip()
    slug = mapping.get("slug") or re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")
    description = (mapping.get("description") or form.get("description") or "").strip()
    if not 3 <= len(name) <= 100:
        problems.append(f"Nombre fuera de límite (3-100): {len(name)} caracteres.")
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug) or not 3 <= len(slug) <= 100:
        problems.append(f"Slug inválido: {slug}")
    if len(description) > 500:
        warnings.append(f"Descripción recortada de {len(description)} a 500 caracteres.")
        description = description[:500]

    plan = {"name": name, "slug": slug, "description": description,
            "status": "DRAFT", "sectionKeys": keys}
    with open(plan_path, "w", encoding="utf-8") as fh:
        json.dump(plan, fh, ensure_ascii=False, indent=2)

    out = print
    out(f"FORMULARIO: {form['title']}  (archivo: {form.get('fileName')})")
    out(f"Elementos: {len(items)} | preguntas: {questions} | estructura (páginas/títulos): "
        f"{sum(1 for it in items if it['type'] in STRUCTURAL)} | tipo sin equivalente: {stats['sin_tipo']}")
    out(f"\nRESULTADO DEL MAPEO ({questions} preguntas)")
    out(f"  Equivalente directo ............ {stats['ok']}")
    out(f"  Equivalente con diferencias .... {stats['partial']}")
    out(f"  Sin equivalente en el banco .... {stats['gap']}")
    out(f"  No hace falta en el banco ...... {stats['absorbed']}")
    out("\nSIN EQUIVALENTE EN EL BANCO")
    for label, idx in gap_groups.items():
        out(f"  - {label}  [{len(idx)} elementos: {idx[0]}…{idx[-1]}]")
    out("\nTIPOS SIN EQUIVALENTE")
    for row in type_rows or ["(ninguno)"]:
        out(f"  - {row}")
    out("\nEQUIVALENTES CON DIFERENCIAS")
    for i, title, to, note in partial_rows:
        out(f"  [{i}] {title[:60]}\n       → {to}\n       {note}")
    out("\nOBLIGATORIEDAD DISTINTA")
    for row in required_rows or ["(ninguna)"]:
        out(f"  - {row}")
    out("\nAVISOS DE CONDICIONALES")
    for row in warnings or ["(ninguno)"]:
        out(f"  - {row}")
    out("\nPREGUNTAS OBLIGATORIAS DEL BANCO QUE ESTE FORMULARIO NO INCLUYE")
    for row in omitted or ["(ninguna)"]:
        out(f"  - {row}")
    out(f"\nPLAN: name={name!r} slug={slug!r} status=DRAFT partes={len(keys)}")
    for key in keys:
        out(f"  {key}")
    out("\nPROBLEMAS QUE IMPIDEN IMPORTAR")
    for row in problems or ["(ninguno)"]:
        out(f"  - {row}")
    sys.exit(1 if problems else 0)


if __name__ == "__main__":
    sys.stdout.reconfigure(encoding="utf-8")
    main(*sys.argv[1:5])
