#!/usr/bin/env python3
"""
Script để xóa toàn bộ docstring (multiline comments bắt đầu bằng triple quotes) trong file Python
"""

import ast
import os

def remove_docstrings_from_file(file_path):
    """
    Xóa docstrings khỏi file Python bằng cách parse AST và loại bỏ docstring nodes
    """
    with open(file_path, 'r', encoding='utf-8') as f:
        source_code = f.read()

    try:
        # Parse code thành AST
        tree = ast.parse(source_code)

        # Class để visit và remove docstrings
        class DocstringRemover(ast.NodeTransformer):
            def visit_FunctionDef(self, node):
                # Xóa docstring của function
                node.body = [stmt for stmt in node.body if not (isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Str))]
                return self.generic_visit(node)

            def visit_ClassDef(self, node):
                # Xóa docstring của class
                node.body = [stmt for stmt in node.body if not (isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Str))]
                return self.generic_visit(node)

            def visit_Module(self, node):
                # Xóa docstring của module (nếu có)
                node.body = [stmt for stmt in node.body if not (isinstance(stmt, ast.Expr) and isinstance(stmt.value, ast.Str))]
                return self.generic_visit(node)

        # Áp dụng transformer
        remover = DocstringRemover()
        new_tree = remover.visit(tree)

        # Convert AST trở lại code
        new_code = ast.unparse(new_tree)

        # Ghi lại file
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_code)

        print(f"✅ Đã xóa docstrings khỏi {file_path}")
        print(f"📊 Kích thước file ban đầu: {len(source_code)} ký tự")
        print(f"📊 Kích thước file sau khi xóa: {len(new_code)} ký tự")
        print(f"📊 Đã xóa: {len(source_code) - len(new_code)} ký tự")

    except SyntaxError as e:
        print(f"❌ Lỗi syntax trong file {file_path}: {e}")
        return False
    except Exception as e:
        print(f"❌ Lỗi khi xử lý file {file_path}: {e}")
        return False

    return True

if __name__ == "__main__":
    # Đường dẫn đến file cần xử lý
    file_path = "ecommerce_chatbot.py"

    if not os.path.exists(file_path):
        print(f"❌ File {file_path} không tồn tại!")
        exit(1)

    print(f"🔄 Đang xử lý file: {file_path}")
    success = remove_docstrings_from_file(file_path)
    if success:
        print("🎉 Hoàn thành!")
    else:
        print("❌ Có lỗi xảy ra!")