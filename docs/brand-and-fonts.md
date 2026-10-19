# 品牌与字体维护

顶部 DL 是临时文字标识，不是正式实验室 Logo。管理员日后可在 `_config.yaml` 设置可选的 `logo: images/正式文件名.svg`（或 PNG）以替换；无需改模板或 CMS。留空、图片加载失败时显示 DL。请先取得正式标识的使用授权。

导航三栏在 1100px 以下折叠，语言按钮始终独立可见。顶部容器最高 1360px，手机安全边距 20px；新闻和论文正文保持原有阅读宽度。

字体通过现有 Google Fonts 接入，一次样式请求，`display=swap`，中文使用服务提供的 Unicode 范围子集。英文与数字优先 Inter，中文 Noto Sans SC；服务不可用时使用系统字体。仅请求常用正常字重，不打包字体文件，不新增字体服务。

上游许可证：[Inter SIL OFL 1.1](https://github.com/rsms/inter/blob/master/LICENSE.txt)、[Noto Sans CJK SIL OFL 1.1](https://github.com/notofonts/noto-cjk/blob/main/Sans/LICENSE)。现有 Roboto Mono 仅用于代码。若以后自行托管字体，需随文件保留相应版权及许可证，不应直接复制来源不明的字体。

首页轮播继续复用现有新闻过滤和控制脚本。标题最多 900px，长标题自然增高；背景图片失效时回退深蓝。不要为排版修改真实新闻内容或发布状态。
