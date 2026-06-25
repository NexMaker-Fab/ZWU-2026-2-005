/**
 * Internationalization (i18n) Module
 */

export const translations = {
  en: {
    // Sidebar
    'search.placeholder': 'Search pages...',
    'sidebar.pages': 'Pages',
    'sidebar.add_subpage': 'Add sub-page',
    'sidebar.theme.dark': 'Dark',
    'sidebar.theme.light': 'Light',
    'sidebar.settings': 'Settings',

    // Editor & Toolbar
    'editor.add.block': 'Add a block',
    'save.local': 'Save to Local',
    'save.github': 'Save to GitHub',
    'save.status.ready': 'Ready',
    'save.status.unsaved': 'Unsaved changes...',
    'save.status.saving': 'Saving to GitHub...',
    'save.status.saved': 'Saved to GitHub ✓',
    'save.status.failed': 'Save failed',
    'save.status.autosaved': 'Auto-saved locally',

    // Modal
    'settings.title': 'Settings',
    'settings.owner': 'Repository Owner',
    'settings.owner.hint': 'GitHub username or organization name',
    'settings.repo': 'Repository Name',
    'settings.repo.hint': 'The repository where your content is stored',
    'settings.branch': 'Branch',
    'settings.token': 'GitHub Personal Access Token',
    'settings.token.hint': '⚠️ Token represents full access. Stored in localStorage. Needs \'repo\' scope.',
    'settings.cancel': 'Cancel',
    'settings.save': 'Save Settings',

    // Slash menu
    'menu.title': 'Basic Blocks',
    'menu.text': 'Text',
    'menu.text.desc': 'Plain text paragraph',
    'menu.h1': 'Heading 1',
    'menu.h1.desc': 'Large section heading',
    'menu.h2': 'Heading 2',
    'menu.h2.desc': 'Medium section heading',
    'menu.h3': 'Heading 3',
    'menu.h3.desc': 'Small section heading',
    'menu.image': 'Image',
    'menu.image.desc': 'Upload or embed an image',
    'menu.quote': 'Quote',
    'menu.quote.desc': 'Add a block quote',
    'menu.code': 'Code Block',
    'menu.code.desc': 'Write code blocks',
    'menu.bullet': 'Bullet List',
    'menu.bullet.desc': 'Simple bulleted list',
    'menu.todo': 'To-do List',
    'menu.todo.desc': 'List with checkboxes',
    'menu.divider': 'Divider',
    'menu.divider.desc': 'Horizontal line separator',
    'export.markdown': 'Export to Markdown',

    // Placeholders
    'placeholder.page': 'Untitled',
    'placeholder.heading': 'Heading ',
    'placeholder.paragraph': 'Type \'/\' for commands...',
    'placeholder.caption': 'Write a caption...',
    'placeholder.image.upload': 'Click to upload an image or paste a URL below',
    'placeholder.image.url': 'Paste image URL and press Enter',
    'placeholder.quote': 'Empty quote...',
    'placeholder.code': '// Write code here...',
    'placeholder.bullet': 'List item...',
    'placeholder.todo': 'To-do item...',

    // JS alerts / Toasts
    'toast.saved.local': 'Content downloaded as content.json',
    'toast.github.needs.config': 'Please configure GitHub settings first',
    'toast.settings.saved': 'GitHub settings saved',
    'toast.confirm.delete': 'Delete "{title}"?',
    'toast.delete_page': 'Delete page',
    'toast.import.success': '✅ Import successful',
    'toast.import.failed': 'Import failed: {message}',

    // Tooltips
    'sidebar.toggle': 'Toggle sidebar',
    'sidebar.new_page': 'New page',
    'sidebar.theme.toggle': 'Toggle theme',
    'sidebar.settings.tooltip': 'Settings',
    'topbar.menu': 'Menu',
    'editor.change_icon': 'Change icon',
    'toolbar.bold': 'Bold (Ctrl+B)',
    'toolbar.italic': 'Italic (Ctrl+I)',
    'toolbar.underline': 'Underline (Ctrl+U)',
    'toolbar.h1': 'Heading 1',
    'toolbar.h2': 'Heading 2',
    'toolbar.h3': 'Heading 3',
    'toolbar.p': 'Paragraph',

    // Misc

    // Navigation
    'nav.title': 'Team Homework Blog',
    'nav.intro': 'Intro',
    'nav.team': 'Team',
    'nav.homework': 'Homework',
    'nav.project': 'Final Project',

    // Author / Identity
    'welcome.title': '👋 Welcome to Team Homework Blog',
    'welcome.desc': 'Please enter your display name so your teammates can identify your contributions.',
    'welcome.label': 'Your Name',
    'welcome.placeholder': 'e.g. Zhang San',
    'welcome.confirm': 'Get Started',
    'editor.layout': 'Display Layout:',
    'editor.layout.grid': 'Grid (Cards)',
    'editor.layout.timeline': 'Timeline (Milestones)',
    'editor.layout.list': 'List (Vertical)',
    'editor.toc.title': 'Outline',
    'landing.badge': '✨ Team Homework Blog v1.2',
    'landing.subtitle': 'A lightweight, modular, collaborative showcase designed for team projects.',
    'landing.action.enter': 'Admin Workspace',
    'landing.action.browse': 'Browse Projects',
    'landing.action.cms': 'Manage Wiki',
    'landing.header.workspace': 'Workspace',
    'landing.section.projects': 'Project Showcase',
    'landing.section.team': 'Team Members',
    'landing.section.timeline': 'Project Timeline',
    'landing.section.onboarding': 'Developer Setup & Guides',
    'landing.team.title': 'Project Contributors',
    'landing.team.desc': 'Special thanks to the team members:',
    'landing.team.role.lead': 'Project Lead / Core Developer',
    'landing.team.role.frontend': 'Frontend Architect',
    'landing.team.role.designer': 'UI / UX Designer',
    'landing.team.role.ai': 'AI Pair Programmer',
    'landing.guide.title': 'Usage Guide',
    'landing.guide.desc': 'Quickly master the core collaborative workflow:',
    'landing.guide.step1.title': 'Block-based Editing',
    'landing.guide.step1.desc': 'Click any text block to edit directly, press Enter to create a new line. Every block is an independent element.',
    'landing.guide.step2.title': 'Slash Commands',
    'landing.guide.step2.desc': 'Type / at the start of a line to bring up the command menu and quickly insert headings, dividers, images, or paragraphs.',
    'landing.guide.step3.title': 'Drag-and-Drop Reordering',
    'landing.guide.step3.desc': 'Hover over any block to reveal the ⠿ handle. Click and drag to reorder blocks.',
    'landing.guide.step4.title': 'GitHub Cloud Sync',
    'landing.guide.step4.desc': 'Configure your GitHub Token and repository in settings (⚙️) to save and sync changes directly.',
    'landing.sync_guide.title': 'Cloud Collaboration Guide',
    'landing.sync_guide.desc': 'Establish a shared GitHub cloud sync loop in just 3 steps to achieve serverless team collaboration:',
    'landing.sync_guide.step1.title': '1. Create Repository',
    'landing.sync_guide.step1.desc': 'The team owner visits <a href="https://github.com/new" target="_blank" class="guide-link">github.com/new</a> to create a new repository. Next, go to <strong>Settings</strong> -> <strong>Collaborators</strong> -> click <strong>Add people</strong> to invite teammates. Members <strong>must</strong> accept the invitation in their email or GitHub notifications to get write permissions.',
    'landing.sync_guide.step2.title': '2. Generate Access Token',
    'landing.sync_guide.step2.desc': 'Each member clicks their avatar -> <strong>Settings</strong> -> <strong>Developer settings</strong> -> <strong>Personal access tokens</strong>:<br>• Recommended: <a href="https://github.com/settings/personal-access-tokens/new" target="_blank" class="guide-link">Fine-grained tokens</a>. Select the target repo, under <strong>Repository permissions</strong> -> <strong>Contents</strong>, select <strong>Read and write</strong>.<br>• Alternative: <a href="https://github.com/settings/tokens/new" target="_blank" class="guide-link">Tokens (classic)</a>. Check the main <strong>repo</strong> scope box.',
    'landing.sync_guide.step3.title': '3. Sync Configuration',
    'landing.sync_guide.step3.desc': 'Click "Enter Wiki", and click ⚙️ <strong>Settings</strong> -> <strong>Sync Config</strong>:<br>• Enter the shared <strong>Owner</strong> (username or org) and <strong>Repo</strong> (repository name).<br>• Enter your personal <strong>Access Token</strong>.<br>• Click <strong>Save Settings</strong>. Finally, click <strong>Save to GitHub</strong> on the top bar to push edits and pull updates instantly!',
    'landing.sync_guide.trouble.title': 'Troubleshooting & Error Guide',
    'landing.sync_guide.err404.title': 'GitHub API Error: Not Found (404)',
    'landing.sync_guide.err404.desc': '<strong>Possible Causes:</strong> Repository name or owner is misspelled, the token does not have access to this repository, or the collaborator has not accepted the repository invitation.<br><strong>Solution:</strong> Verify Owner/Repo spelling; ensure the token scope is valid; collaborators must visit <code>https://github.com/Owner/Repo/invitations</code> to accept the invitation.',
    'landing.sync_guide.err401.title': 'GitHub API Error: Bad credentials (401)',
    'landing.sync_guide.err401.desc': '<strong>Possible Causes:</strong> The Personal Access Token is incorrect, invalid, or has expired.<br><strong>Solution:</strong> Go to Developer Settings, delete the old token, generate a new one, copy it completely, and paste it back into Wiki settings (ensuring no extra whitespace).',
    'landing.sync_guide.err403.title': 'GitHub API Error: Write access denied / Blocked by branch protection (403)',
    'landing.sync_guide.err403.desc': '<strong>Possible Causes:</strong> The token is valid but has no write permissions (Classic token missing <code>repo</code> checkbox, or Fine-grained token missing <code>Contents: Read and write</code>); or the repository\'s main branch has branch protection rules preventing direct pushing.<br><strong>Solution:</strong> Edit token permissions on GitHub; or check the repository settings to adjust branch protection rules temporarily.',
    'landing.sync_guide.errnet.title': 'SSL / Connection Timeout / Network Connect Failure',
    'landing.sync_guide.errnet.desc': '<strong>Possible Causes:</strong> Direct connection to the GitHub API failed or timed out in your local network environment, or SSL handshake failed through some proxy middlewares.<br><strong>Solution:</strong> Check your local network. If using a proxy client, make sure it is in global mode or has rule exceptions for <code>api.github.com</code>; or toggle proxy settings in your local translator proxy settings.',
    'settings.username': 'Display Name',
    'settings.username.placeholder': 'e.g. Zhang San',
    'settings.username.hint': 'Shown as author when you create pages.',
    'page.meta.created_by': 'Created by {author}',
    'page.meta.on': 'on',
    'page.meta.anonymous': 'Anonymous',

    // Trash / Recycle Bin
    'trash.title': 'Trash',
    'trash.hint': 'Deleted pages are kept here for 3 days, then permanently removed.',
    'trash.empty': 'Trash is empty',
    'trash.empty.hint': 'Deleted pages will appear here.',
    'trash.confirm.title': 'Move to Trash?',
    'trash.confirm.desc': 'This page will be moved to the Trash and automatically deleted after 3 days.',
    'trash.confirm.cancel': 'Cancel',
    'trash.confirm.ok': 'Move to Trash',
    'trash.restore': 'Restore',
    'trash.delete.forever': 'Delete Forever',
    'trash.days.left': '{n} day(s) left',
    'trash.by': 'Deleted by {author}',
    'trash.on': '·',
    'trash.forever.confirm': 'Permanently delete "{title}"? This cannot be undone.',

    // Sidebar layout
    'sidebar.favorites': 'Favorites',
    'sidebar.quick.new': 'New Page',
    'sidebar.quick.import': 'Import',
    'sidebar.role': 'Admin',
    'search.clear': 'Clear',
    'status.pages': '{n} pages',
    'status.last_saved': 'Last saved: {time}',
    'status.last_saved.just': 'just now',
    'status.last_saved.min': '{n} min ago',
    'status.last_saved.hour': '{n} hr ago',

    // Settings page
    'settings.back': 'Back',
    'settings.tab.sync': 'Sync Config',
    'settings.tab.trash': 'Trash',
    'settings.tab.preferences': 'Preferences',
    'settings.tab.team': 'Team',
    'settings.sync.desc': 'Configure GitHub repository to sync your content to a remote repo.',
    'pref.theme.title': 'Theme',
    'pref.theme.light': 'Light Mode',
    'pref.theme.dark': 'Dark Mode',
    'pref.lang.title': 'Language',
    'pref.lang.zh': '中文',
    'pref.lang.en': 'English',
    'team.desc': 'Manage team members. Member info will be synced to GitHub.',
    'team.add': 'Add',
    'team.name.placeholder': 'Name',
    'team.role.placeholder': 'Role, e.g. Developer',
    'team.role.default': 'Member',
    'team.remove': 'Remove',
    'team.empty': 'No team members yet. Add one above.',

    // Nested pages
    'toast.subpage_created': 'Sub-page created',

    // Image size
    'toast.image.too_large': 'Image is too large (max 5MB). Please use a smaller image or paste a URL instead.',
    'toast.image.compressed': 'Image was compressed to save space.',

    // Homework Portal
    'homework.sidebar.title': '📝 Assignments',

    // Project Portal
    'project.hero.title': '🤖 Emotional Robot',
    'project.hero.subtitle': 'Arduino-based emotional robot and Web monitoring dashboard',
    'project.sim.title': '📺 Face Simulator',
    'project.sim.desc': 'Real-time rendering of robot\'s OLED screen and emotional feedback:',
    'project.specs.title': '🛠️ Spec Sheets',
    'project.sensors.title': '📊 Telemetry',
    'project.sensor.hr': 'Heart Rate',
    'project.sensor.temp': 'Temperature',
    'project.sensor.stability': 'Stability',
    'project.console.title': '🖥️ Arduino Console'
  },
  zh: {
    // Sidebar
    'search.placeholder': '搜索页面...',
    'sidebar.pages': '所有页面',
    'sidebar.add_subpage': '添加子页面',
    'sidebar.theme.dark': '深色',
    'sidebar.theme.light': '浅色',
    'sidebar.settings': '设置',

    // Editor & Toolbar
    'editor.add.block': '添加下级块',
    'save.local': '保存到本地',
    'save.github': '同步到 GitHub',
    'save.status.ready': '就绪',
    'save.status.unsaved': '有未保存的更改...',
    'save.status.saving': '正在向 GitHub 同步...',
    'save.status.saved': '已同步至 GitHub ✓',
    'save.status.failed': '同步失败',
    'save.status.autosaved': '已自动保存到本地',

    // Modal
    'settings.title': '设置',
    'settings.owner': '仓库所有者 (Owner)',
    'settings.owner.hint': '您的 GitHub 用户名或组织名',
    'settings.repo': '仓库名称 (Repo)',
    'settings.repo.hint': '存储内容的 Github 仓库名',
    'settings.branch': '分支 (Branch)',
    'settings.token': 'GitHub 个人访问令牌 (PAT)',
    'settings.token.hint': '⚠️ Token 代表该仓库完整权限。已升级为保存在本地(localStorage)中长期生效。需要包含 \'repo\' 权限。',
    'settings.cancel': '取消',
    'settings.save': '保存设置',

    // Slash menu
    'menu.title': '基础块',
    'menu.text': '文本',
    'menu.text.desc': '纯文本段落',
    'menu.h1': '标题 1',
    'menu.h1.desc': '一级大标题',
    'menu.h2': '标题 2',
    'menu.h2.desc': '二级中标题',
    'menu.h3': '标题 3',
    'menu.h3.desc': '三级小标题',
    'menu.image': '图片',
    'menu.image.desc': '上传或嵌入网络图片',
    'menu.quote': '引用',
    'menu.quote.desc': '插入段落引用块',
    'menu.code': '代码块',
    'menu.code.desc': '插入多行代码块',
    'menu.bullet': '无序列表',
    'menu.bullet.desc': '插入圆点列表项',
    'menu.todo': '待办事项',
    'menu.todo.desc': '插入带勾选框的待办项',
    'menu.divider': '分隔线',
    'menu.divider.desc': '横向分隔线',
    'export.markdown': '导出为 Markdown',

    // Placeholders
    'placeholder.page': '无标题',
    'placeholder.heading': '标题 ',
    'placeholder.paragraph': '输入 \'/\' 唤出命令菜单...',
    'placeholder.caption': '写一点图片描述...',
    'placeholder.image.upload': '点击上传图片，或在下方输入链接',
    'placeholder.image.url': '输入图片链接并按回车 (Enter)',
    'placeholder.quote': '空引用块...',
    'placeholder.code': '// 在此输入代码...',
    'placeholder.bullet': '列表项...',
    'placeholder.todo': '待办事项...',

    // JS alerts / Toasts
    'toast.saved.local': '内容已下载为 content.json',
    'toast.github.needs.config': '请先完成 GitHub 同步设置',
    'toast.settings.saved': 'GitHub 配置已保存',
    'toast.confirm.delete': '确定要删除 "{title}" 吗？',
    'toast.delete_page': '删除页面',
    'toast.import.success': '✅ 导入成功',
    'toast.import.failed': '导入失败: {message}',

    // Tooltips
    'sidebar.toggle': '收起/展开侧边栏',
    'sidebar.new_page': '新建页面',
    'sidebar.theme.toggle': '切换主题',
    'sidebar.settings.tooltip': '设置',
    'topbar.menu': '菜单',
    'editor.change_icon': '更换图标',
    'toolbar.bold': '加粗 (Ctrl+B)',
    'toolbar.italic': '斜体 (Ctrl+I)',
    'toolbar.underline': '下划线 (Ctrl+U)',
    'toolbar.h1': '一级标题',
    'toolbar.h2': '二级标题',
    'toolbar.h3': '三级标题',
    'toolbar.p': '正文',

    // Misc

    // Navigation
    'nav.title': '团队作业的博客',
    'nav.intro': '介绍页',
    'nav.team': '团队成员',
    'nav.homework': '平时作业',
    'nav.project': '最终项目',

    // Author / Identity
    'welcome.title': '👋 欢迎使用 团队作业的博客',
    'welcome.desc': '请输入您的显示名称，方便队友们识别您的贡献。',
    'welcome.label': '您的姓名',
    'welcome.placeholder': '例如 张三',
    'welcome.confirm': '开始使用',
    'editor.layout': '显示布局:',
    'editor.layout.grid': '网格 (卡片)',
    'editor.layout.timeline': '时间轴 (里程碑)',
    'editor.layout.list': '列表 (垂直)',
    'editor.toc.title': '文章大纲',
    'landing.badge': '✨ 团队作业的博客 v1.2',
    'landing.subtitle': '为团队项目成果与作业展示打造的轻量级、卡片模块化展示博客',
    'landing.action.enter': '管理后台',
    'landing.action.browse': '浏览项目',
    'landing.action.cms': '管理后台',
    'landing.header.workspace': '协作后台',
    'landing.section.projects': '项目成果展示 / Projects Showcase',
    'landing.section.team': '项目构建成员 / Team Members',
    'landing.section.timeline': '开发与项目进展 / Project Progress',
    'landing.section.onboarding': '开发者配置与使用指南 / Developer Setup & Guides',
    'landing.team.title': '项目构建成员',
    'landing.team.desc': '感谢为团队作业展示项目付出心血的小组成员：',
    'landing.team.role.lead': '项目负责人 / 核心开发',
    'landing.team.role.frontend': '前端架构师',
    'landing.team.role.designer': 'UI / 交互设计师',
    'landing.team.role.ai': 'AI 配对程序员',
    'landing.guide.title': '使用指南',
    'landing.guide.desc': '快速掌握团队作业展示的核心协作工作流：',
    'landing.guide.step1.title': '模块化块级编辑',
    'landing.guide.step1.desc': '点击任意文本块即可直接编辑，按 Enter 键换行。每一行都是独立积木，可自由修改。',
    'landing.guide.step2.title': '斜杠命令 (Slash Command)',
    'landing.guide.step2.desc': '在新行输入 / 即可呼出快捷菜单，一键插入标题、分隔线、图片或普通段落。',
    'landing.guide.step3.title': '拖拽手柄排序',
    'landing.guide.step3.desc': '悬停于每一行侧可显现 ⠿ 手柄，长按即可上下拖拽块重新排布内容顺序。',
    'landing.guide.step4.title': 'GitHub 自动云同步',
    'landing.guide.step4.desc': '在设置 (⚙️) 中输入 GitHub Token 及仓库信息后，即可免安装 Git，一键向远端推送更新。',
    'landing.sync_guide.title': '云端协作配置向导',
    'landing.sync_guide.desc': '只需 3 步，即可在团队中建立共同的 GitHub 云端数据同步闭环，实现免安装协同：',
    'landing.sync_guide.step1.title': '1. 共同建库',
    'landing.sync_guide.step1.desc': '团队主导者访问 <a href="https://github.com/new" target="_blank" class="guide-link">github.com/new</a> 创建新仓库。接着在仓库页面进入 <strong>Settings</strong> -> <strong>Collaborators</strong> -> 点击 <strong>Add people</strong> 邀请团队成员。成员<strong>必须</strong>在邮箱或 GitHub 消息通知中接受邀请，才能获得写权限。',
    'landing.sync_guide.step2.title': '2. 创建 Access Token',
    'landing.sync_guide.step2.desc': '每个成员点击 GitHub 右上角头像 -> <strong>Settings</strong> -> 左下角 <strong>Developer settings</strong> -> <strong>Personal access tokens</strong>：<br>• 推荐：<a href="https://github.com/settings/personal-access-tokens/new" target="_blank" class="guide-link">Fine-grained tokens (细粒度令牌)</a>。选择对应的仓库，在 <strong>Repository permissions</strong> -> <strong>Contents</strong> 中赋予 <strong>Read and write</strong> 读写权限。<br>• 备选：<a href="https://github.com/settings/tokens/new" target="_blank" class="guide-link">Tokens (classic)</a>。勾选最上方的 <strong>repo</strong> 权限框。',
    'landing.sync_guide.step3.title': '3. 同步配置与提交',
    'landing.sync_guide.step3.desc': '点击右上角“进入项目”，在侧边栏或右上角点击 ⚙️ <strong>设置</strong> -> <strong>同步配置</strong>：<br>• 填入共同的 <strong>Owner</strong> (用户名/组织名) 和 <strong>Repo</strong> (仓库名)。<br>• 填入个人的 <strong>Personal Access Token</strong> 令牌。<br>• 点击 <strong>保存设置</strong>。随后在编辑页面右上角点击 <strong>同步到 GitHub</strong>，即可向远端推送更新并拉取同步，完成闭环！',
    'landing.sync_guide.trouble.title': '常见错误与故障排查',
    'landing.sync_guide.err404.title': 'GitHub API Error: Not Found (404 错误)',
    'landing.sync_guide.err404.desc': '<strong>可能原因：</strong>仓库所有者 (Owner) 或仓库名称 (Repo) 拼写错误；或者 Token 没有访问该仓库的权限；或者协作者尚未接受仓库的合作邀请。<br><strong>解决方案：</strong>仔细核对 Owner 和 Repo 拼写；检查 Token 作用范围是否包含该仓库；协作者需先访问 <code>https://github.com/用户名/仓库名/invitations</code> 接受邀请。',
    'landing.sync_guide.err401.title': 'GitHub API Error: Bad credentials (401 错误)',
    'landing.sync_guide.err401.desc': '<strong>可能原因：</strong>输入的 Personal Access Token（个人访问令牌）不正确、已失效或已过期。<br><strong>解决方案：</strong>前往 GitHub 开发者设置重新生成 Token，复制并完整填入，确保没有复制多余的空格或换行符。',
    'landing.sync_guide.err403.title': 'GitHub API Error: Write access denied / Blocked by branch protection (403 错误)',
    'landing.sync_guide.err403.desc': '<strong>可能原因：</strong>Token 校验成功但没有写入权限（Classic 令牌未勾选 repo，或 Fine-grained 令牌未在 Contents 中赋予 Read and write）；或者主分支设置了分支保护规则，阻止了直接推送。<br><strong>解决方案：</strong>在 GitHub 修改该 Token 的权限，确保选中 repo 写入或 Contents 读写；或在仓库设置中暂时调整分支保护规则。',
    'landing.sync_guide.errnet.title': 'SSL / Connection Timeout / 网络连接失败',
    'landing.sync_guide.errnet.desc': '<strong>可能原因：</strong>本地网络访问 GitHub API 失败或超时；或者是 SSL 证书验证在部分本地中继代理中出错。<br><strong>解决方案：</strong>检查本地网络。如果使用了代理客户端，请确保其处于全局/规则代理状态并能正常连通 <code>api.github.com</code>；或参考文档调整 BepInEx/代理配置文件。',
    'settings.username': '显示名称',
    'settings.username.placeholder': '例如 张三',
    'settings.username.hint': '新建页面时会作为作者显示。',
    'page.meta.created_by': '由 {author} 创建',
    'page.meta.on': '于',
    'page.meta.anonymous': '匿名用户',

    // Trash / Recycle Bin
    'trash.title': '回收站',
    'trash.hint': '页面删除后在此保留 3 天，超期后自动清除。',
    'trash.empty': '回收站为空',
    'trash.empty.hint': '删除的页面将在此显示。',
    'trash.confirm.title': '移至回收站？',
    'trash.confirm.desc': '该页面将被移入回收站，3 天后自动永久删除。',
    'trash.confirm.cancel': '取消',
    'trash.confirm.ok': '移至回收站',
    'trash.restore': '还原',
    'trash.delete.forever': '永久删除',
    'trash.days.left': '还剩 {n} 天',
    'trash.by': '由 {author} 删除',
    'trash.on': '·',
    'trash.forever.confirm': '永久删除“{title}”？此操作不可撤销。',

    // Sidebar layout
    'sidebar.favorites': '收藏页面',
    'sidebar.quick.new': '新页面',
    'sidebar.quick.import': '导入',
    'sidebar.role': '管理员',
    'search.clear': '清除',
    'status.pages': '共 {n} 个页面',
    'status.last_saved': '最后保存: {time}',
    'status.last_saved.just': '刚刚',
    'status.last_saved.min': '{n} 分钟前',
    'status.last_saved.hour': '{n} 小时前',

    // Settings page
    'settings.back': '返回',
    'settings.tab.sync': '同步配置',
    'settings.tab.trash': '回收站',
    'settings.tab.preferences': '偏好设置',
    'settings.tab.team': '团队',
    'settings.sync.desc': '配置 GitHub 仓库信息，将内容同步至远端仓库。',
    'pref.theme.title': '主题',
    'pref.theme.light': '浅色模式',
    'pref.theme.dark': '深色模式',
    'pref.lang.title': '语言',
    'pref.lang.zh': '中文',
    'pref.lang.en': 'English',
    'team.desc': '管理团队成员，成员信息将同步至 GitHub。',
    'team.add': '添加',
    'team.name.placeholder': '姓名',
    'team.role.placeholder': '角色，如 开发者',
    'team.role.default': '成员',
    'team.remove': '移除',
    'team.empty': '还没有团队成员，在上方添加。',

    // Nested pages
    'toast.subpage_created': '子页面已创建',

    // Image size
    'toast.image.too_large': '图片过大（上限5MB），请压缩后再上传或粘贴图片链接。',
    'toast.image.compressed': '图片已自动压缩以节省存储空间。',

    // Homework Portal
    'homework.sidebar.title': '📝 作业笔记 / Notebooks',

    // Project Portal
    'project.hero.title': '🤖 情感互动机器人 / Emotional Robot',
    'project.hero.subtitle': '基于 Arduino 开发的老年情感陪伴机器人与 Web 可视化监测底座',
    'project.sim.title': '📺 表情模拟器 / Face Simulator',
    'project.sim.desc': '实时渲染机器人头部 OLED 屏幕表情与情感状态响应：',
    'project.specs.title': '🛠️ 硬件架构与物料 / Spec Sheets',
    'project.sensors.title': '📊 传感器实时数据 / Telemetry',
    'project.sensor.hr': '心率 / Heart Rate',
    'project.sensor.temp': '温度 / Temperature',
    'project.sensor.stability': '稳定性 / Stability',
    'project.console.title': '🖥️ 串口调试终端 / Arduino Console'
  }
};

let currentLang = localStorage.getItem('teamflow_lang') || 'en';

export function getLang() {
  return currentLang;
}

export function setLang(lang) {
  if (translations[lang]) {
    currentLang = lang;
    localStorage.setItem('teamflow_lang', lang);
    applyTranslations();
  }
}

export function t(key, params = {}) {
  return tLang(key, currentLang, params);
}

export function tLang(key, lang, params = {}) {
  let text = translations[lang]?.[key] || translations['en']?.[key] || key;
  for (const [k, v] of Object.entries(params)) {
    text = text.replace(`{${k}}`, v);
  }
  return text;
}

// Automatically apply translations to HTML items with data-i18n attribute
export function applyTranslations() {
  // Update texts
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    el.innerHTML = t(key);
  });

  // Update placeholders
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.getAttribute('data-i18n-placeholder');
    if (el.tagName === 'INPUT') {
      el.setAttribute('placeholder', t(key));
    } else {
      el.setAttribute('data-placeholder', t(key));
    }
  });

  // Update titles (tooltips)
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    const key = el.getAttribute('data-i18n-title');
    el.setAttribute('title', t(key));
  });

  // Dispatch event so JS instances can update generated UI
  window.dispatchEvent(new CustomEvent('language-changed', { detail: currentLang }));
}

export function toggleLanguage() {
  setLang(currentLang === 'en' ? 'zh' : 'en');
}

// ─── Premium Custom Cursor ────────────────────────
function initCustomCursor() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  // Check if cursor elements already exist
  if (document.querySelector('.custom-cursor-dot')) return;

  // Inject CSS styles
  const style = document.createElement('style');
  style.textContent = `
    @media (pointer: fine) {
      html, body, a, button, select, input, textarea, [role="button"], [contenteditable="true"], .page-icon-display {
        cursor: none !important;
      }
      .custom-cursor-dot {
        width: 6px;
        height: 6px;
        background-color: var(--accent-primary, #3b82f6);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 100000;
        transform: translate(-50%, -50%);
        transition: width 0.2s ease, height 0.2s ease, background-color 0.2s ease;
      }
      .custom-cursor-ring {
        width: 26px;
        height: 26px;
        border: 1.5px solid var(--accent-primary, #3b82f6);
        border-radius: 50%;
        position: fixed;
        pointer-events: none;
        z-index: 99999;
        transform: translate(-50%, -50%);
        transition: width 0.2s ease, height 0.2s ease, border-color 0.2s ease, background-color 0.2s ease;
      }
      body.custom-cursor-hover .custom-cursor-dot {
        width: 3px;
        height: 3px;
        background-color: var(--accent-secondary, #8b5cf6) !important;
      }
      body.custom-cursor-hover .custom-cursor-ring {
        width: 36px;
        height: 36px;
        border-color: var(--accent-secondary, #8b5cf6) !important;
        background-color: rgba(139, 92, 246, 0.12) !important;
      }
      body.custom-cursor-click .custom-cursor-dot {
        transform: translate(-50%, -50%) scale(1.5);
      }
      body.custom-cursor-click .custom-cursor-ring {
        transform: translate(-50%, -50%) scale(0.6);
        background-color: rgba(59, 130, 246, 0.3) !important;
      }
    }
  `;
  document.head.appendChild(style);

  // Create cursor DOM elements
  const dot = document.createElement('div');
  const ring = document.createElement('div');
  dot.className = 'custom-cursor-dot';
  ring.className = 'custom-cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mouseX = -100;
  let mouseY = -100;
  let ringX = -100;
  let ringY = -100;

  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = `${mouseX}px`;
    dot.style.top = `${mouseY}px`;
  });

  // Lerp for the lag ring effect
  function tick() {
    ringX += (mouseX - ringX) * 0.15;
    ringY += (mouseY - ringY) * 0.15;
    ring.style.left = `${ringX}px`;
    ring.style.top = `${ringY}px`;
    requestAnimationFrame(tick);
  }
  tick();

  // Click Animation
  window.addEventListener('mousedown', () => {
    document.body.classList.add('custom-cursor-click');
  });
  window.addEventListener('mouseup', () => {
    document.body.classList.remove('custom-cursor-click');
  });

  // Hover states on interactive items
  const interactives = 'a, button, select, input, textarea, [role="button"], [contenteditable="true"], .page-icon-display, .form-input, .homework-item-card, .team-member-card, .pref-card, .info-card, .mood-btn, .block-drag-handle, .block-plus-btn';
  
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(interactives)) {
      document.body.classList.add('custom-cursor-hover');
    }
  });

  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(interactives)) {
      document.body.classList.remove('custom-cursor-hover');
    }
  });
}

// Auto init on load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initCustomCursor);
} else {
  initCustomCursor();
}

