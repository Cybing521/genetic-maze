# 安装和配置指南

## 系统要求

- **Python**: 3.7 或更高版本
- **操作系统**: Windows, Linux, 或 macOS
- **内存**: 至少 512MB RAM
- **磁盘空间**: 至少 50MB

## 安装步骤

### 1. 克隆或下载项目

如果使用Git:
```bash
git clone <repository-url>
cd program2
```

或者直接解压下载的项目文件。

### 2. 检查Python版本

```bash
python --version
# 或
python3 --version
```

确保版本 >= 3.7

### 3. 创建虚拟环境（推荐）

**Linux/macOS**:
```bash
python3 -m venv venv
source venv/bin/activate
```

**Windows**:
```bash
python -m venv venv
venv\Scripts\activate
```

### 4. 安装依赖包

```bash
pip install -r requirements.txt
```

或者手动安装:
```bash
pip install numpy matplotlib
```

### 5. 验证安装

运行简单示例:
```bash
python example_simple.py
```

如果看到迷宫和进度输出，说明安装成功！

## 常见问题

### Q1: pip install 失败

**问题**: 提示权限错误或网络问题

**解决方案**:
```bash
# 使用用户目录安装
pip install --user -r requirements.txt

# 或使用国内镜像
pip install -i https://pypi.tuna.tsinghua.edu.cn/simple -r requirements.txt
```

### Q2: matplotlib无法显示图形

**问题**: 运行时提示 "no display name" 或类似错误

**解决方案**:

**Linux**: 确保安装了图形界面支持
```bash
# Ubuntu/Debian
sudo apt-get install python3-tk

# 或修改matplotlib backend
export MPLBACKEND=TkAgg
```

**Windows**: 通常不会有此问题

**macOS**: 可能需要安装 tkinter
```bash
brew install python-tk
```

### Q3: 中文显示为方块

**问题**: 图表中的中文标签显示为方块

**解决方案1**: 修改 visualizer.py，使用支持的字体
```python
# 在文件顶部添加
import matplotlib.pyplot as plt
plt.rcParams['font.sans-serif'] = ['Arial Unicode MS']  # macOS
# 或
plt.rcParams['font.sans-serif'] = ['Microsoft YaHei']    # Windows
```

**解决方案2**: 使用英文标签（修改代码中的中文字符串）

### Q4: NumPy安装失败

**问题**: 编译错误或依赖问题

**解决方案**:
```bash
# 使用预编译的二进制包
pip install --only-binary :all: numpy

# 或升级pip和setuptools
pip install --upgrade pip setuptools wheel
pip install numpy
```

### Q5: 虚拟环境激活失败

**Windows PowerShell**:
```bash
# 如果提示执行策略错误
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

## 配置选项

### matplotlib 后端配置

如果需要保存图片而不显示:
```python
# 在代码开头添加
import matplotlib
matplotlib.use('Agg')  # 非交互式后端
```

### 性能优化

对于大规模迷宫，可以:
1. 增加可用内存
2. 使用Python优化器（如PyPy）
3. 启用多进程（需要修改代码）

## 卸载

### 删除虚拟环境

```bash
# 停用虚拟环境
deactivate

# 删除虚拟环境目录
rm -rf venv  # Linux/macOS
rd /s /q venv  # Windows
```

### 卸载依赖包

```bash
pip uninstall numpy matplotlib -y
```

## 开发环境设置

如果你想进行开发:

### 1. 安装开发工具

```bash
pip install pytest pytest-cov flake8 black mypy
```

### 2. 代码检查

```bash
# 代码风格检查
flake8 src/ tests/

# 代码格式化
black src/ tests/

# 类型检查
mypy src/
```

### 3. 运行测试

```bash
cd tests
python run_tests.py

# 或使用pytest
pytest tests/ -v
```

## IDE配置建议

### VS Code

推荐扩展:
- Python
- Pylance
- Python Docstring Generator

配置 `.vscode/settings.json`:
```json
{
    "python.linting.enabled": true,
    "python.linting.flake8Enabled": true,
    "python.formatting.provider": "black",
    "python.testing.pytestEnabled": true
}
```

### PyCharm

1. 打开项目目录
2. 配置Python解释器（使用虚拟环境）
3. 标记 `src` 为源代码根目录
4. 运行配置：设置工作目录为项目根目录

## 下一步

安装完成后，你可以:

1. 阅读 [README.md](README.md) 了解项目详情
2. 查看 [QUICKSTART.md](docs/QUICKSTART.md) 快速上手
3. 运行 `python example_simple.py` 查看演示
4. 运行 `python tests/run_tests.py` 验证功能
5. 探索 `src/main.py` 的不同模式

## 技术支持

如果遇到其他问题:
1. 检查Python和依赖包版本
2. 查看错误信息并搜索解决方案
3. 提交issue到项目仓库
4. 参考官方文档:
   - [NumPy文档](https://numpy.org/doc/)
   - [Matplotlib文档](https://matplotlib.org/stable/index.html)

---

**最后更新**: 2025-10-27

