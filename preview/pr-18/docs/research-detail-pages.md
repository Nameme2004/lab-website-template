# 研究方向详情页维护

首页、Research 总览和两个详情页共用 `_data/research.yaml`，无需重复填写科研正文。

- 在 Pages CMS 的 Research 中编辑现有方向。
- “Homepage summary”是首页及详情页页眉的简短摘要；“Full introduction”是总览和详情页“研究目标”的完整介绍。
- 中英文分别填写，中文缺失继续回退英文。
- 新增的 Internal page ID 是稳定网址关联标识。已发布方向的 ID 不随标题或排序改变：`novel-disease-models`、`microphysiological-ai-drug-discovery`。
- 详情页“研究背景与建设阶段”读取同一个 Research 页面介绍，说明方向确认不代表模型、平台或成果已经建成。
- 本轮没有增加新的科研事实或改变 confirmed。将来增加第三个方向的独立网址时，由管理员创建对应页面；没有详情页的方向仍回到 Research 总览。

CMS 保存和部署流程保持不变。不要删除已有非空字段或修改内部 ID；GitHub 权限、分支和页面路由由管理员维护。
