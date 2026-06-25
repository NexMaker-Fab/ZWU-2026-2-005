import os
import json
import sys

def check_content_json():
    path = "data/content.json"
    if not os.path.exists(path):
        print(f"[ERROR] {path} not found.")
        return False
        
    try:
        with open(path, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"[ERROR] Failed to parse {path}. JSON is corrupted: {e}")
        return False

    pages = data.get("pages", [])
    success = True

    # 1. Check for absolute image paths
    for page in pages:
        page_id = page.get("id", "unknown")
        for idx, block in enumerate(page.get("blocks", [])):
            if block.get("type") == "image":
                src = block.get("src", "")
                if src.startswith("/"):
                    print(f"[FAIL] Absolute image path found in page '{page_id}' block {idx}: '{src}'")
                    success = False

    # 2. Check for mock/placeholder homework pages
    homework_pages = {
        "homework-project-manage": "项目管理",
        "homework-arduino-app": "Arduino应用",
        "homework-iot-interaction": "IoT交互"
    }
    for hw_id, name in homework_pages.items():
        page = next((p for p in pages if p.get("id") == hw_id), None)
        if not page:
            print(f"[FAIL] Homework page '{hw_id}' ({name}) is missing from content.json.")
            success = False
        else:
            blocks = page.get("blocks", [])
            if len(blocks) < 20:
                print(f"[FAIL] Homework page '{hw_id}' ({name}) has only {len(blocks)} blocks. It looks like a placeholder/mock page.")
                success = False

    # 3. Check for deleted project blue prince
    if any(p.get("id") == "project-blue-prince" for p in pages):
        print("[FAIL] Deleted project 'project-blue-prince' is still present in content.json.")
        success = False

    # 4. Check for member purple name correction
    purple = next((p for p in pages if p.get("id") == "member-purple"), None)
    if purple:
        title = purple.get("title", "")
        if "周波" in title:
            print(f"[FAIL] Member Purple title is still '{title}' (should be 周紫晗/Purple).")
            success = False

    return success

def check_storage_js():
    path = "js/storage.js"
    if not os.path.exists(path):
        print(f"[ERROR] {path} not found.")
        return False

    try:
        with open(path, "r", encoding="utf-8") as f:
            content = f.read()
    except Exception as e:
        print(f"[ERROR] Failed to read {path}: {e}")
        return False

    required_keywords = [
        "hasAbsoluteImages",
        "hasMockHomework",
        "hasOldPurple",
        "localStorage.removeItem(STORAGE_KEY)"
    ]
    success = True
    for kw in required_keywords:
        if kw not in content:
            print(f"[FAIL] Self-healing keyword '{kw}' is missing from {path}.")
            success = False

    return success

def main():
    print("==================================================")
    print("Running Cache Self-Healing & Content Verifier...")
    print("==================================================")
    
    content_ok = check_content_json()
    storage_ok = check_storage_js()
    
    print("--------------------------------------------------")
    if content_ok and storage_ok:
        print("[PASS] Success: All self-healing and path validation checks passed!")
        sys.exit(0)
    else:
        print("[FAIL] Failure: Self-healing validation failed. Please fix the issues above before committing.")
        sys.exit(1)

if __name__ == "__main__":
    main()
