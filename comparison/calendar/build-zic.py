"""Build pinned IANA zic in a new directory. Never install or change host data."""
import hashlib
import json
from pathlib import Path
import subprocess
import sys
import tarfile

EXPECTED = (
    "2f5c9f7fe29e6b8cb863583667884b8ce17b0a485355a054b591c6bdfcd81791",
    "0cb2aa8e333c3dc049badc42a0c61f21987b8cd44e107fa900bad764aacc7767",
)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def main():
    if len(sys.argv) != 4:
        raise SystemExit("Usage: build-zic.py tzcode2026d.tar.gz tzdata2026d.tar.gz NEW-output-directory")
    code, data, output = map(lambda value: Path(value).resolve(), sys.argv[1:])
    if output.exists():
        raise SystemExit("Output must be a new directory.")
    for archive, expected in zip((code, data), EXPECTED):
        if digest(archive.read_bytes()) != expected:
            raise SystemExit("Archive differs from pinned IANA 2026d: " + archive.name)
    output.mkdir(parents=True)
    for archive in (code, data):
        with tarfile.open(archive, "r:gz") as package:
            package.extractall(output, filter="data")
    if (output / "version").read_text().strip() != "2026d":
        raise SystemExit("Unexpected source version.")
    inputs = {path.relative_to(output).as_posix(): digest(path.read_bytes())
              for path in sorted(output.rglob("*")) if path.is_file()}
    # Only the compiler target; no install, tzdata install or host paths are written.
    command = ["make", "zic"]
    result = subprocess.run(command, cwd=output, capture_output=True, text=True)
    version = subprocess.run([str(output / "zic"), "--version"], capture_output=True, text=True) if result.returncode == 0 else None
    cc = subprocess.run(["cc", "--version"], capture_output=True, text=True)
    report = {
        "archives": {"tzcode2026d.tar.gz": EXPECTED[0], "tzdata2026d.tar.gz": EXPECTED[1]},
        "inputs": inputs, "command": command, "exitCode": result.returncode,
        "stdout": result.stdout, "stderr": result.stderr, "ccVersion": cc.stdout,
        "compilerVersion": version.stdout.strip() if version else None,
        "compilerSha256": digest((output / "zic").read_bytes()) if version else None,
        "limitations": ["Pinned IANA source; platform C toolchain is recorded, not hermetic.",
                        "No system installation or application integration."]
    }
    (output / "compiler-manifest.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({key: report[key] for key in ("exitCode", "compilerVersion", "compilerSha256")}))
    if result.returncode or not version or version.returncode or version.stdout.strip() != "zic (tzcode) 2026d":
        raise SystemExit("Compiler build/version check failed; inspect compiler-manifest.json.")


if __name__ == "__main__":
    main()
