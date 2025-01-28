#!/usr/bin/env python3
import os
import sqlite3
import urllib.request
import subprocess
from pathlib import Path

# 在迁移到 postgreSQL 之前先顶着 SQLite 用，唉
def ensure_directory(path):
    """确保目录存在，如果不存在则创建"""
    if not path.exists():
        path.mkdir(parents=True, exist_ok=True)

def download_database():
    print('Starting database sync...')
    success = False
    
    # 获取项目根目录
    root_dir = Path(__file__).parent.parent
    remote_url = 'https://r2.cosine.ren/data.db'
    prisma_dir = root_dir / 'prisma'
    local_path = prisma_dir / 'dev.db'
    temp_path = prisma_dir / 'temp.db'
    
    # 确保prisma目录存在
    ensure_directory(prisma_dir)
    
    try:
        # 下载数据库文件
        print('Downloading database...')
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br',
            'Connection': 'keep-alive'
        }
        req = urllib.request.Request(remote_url, headers=headers)
        with urllib.request.urlopen(req) as response, open(temp_path, 'wb') as out_file:
            out_file.write(response.read())
        
        # 验证SQLite文件
        print('Validating database file...')
        try:
            conn = sqlite3.connect(temp_path)
            cursor = conn.cursor()
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
            cursor.close()
            conn.close()
        except sqlite3.Error as e:
            print('Error: Not a valid SQLite database')
            os.unlink(temp_path)
            return
        
        # 替换文件
        if local_path.exists():
            print('Removing old database file...')
            os.unlink(local_path)
        
        print('Installing new database file...')
        os.rename(temp_path, local_path)
        print('Database updated successfully')
        success = True
        
    except urllib.error.URLError as e:
        print(f'Error downloading database: {e}')
        if temp_path.exists():
            os.unlink(temp_path)
    except Exception as e:
        print(f'Unexpected error: {e}')
        if temp_path.exists():
            os.unlink(temp_path)
            
    # 如果数据库更新成功，重启图库网站服务
    if success:
        print('Restarting next service...')
        try:
            subprocess.run(['npm', 'run', 'docker:up'], check=True)
            print('Next service restarted successfully')
        except subprocess.CalledProcessError as e:
            print(f'Error restarting next service: {e}')
        except Exception as e:
            print(f'Unexpected error while restarting next service: {e}')

if __name__ == '__main__':
    download_database() 