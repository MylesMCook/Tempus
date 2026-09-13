"""Compile the pinned IANA archive into a new task-local directory. No downloads."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tarfile

EXPECTED = "0cb2aa8e333c3dc049badc42a0c61f21987b8cd44e107fa900bad764aacc7767"
SOURCES = ("africa", "antarctica", "asia", "australasia", "europe", "northamerica",
           "southamerica", "etcetera", "backward")


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    if len(sys.argv) not in (4, 5) or (len(sys.argv) == 5 and sys.argv[4] not in ('fat', 'slim')):
        raise SystemExit("Usage: build-tzif.py archive.tar.gz NEW-output-directory /absolute/zic [fat|slim]")
    archive, output, compiler = map(lambda value: Path(value).resolve(), sys.argv[1:4])
    format = sys.argv[4] if len(sys.argv) == 5 else 'fat'
    archive_hash = digest(archive.read_bytes())
    if archive_hash != EXPECTED:
        raise SystemExit("Archive is not the pinned IANA 2026d release.")
    if output.exists():
        raise SystemExit("Output must be a new directory; existing evidence is never overwritten.")
    compiler_hash = digest(compiler.read_bytes())
    compiler_manifest_path = compiler.parent / "compiler-manifest.json"
    compiler_manifest_hash = None
    if compiler_manifest_path.is_file():
        compiler_manifest_bytes = compiler_manifest_path.read_bytes()
        compiler_manifest = json.loads(compiler_manifest_bytes)
        if compiler_manifest.get('compilerSha256') != compiler_hash or compiler_manifest.get('compilerVersion') != 'zic (tzcode) 2026d':
            raise SystemExit('Compiler differs from its build manifest.')
        compiler_manifest_hash = digest(compiler_manifest_bytes)
    # Read exact regular members only; never extract archive-controlled paths.
    with tarfile.open(archive, "r:gz") as package:
        sources = {}
        for name in (*SOURCES, "version", "LICENSE"):
            member = package.getmember(name)
            if not member.isfile() or member.size > 2_000_000:
                raise SystemExit("Unexpected archive member: " + name)
            sources[name] = package.extractfile(member).read()
    if sources["version"].strip() != b"2026d":
        raise SystemExit("Unexpected archive revision.")
    output.mkdir(parents=True)
    source_dir = output / "source"
    source_dir.mkdir()
    for name, data in sources.items():
        (source_dir / name).write_bytes(data)
    compiled = output / "compiled"
    compiled.mkdir()
    command = [str(compiler), "-b", format, "-d", str(compiled),
               *[str(source_dir / name) for name in SOURCES]]
    result = subprocess.run(command, capture_output=True, text=True)
    report = {
        "revision": "2026d", "format": format, "archiveSha256": archive_hash,
        "compiler": str(compiler), "compilerSha256": compiler_hash,
        "compilerBuildManifestSha256": compiler_manifest_hash,
        "command": command, "exitCode": result.returncode,
        "stdout": result.stdout, "stderr": result.stderr,
        "sourceHashes": {name: digest(data) for name, data in sources.items()},
        "files": {path.relative_to(compiled).as_posix(): digest(path.read_bytes())
                  for path in sorted(compiled.rglob("*")) if path.is_file()},
        "limitations": ["Compiler-source manifest linked; platform C toolchain is not hermetic." if compiler_manifest_hash else "Compiler binary is identified without a compiler-source manifest.",
                        "Development artifact only; not included in the application or SDK."]
    }
    (output / "build-manifest.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"exitCode": result.returncode, "files": len(report["files"]),
                      "manifest": str(output / "build-manifest.json")}))
    raise SystemExit(result.returncode)


if __name__ == "__main__":
    main()
