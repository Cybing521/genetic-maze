# 文档管理规则说明

## 📝 规则制定背景

为了保持项目文档的组织性和可维护性，特制定此文档管理规范。

---

## 📋 核心规则

### 1. 文档位置规范

#### Python项目文档
```
program2/
└── docs/                    ✅ 统一存放位置
    ├── QUICKSTART.md
    ├── INSTALL.md
    ├── PROJECT_SUMMARY.md
    └── ...
```

#### Web项目文档
```
program2/web/
├── docs/                    ✅ 优先存放位置（如果存在）
│   ├── FEATURE_COMPLETE_V2.1.md
│   └── ...
└── README.md               ✅ 主文档保留在根目录
```

#### 禁止的做法 ❌
```
program2/
├── TEMP_NOTES.md           ❌ 禁止在项目根目录创建临时文档
├── TODO_LIST.md            ❌ 
└── RANDOM_DOC.md           ❌
```

---

### 2. 文档提交规则 ⭐ 强制要求

#### 必须提交到Git
**所有文档更新（无论大小）必须提交到Git**

理由：
- ✅ 文档是项目的重要组成部分
- ✅ 保证团队成员看到最新文档
- ✅ 文档历史可追溯
- ✅ 防止文档丢失

#### 提交示例
```bash
# 1. 添加所有文档更改
git add docs/
git add web/docs/
git add README.md

# 2. 提交时使用清晰的commit message
git commit -m "docs: 添加3D可视化功能说明"
git commit -m "docs: 更新快速开始指南"
git commit -m "docs: 修复安装步骤错误"

# 3. 推送到远程仓库
git push
```

#### Commit Message规范
```
docs: [描述]

例如：
- docs: 添加新功能文档
- docs: 更新API说明
- docs: 修复文档错误
- docs: 重构文档结构
```

---

### 3. 文档命名规范

#### 推荐的命名方式

**方式1: 大写+下划线** (推荐用于重要文档)
```
FEATURE_COMPLETE.md
API_REFERENCE.md
INSTALLATION_GUIDE.md
QUICK_START.md
```

**方式2: 小写+连字符** (推荐用于普通文档)
```
feature-guide.md
api-reference.md
installation.md
quick-start.md
```

#### 命名原则
- ✅ 描述性强，见名知意
- ✅ 使用英文命名
- ✅ 避免空格和特殊字符
- ✅ 保持一致性（在同一项目中选择一种风格）

#### 避免的命名 ❌
```
doc1.md                    ❌ 无意义
新文档.md                   ❌ 中文命名
my document.md             ❌ 包含空格
temp_notes_2023.md         ❌ 临时性命名
```

---

### 4. 文档清理规则

#### 定期检查
- 每月检查一次文档目录
- 删除已过期的文档
- 归档不再使用的文档

#### 临时文档处理
```bash
# 临时文档使用后应该：

# 方案1: 移动到docs目录
mv TEMP_NOTES.md docs/FEATURE_NOTES.md

# 方案2: 删除
rm TEMP_NOTES.md
```

#### 文档版本管理
```
docs/
├── FEATURE_V1.md          ❌ 避免版本号在文件名中
└── FEATURE.md             ✅ 使用Git历史管理版本
```

---

## 🔧 Git配置建议

### .gitignore 示例
```gitignore
# 忽略这些
venv/
__pycache__/
*.pyc
*.pyo
node_modules/
.DS_Store

# 不要忽略这些！
!*.md                      # 文档文件必须提交
!docs/                     # 文档目录必须提交
```

---

## 📊 文档分类指南

### 必须文档
- ✅ `README.md` - 项目主文档
- ✅ `QUICKSTART.md` - 快速开始
- ✅ `INSTALL.md` - 安装指南

### 推荐文档
- 📝 `API_REFERENCE.md` - API文档
- 📝 `CONTRIBUTING.md` - 贡献指南
- 📝 `CHANGELOG.md` - 更新日志
- 📝 `FAQ.md` - 常见问题

### 项目特定文档
- 📝 `ARCHITECTURE.md` - 架构说明
- 📝 `OPTIMIZATION_SUMMARY.md` - 优化总结
- 📝 `FEATURE_COMPLETE.md` - 功能完成报告

---

## ✅ 最佳实践

### DO ✅
1. **立即提交文档更新**
   ```bash
   # 编辑文档后立即提交
   git add docs/NEW_FEATURE.md
   git commit -m "docs: add new feature documentation"
   git push
   ```

2. **保持文档同步更新**
   ```
   更新代码 → 同时更新文档 → 一起提交
   ```

3. **使用清晰的目录结构**
   ```
   docs/
   ├── getting-started/
   ├── api/
   ├── tutorials/
   └── advanced/
   ```

4. **在README中链接其他文档**
   ```markdown
   - [Quick Start](docs/QUICKSTART.md)
   - [API Reference](docs/API_REFERENCE.md)
   ```

### DON'T ❌
1. ❌ 文档只保存在本地不提交
2. ❌ 在根目录积累大量文档
3. ❌ 使用无意义的文档命名
4. ❌ 忘记更新过时的文档
5. ❌ 将临时笔记当作正式文档

---

## 🎯 检查清单

每次创建或更新文档时，检查：

- [ ] 文档放在正确的目录（docs/ 或 web/docs/）
- [ ] 文档命名符合规范
- [ ] 使用了清晰的commit message
- [ ] 已经提交到Git
- [ ] 已经推送到远程仓库
- [ ] 在主README中有链接（如果是重要文档）
- [ ] 删除了过期的临时文档

---

## 📞 违规处理

如果发现违反文档管理规则的情况：

1. **根目录临时文档**
   ```bash
   # 立即移动到docs或删除
   mv TEMP.md docs/FEATURE.md
   git add docs/FEATURE.md
   git commit -m "docs: organize documentation structure"
   ```

2. **未提交的文档**
   ```bash
   # 立即提交
   git add docs/
   git commit -m "docs: commit missing documentation"
   git push
   ```

3. **命名不规范的文档**
   ```bash
   # 重命名
   git mv docs/doc1.md docs/FEATURE_GUIDE.md
   git commit -m "docs: rename documentation for clarity"
   ```

---

## 🚀 实施时间线

- **2025-10-28**: 规则制定并添加到README.md
- **立即生效**: 所有新文档必须遵循此规则
- **整理期限**: 现有文档在2周内完成整理

---

## 📚 相关资源

- [项目README](../README.md)
- [Web项目README](../web/README.md)
- [Git Commit规范](https://www.conventionalcommits.org/)

---

**版本**: v1.0  
**制定日期**: 2025-10-28  
**生效日期**: 立即  
**更新**: 随项目发展持续更新

