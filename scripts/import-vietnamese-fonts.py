"""Import installed Unicode Vietnamese fonts for the website's font picker.

Run with Python + fontTools. Sources are read-only. Only fonts used on a page
are requested by the browser; the full library is never preloaded.
"""
import hashlib
import json
import logging
import os
import struct
import unicodedata
from pathlib import Path
from fontTools import subset
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public/fonts/vietnamese"
OUTPUT.mkdir(parents=True, exist_ok=True)
logging.getLogger("fontTools").setLevel(logging.ERROR)
required = set(map(ord, "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyzĐđ"))
for base in "AaĂăÂâEeÊêIiOoÔôƠơUuƯưYy":
    for mark in ("", "\u0300", "\u0301", "\u0303", "\u0309", "\u0323"):
        required.update(map(ord, unicodedata.normalize("NFC", base + mark)))
keep = set(range(0x250)) | set(range(0x300, 0x370)) | set(range(0x1E00, 0x1F00)) | set(range(0x2000, 0x2070)) | set(range(0x20A0, 0x20D0)) | {0x2122, 0x2197}
folders = [Path(os.environ["WINDIR"]) / "Fonts", Path(os.environ["LOCALAPPDATA"]) / "Microsoft/Windows/Fonts"]
families = {}
seen = set()
errors = []
for folder in folders:
    if not folder.exists():
        continue
    for path in sorted(folder.iterdir()):
        if path.name.startswith("._") or path.suffix.lower() not in (".ttf", ".otf", ".ttc", ".otc"):
            continue
        data = path.read_bytes()
        count = struct.unpack(">I", data[8:12])[0] if data[:4] == b"ttcf" else 1
        digest = hashlib.sha256(data).hexdigest()
        for index in range(count):
            face_key = f"{digest}:{index}"
            if face_key in seen:
                continue
            seen.add(face_key)
            font = None
            fallback = None
            try:
                font = TTFont(path, fontNumber=index, lazy=True)
                cmap = font.getBestCmap() or {}
                if not required.issubset(cmap) or any(cmap[c] == ".notdef" for c in required):
                    continue
                names = font["name"]
                family = names.getDebugName(16) or names.getDebugName(1)
                if not family:
                    continue
                family = unicodedata.normalize("NFC", family).strip()
                family_id = "local-" + hashlib.sha256(family.casefold().encode()).hexdigest()[:12]
                full = names.getDebugName(4) or family
                postscript = names.getDebugName(6) or full
                os2 = font.get("OS/2")
                flags = os2.fsType if os2 else 0
                # Legacy OS/2 permits the least restrictive of multiple flags.
                # Keep restricted/ambiguous fonts local, without copying outlines.
                permissions = flags & 0xE
                restricted = permissions == 2 or bool(permissions & 2 and os2.version >= 3) or bool(flags & 0x200 and os2.version >= 2)
                italic = bool(os2 and os2.fsSelection & 1) or bool(font["head"].macStyle & 2)
                weight = max(1, min(1000, os2.usWeightClass if os2 else 400))
                if "fvar" in font:
                    axis = next((a for a in font["fvar"].axes if a.axisTag == "wght"), None)
                    if axis:
                        weight = f"{int(axis.minValue)} {int(axis.maxValue)}"
                face = {"weight": str(weight), "style": "italic" if italic else "normal"}
                fallback = (family_id, family, dict(face), full, postscript)
                if restricted:
                    face["local"] = list(dict.fromkeys([full, postscript]))
                else:
                    filename = hashlib.sha256(face_key.encode()).hexdigest()[:20] + ".woff"
                    target = OUTPUT / filename
                    if not target.exists():
                        if not flags & 0x100:
                            options = subset.Options()
                            options.name_IDs = [0, 1, 2, 3, 4, 5, 6, 13, 14, 16, 17]
                            options.name_legacy = True
                            options.name_languages = [0x409]
                            options.recalc_timestamp = False
                            worker = subset.Subsetter(options=options)
                            worker.populate(unicodes=keep | required)
                            worker.subset(font)
                        font.flavor = "woff"
                        font.save(target)
                    face["src"] = "/fonts/vietnamese/" + filename
                entry = families.setdefault(family_id, {"id": family_id, "label": family, "faces": []})
                # Prefer a portable face when duplicate family/weight/style exists.
                duplicate = next((f for f in entry["faces"] if f["weight"] == face["weight"] and f["style"] == face["style"]), None)
                if duplicate is None:
                    entry["faces"].append(face)
                elif "src" in face and "src" not in duplicate:
                    entry["faces"][entry["faces"].index(duplicate)] = face
            except Exception as error:
                # A malformed outline/layout table can prevent conversion while
                # the font is still usable as an installed Windows font.
                if fallback:
                    family_id, family, face, full, postscript = fallback
                    face["local"] = list(dict.fromkeys([full, postscript]))
                    entry = families.setdefault(family_id, {"id": family_id, "label": family, "faces": []})
                    if not any(f["weight"] == face["weight"] and f["style"] == face["style"] for f in entry["faces"]):
                        entry["faces"].append(face)
                errors.append({"file": path.name, "face": index, "error": str(error), "fallback": "local" if fallback else "skipped"})
            finally:
                if font:
                    font.close()

catalog = sorted(families.values(), key=lambda f: f["label"].casefold())
for entry in catalog:
    entry["localOnly"] = not any("src" in face for face in entry["faces"])
used_files = {face["src"].split("/")[-1] for entry in catalog for face in entry["faces"] if "src" in face}
for generated in OUTPUT.glob("*.woff"):
    if generated.name not in used_files and generated.resolve().parent == OUTPUT.resolve():
        generated.unlink()
(ROOT / "src/lib/fonts.generated.json").write_text(json.dumps(catalog, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
report = {"families": len(catalog), "faces": sum(len(f["faces"]) for f in catalog), "localOnly": sum(f["localOnly"] for f in catalog), "bytes": sum(f.stat().st_size for f in OUTPUT.glob("*.woff")), "errors": errors}
(ROOT / "tmp/font-import-report.json").write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding="utf-8")
print(json.dumps({k: v if k != "errors" else len(v) for k, v in report.items()}, ensure_ascii=True))
