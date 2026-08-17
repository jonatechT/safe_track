import urllib.request
import json

with open("use-case-diagram.mmd", "r", encoding="utf-8") as f:
    graph = f.read()

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    "Content-Type": "text/plain"
}

req = urllib.request.Request(
    "https://kroki.io/mermaid/png",
    data=graph.encode("utf-8"),
    headers=headers
)

with urllib.request.urlopen(req, timeout=60) as resp:
    data = resp.read()

with open("use-case-diagram.png", "wb") as f:
    f.write(data)

print(f"OK: use-case-diagram.png généré ({len(data)} octets)")