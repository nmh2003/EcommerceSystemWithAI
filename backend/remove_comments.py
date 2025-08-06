#!/usr/bin/env python3
"""
Script để xóa toàn bộ comment (dòng bắt đầu bằng #) trong file ecommerce_chatbot.py
"""

import os

def remove_comments_from_file(file_path):
    """
    Xóa các dòng comment khỏi file Python
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()

    # Lọc ra các dòng không phải comment
    # Một dòng được coi là comment nếu sau khi strip whitespace, bắt đầu bằng #
    filtered_lines = []
    for line in lines:
        stripped = line.strip()
        if not stripped.startswith('#'):
            filtered_lines.append(line)

    # Ghi lại file
    with open(file_path, 'w', encoding='utf-8') as f:
        f.writelines(filtered_lines)

    print(f"✅ Đã xóa comments khỏi {file_path}")
    print(f"📊 Số dòng ban đầu: {len(lines)}")
    print(f"📊 Số dòng sau khi lọc: {len(filtered_lines)}")
    print(f"📊 Đã xóa: {len(lines) - len(filtered_lines)} dòng comment")

if __name__ == "__main__":
    # Đường dẫn đến file cần xử lý
    file_path = "ecommerce_chatbot.py"

    if not os.path.exists(file_path):
        print(f"❌ File {file_path} không tồn tại!")
        exit(1)

    print(f"🔄 Đang xử lý file: {file_path}")
    remove_comments_from_file(file_path)
    print("🎉 Hoàn thành!")