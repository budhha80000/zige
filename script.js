// Markdown 编辑器主脚本
class MarkdownEditor {
    constructor() {
        this.editor = document.getElementById('editor');
        this.preview = document.getElementById('preview');
        this.copyBtn = document.getElementById('copyBtn');
        this.pasteBtn = document.getElementById('pasteBtn');
        this.exportPdfBtn = document.getElementById('exportPdfBtn');
        this.exportHtmlBtn = document.getElementById('exportHtmlBtn');
        this.exportPngBtn = document.getElementById('exportPngBtn');
        this.uploadBtn = document.getElementById('uploadBtn');
        this.fileInput = document.getElementById('fileInput');
        this.undoBtn = document.getElementById('undoBtn');
        this.redoBtn = document.getElementById('redoBtn');
        this.charCount = document.getElementById('charCount');
        this.wordCount = document.getElementById('wordCount');
        
        // 工具栏按钮
        this.boldBtn = document.getElementById('boldBtn');
        this.italicBtn = document.getElementById('italicBtn');
        this.headingBtn = document.getElementById('headingBtn');
        this.heading2Btn = document.getElementById('heading2Btn');
        this.heading3Btn = document.getElementById('heading3Btn');
        this.codeBtn = document.getElementById('codeBtn');
        this.codeBlockBtn = document.getElementById('codeBlockBtn');
        this.listBtn = document.getElementById('listBtn');
        this.orderedListBtn = document.getElementById('orderedListBtn');
        this.taskListBtn = document.getElementById('taskListBtn');
        this.linkBtn = document.getElementById('linkBtn');
        this.imageBtn = document.getElementById('imageBtn');
        this.tableBtn = document.getElementById('tableBtn');
        this.blockquoteBtn = document.getElementById('blockquoteBtn');
        this.horizontalRuleBtn = document.getElementById('horizontalRuleBtn');
        this.strikethroughBtn = document.getElementById('strikethroughBtn');
        
        this.fontWeightSelect = document.getElementById('fontWeightSelect');
        this.mobileDownloadBtn = document.getElementById('mobileDownloadBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        this.fontFamilySelect = document.getElementById('fontFamilySelect');
        this.fontSizeSelect = document.getElementById('fontSizeSelect');
        this.toggleActionsBtn = document.getElementById('toggleActionsBtn');
        this.toggleableActions = document.querySelector('.toggleable-actions');
        
        // 检查html2canvas是否可用，如果不可用则禁用PNG导出功能
        if (typeof html2canvas === 'undefined') {
            this.exportPngBtn.disabled = true;
            this.exportPngBtn.title = 'PNG导出功能暂不可用';
        }
        
        // 历史记录栈
        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 50;
        
        // 存储最后一次使用的图片生成配置
        this.lastImageConfig = {
            deviceType: 'phone', // 默认手机版式
            background: 'white',
            textColor: '#666666'
        };
        
        // 初始化
        this.init();
    }
    
    init() {
        // 设置marked选项以启用代码高亮
        marked.setOptions({
            highlight: function(code, lang) {
                const language = hljs.getLanguage(lang) ? lang : 'plaintext';
                return hljs.highlight(code, { language }).value;
            },
            langPrefix: 'hljs language-',
            breaks: true,
            gfm: true
        });
        
        // 检查html2pdf是否可用，如果不可用则禁用PDF导出功能
        if (typeof html2pdf === 'undefined') {
            this.exportPdfBtn.disabled = true;
            this.exportPdfBtn.title = 'PDF导出功能暂不可用';
        } else {
            this.exportPdfBtn.disabled = false;
            this.exportPdfBtn.title = '导出为PDF';
        }
        
        // 绑定事件
        this.bindEvents();
        
        // 设置默认字体和字号
        this.setDefaultStyles();
        
        // 加载上次保存的内容
        this.loadDraft();
        
        // 初始渲染
        this.updatePreview();
        
        // 更新统计信息
        this.updateStats();
        
        // 初始化编辑器高度
        setTimeout(autoResizeTextarea, 0);
        
        // 初始化隐私条款功能
        this.setupPrivacyPolicy();
        
        // 设置配色选项的字体颜色
        this.setupColorOptionsTextColor();
    }
    
    setDefaultStyles() {
        // 从 localStorage 加载保存的字体设置
        const savedFontFamily = localStorage.getItem('markdownFontFamily');
        const savedFontSize = localStorage.getItem('markdownFontSize');
        const savedFontWeight = localStorage.getItem('markdownFontWeight');
        
        // 设置字体
        if (savedFontFamily) {
            this.fontFamilySelect.value = savedFontFamily;
        } else {
            this.fontFamilySelect.value = "'Source Han Sans SC', 'Source Han Sans CN', 'Source Han Sans', 'Noto Sans CJK SC', sans-serif";
        }
        this.applyFontFamily();
        
        // 设置字号
        if (savedFontSize) {
            this.fontSizeSelect.value = savedFontSize;
        } else {
            this.fontSizeSelect.value = "20px";
        }
        this.applyFontSize();
        
        // 设置字重
        if (savedFontWeight) {
            this.fontWeightSelect.value = savedFontWeight;
        } else {
            this.fontWeightSelect.value = "400";
        }
        this.applyFontWeight();
    }
    
    bindEvents() {
        // 实时更新预览和调整高度
        this.editor.addEventListener('input', () => {
            this.updatePreview();
            this.updateStats();
            this.addToHistory();
            this.autoSave();
            autoResizeTextarea(); // 输入时调整高度
        });
        
        // 监听粘贴事件
        this.editor.addEventListener('paste', () => {
            setTimeout(autoResizeTextarea, 0); // 粘贴后调整高度
        });
        
        // 监听删除事件
        this.editor.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' || e.key === 'Delete') {
                setTimeout(autoResizeTextarea, 0); // 删除后调整高度
            }
        });
        
        // 监听窗口大小变化
        window.addEventListener('resize', autoResizeTextarea);
        
        // 工具栏事件
        this.copyBtn.addEventListener('click', () => this.copyContent());
        this.pasteBtn.addEventListener('click', () => this.pasteContent());
        this.exportPdfBtn.addEventListener('click', () => this.exportToPDF());
        this.exportHtmlBtn.addEventListener('click', () => this.exportToHTML());
        this.exportPngBtn.addEventListener('click', () => this.openImageConfig());
        this.uploadBtn.addEventListener('click', () => this.fileInput.click());
        this.fileInput.addEventListener('change', (e) => this.handleFileUpload(e));
        this.undoBtn.addEventListener('click', () => this.undo());
        this.redoBtn.addEventListener('click', () => this.redo());
        
        // 展开/收起编辑工具按钮事件
        console.log('toggleActionsBtn:', this.toggleActionsBtn);
        console.log('toggleableActions:', this.toggleableActions);
        if (this.toggleActionsBtn && this.toggleableActions) {
            this.toggleActionsBtn.addEventListener('click', () => {
                console.log('Toggle button clicked');
                this.toggleableActions.classList.toggle('expanded');
                console.log('Classes after toggle:', this.toggleableActions.className);
            });
        }
        
        // 快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 's':
                        e.preventDefault();
                        this.saveDraft();
                        break;
                    case 'z':
                        if (e.shiftKey) {
                            e.preventDefault();
                            this.redo();
                        } else {
                            e.preventDefault();
                            this.undo();
                        }
                        break;
                    case 'y':
                        e.preventDefault();
                        this.redo();
                        break;
                    case 'v':
                        if (!e.shiftKey) {
                            e.preventDefault();
                            this.pasteContent();
                        }
                        break;
                }
            }
        });
        
        // 拖放上传
        this.setupDragAndDrop();
        
        // 格式化按钮事件
        this.boldBtn.addEventListener('click', () => this.insertAtCursor('**粗体文本**'));
        this.italicBtn.addEventListener('click', () => this.insertAtCursor('*斜体文本*'));
        this.headingBtn.addEventListener('click', () => this.insertAtCursor('# 标题\n'));
        this.heading2Btn.addEventListener('click', () => this.insertAtCursor('## 二级标题\n'));
        this.heading3Btn.addEventListener('click', () => this.insertAtCursor('### 三级标题\n'));
        this.codeBtn.addEventListener('click', () => this.insertAtCursor('`行内代码`'));
        this.codeBlockBtn.addEventListener('click', () => this.insertAtCursor('```\n代码块\n```\n'));
        this.listBtn.addEventListener('click', () => this.insertAtCursor('- 列表项\n'));
        this.orderedListBtn.addEventListener('click', () => this.insertAtCursor('1. 列表项\n'));
        this.taskListBtn.addEventListener('click', () => this.insertAtCursor('- [ ] 未完成任务\n- [x] 已完成任务\n'));
        this.linkBtn.addEventListener('click', () => this.insertAtCursor('[链接文本](http://example.com)'));
        this.imageBtn.addEventListener('click', () => this.insertAtCursor('![图片描述](图片URL)\n'));
        this.tableBtn.addEventListener('click', () => this.insertTable());
        this.blockquoteBtn.addEventListener('click', () => this.insertAtCursor('> 引用文本\n'));
        this.horizontalRuleBtn.addEventListener('click', () => this.insertAtCursor('\n---\n'));
        this.strikethroughBtn.addEventListener('click', () => this.insertAtCursor('~~删除线文本~~'));
        
        // 字体相关功能 - 使用多种事件类型确保在iOS上也能生效
        this.fontFamilySelect.addEventListener('change', () => this.applyFontFamily());
        this.fontFamilySelect.addEventListener('input', () => this.applyFontFamily());
        this.fontFamilySelect.addEventListener('click', () => {
            // 延迟执行，确保选择已经完成
            setTimeout(() => this.applyFontFamily(), 100);
        });
        this.fontSizeSelect.addEventListener('change', () => this.applyFontSize());
        this.fontSizeSelect.addEventListener('input', () => this.applyFontSize());
        this.fontWeightSelect.addEventListener('change', () => this.applyFontWeight());
        this.fontWeightSelect.addEventListener('input', () => this.applyFontWeight());
        
        // 重置按钮事件
        this.resetBtn.addEventListener('click', () => this.resetEditor());
        
        // 添加移动端下载功能
        this.mobileDownloadBtn.addEventListener('click', () => this.downloadPreviewAsImage());
    }
    
    setupDragAndDrop() {
        const dropArea = document.querySelector('.editor-container');
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });
        
        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }
        
        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, highlight, false);
        });
        
        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, unhighlight, false);
        });
        
        function highlight() {
            dropArea.style.borderColor = '#667eea';
            dropArea.style.backgroundColor = 'rgba(102, 126, 234, 0.1)';
        }
        
        function unhighlight() {
            dropArea.style.borderColor = '#e2e8f0';
            dropArea.style.backgroundColor = '';
        }
        
        dropArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length) {
                this.handleFiles(files);
            }
        }, false);
    }
    
    handleFileUpload(event) {
        const files = event.target.files;
        this.handleFiles(files);
        // 清空文件输入，以便可以重新选择同一文件
        event.target.value = '';
    }
    
    handleFiles(files) {
        [...files].forEach(file => {
            if (file.type === 'text/markdown' || file.name.endsWith('.md') || file.name.endsWith('.markdown')) {
                const reader = new FileReader();
                
                reader.onload = (e) => {
                    this.editor.value = e.target.result;
                    this.updatePreview();
                    this.addToHistory();
                    this.updateStats();
                    alert(`已加载文件: ${file.name}`);
                };
                
                reader.readAsText(file);
            } else {
                alert('请选择有效的Markdown文件 (.md 或 .markdown)');
            }
        });
    }
    
    updatePreview() {
        const markdown = this.editor.value;
        this.preview.innerHTML = marked.parse(markdown);
        
        // 应用编辑器的字体样式到预览区域
        const fontFamily = this.editor.style.fontFamily || 'inherit';
        const fontSize = this.editor.style.fontSize || '14px';
        const fontColor = this.editor.style.color || 'black';
        
        // 设置预览区域的基础样式
        this.preview.style.fontFamily = fontFamily;
        this.preview.style.fontSize = fontSize;
        this.preview.style.color = fontColor;
        
        // 确保所有子元素继承父元素的颜色样式，避免硬编码颜色覆盖
        const allElements = this.preview.querySelectorAll('*');
        allElements.forEach(element => {
            // 移除所有元素的颜色样式，让它们继承父元素的颜色
            element.style.color = 'inherit';
            element.style.fontFamily = 'inherit';
            element.style.fontSize = 'inherit';
        });
        
        // 更新内容后调用自动调整高度函数
        setTimeout(autoResizeTextarea, 0); // 使用setTimeout确保DOM已更新
        
        // 处理图片，确保正确显示
        const images = this.preview.querySelectorAll('img');
        images.forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.display = 'block';
            img.style.margin = '0 auto 20px';
            
            img.onerror = function() {
                this.style.border = '1px dashed #ccc';
                this.style.background = 'rgba(0, 0, 0, 0.05)';
                this.style.padding = '10px';
                this.style.textAlign = 'center';
                this.style.color = '#666';
                this.alt = this.alt || '图片加载失败';
            };
        });
    }
    
    updateStats() {
        const text = this.editor.value;
        const charCount = text.length;
        const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
        
        this.charCount.textContent = `字符数: ${charCount}`;
        this.wordCount.textContent = `单词数: ${wordCount}`;
    }
    
    addToHistory() {
        const currentValue = this.editor.value;
        
        // 如果当前值与历史记录中的最后一个值不同，则添加到历史记录
        if (this.historyIndex === -1 || this.history[this.historyIndex] !== currentValue) {
            // 如果当前不在历史记录末尾，截断后续历史
            if (this.historyIndex < this.history.length - 1) {
                this.history = this.history.slice(0, this.historyIndex + 1);
            }
            
            this.history.push(currentValue);
            this.historyIndex++;
            
            // 限制历史记录大小
            if (this.history.length > this.maxHistory) {
                this.history.shift();
                this.historyIndex--;
            }
            
            // 更新撤销/重做按钮状态
            this.updateHistoryButtons();
        }
    }
    
    updateHistoryButtons() {
        this.undoBtn.disabled = this.historyIndex <= 0;
        this.redoBtn.disabled = this.historyIndex >= this.history.length - 1;
    }
    
    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.editor.value = this.history[this.historyIndex];
            this.updatePreview();
            this.updateStats();
            this.updateHistoryButtons();
        }
    }
    
    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.editor.value = this.history[this.historyIndex];
            this.updatePreview();
            this.updateStats();
            this.updateHistoryButtons();
        }
    }
    
    autoSave() {
        localStorage.setItem('markdownDraft', this.editor.value);
    }
    
    saveDraft() {
        this.autoSave();
        alert('草稿已保存！');
    }
    
    loadDraft() {
        const savedDraft = localStorage.getItem('markdownDraft');
        if (savedDraft) {
            this.editor.value = savedDraft;
            this.updatePreview();
            this.updateStats();
            this.addToHistory();
        }
    }
    
    copyContent() {
        navigator.clipboard.writeText(this.editor.value)
            .then(() => {
                alert('内容已复制到剪贴板！');
            })
            .catch(err => {
                console.error('复制失败:', err);
                // 降级方案：使用execCommand
                this.editor.select();
                document.execCommand('copy');
                alert('内容已复制到剪贴板！');
            });
    }

    pasteContent() {
        navigator.clipboard.readText()
            .then((text) => {
                // 获取当前光标位置和选中文本的信息
                const startPos = this.editor.selectionStart;
                const endPos = this.editor.selectionEnd;
                const currentValue = this.editor.value;
                
                // 插入剪贴板内容并更新编辑器值
                const newValue = currentValue.substring(0, startPos) + text + currentValue.substring(endPos);
                this.editor.value = newValue;
                
                // 将光标定位到粘贴内容的末尾
                const newCursorPos = startPos + text.length;
                this.editor.selectionStart = this.editor.selectionEnd = newCursorPos;
                
                // 更新预览和统计信息
                this.updatePreview();
                this.updateStats();
                this.addToHistory();
                this.autoSave();
                
                // 保持编辑器焦点
                this.editor.focus();
            })
            .catch(err => {
                console.error('粘贴失败:', err);
                // 降级方案：使用execCommand
                document.execCommand('paste');
                
                // 更新预览和统计信息
                this.updatePreview();
                this.updateStats();
                this.addToHistory();
                this.autoSave();
                
                // 保持编辑器焦点
                this.editor.focus();
            });
    }
    
    exportToHTML() {
        const markdown = this.editor.value;
        
        // 获取编辑器的当前设置
        const fontFamily = this.editor.style.fontFamily || 'inherit';
        const fontSize = this.editor.style.fontSize || '14px';
        const fontWeight = this.editor.style.fontWeight || '400';
        
        // 获取当前选择的背景和文字颜色方案
        const selectedBackgroundOption = document.querySelector('.background-options .color-option.active');
        const background = selectedBackgroundOption ? selectedBackgroundOption.getAttribute('data-background') : 'white';
        const textColor = selectedBackgroundOption ? selectedBackgroundOption.getAttribute('data-text-color') : '#333333';
        
        // 优先使用编辑器的颜色设置，如果没有则使用颜色方案
        const fontColor = this.editor.style.color || textColor;
        
        // 将 markdown 转换为 HTML
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Markdown Export</title>
    <style>
        /* 基础重置 */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        /* 核心样式 - 直接使用编辑器设置 */
        body {
            font-family: ${fontFamily};
            font-size: ${fontSize};
            font-weight: ${fontWeight};
            line-height: 1.8;
            color: ${fontColor};
            background-color: ${background};
            overflow-x: hidden;
            
            /* 优化文字排版 - 提高阅读友好度 */
            letter-spacing: 0.3px;
            word-spacing: 0.5px;
            
            /* 优化显示效果 */
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            
            /* 优化触摸体验 */
            -webkit-tap-highlight-color: rgba(0, 0, 0, 0);
            -webkit-text-size-adjust: 100%;
            -ms-text-size-adjust: 100%;
        }
        
        /* 内容区域 - 居中显示，增加最大宽度 */
        .content {
            display: block;
            min-height: 100vh;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px 16px;
            
            /* 优化内容区域的阅读体验 */
            hyphens: auto;
            text-rendering: optimizeLegibility;
        }
        
        /* 标题样式 - 优化层次感和视觉效果 */
        h1, h2, h3, h4, h5, h6 {
            margin-top: 32px;
            margin-bottom: 20px;
            font-weight: 700;
            line-height: 1.3;
            color: inherit;
            opacity: 0.9;
        }
        
        h1 {
            font-size: 2.5em;
            border-bottom: 2px solid rgba(0, 0, 0, 0.1);
            padding-bottom: 12px;
            margin-top: 0;
        }
        
        h2 {
            font-size: 2em;
            border-bottom: 2px solid rgba(0, 0, 0, 0.1);
            padding-bottom: 10px;
        }
        
        h3 {
            font-size: 1.5em;
            color: inherit;
        }
        
        h4 {
            font-size: 1.25em;
        }
        
        h5 {
            font-size: 1.1em;
        }
        
        h6 {
            font-size: 1em;
            color: inherit;
            opacity: 0.8;
        }
        
        /* 段落样式 - 优化间距和可读性 */
        p {
            margin-bottom: 20px;
            text-align: justify;
            color: inherit;
        }
        
        /* 链接样式 - 美化链接效果 */
        a {
            color: #2b6cb0;
            text-decoration: none;
            border-bottom: 1px solid rgba(0, 0, 0, 0.2);
            padding-bottom: 2px;
            transition: all 0.2s ease;
        }
        
        a:hover {
            color: #1a365d;
            border-bottom-color: #2b6cb0;
            text-decoration: none;
        }
        
        /* 列表样式 - 优化缩进和间距 */
        ul, ol {
            margin-bottom: 20px;
            padding-left: 32px;
            color: inherit;
        }
        
        li {
            margin-bottom: 12px;
            line-height: 1.7;
        }
        
        ul li {
            list-style-type: disc;
        }
        
        ol li {
            list-style-type: decimal;
        }
        
        /* 代码样式 - 美化代码块和行内代码 */
        pre {
            background-color: rgba(247, 250, 252, 0.8);
            padding: 20px;
            overflow-x: auto;
            border-radius: 8px;
            margin-bottom: 20px;
            border: 1px solid rgba(226, 232, 240, 0.8);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }
        
        code {
            font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
            font-size: 0.9em;
            background-color: rgba(237, 242, 247, 0.8);
            padding: 3px 8px;
            border-radius: 4px;
            color: inherit;
        }
        
        pre code {
            background-color: transparent;
            padding: 0;
            font-size: 0.85em;
            color: inherit;
        }
        
        /* 引用样式 - 美化引用效果 */
        blockquote {
            border-left: 4px solid #2b6cb0;
            padding: 16px 24px;
            margin: 0 0 20px 0;
            color: inherit;
            background-color: rgba(247, 250, 252, 0.8);
            border-radius: 0 8px 8px 0;
            font-style: italic;
            line-height: 1.7;
            opacity: 0.9;
        }
        
        blockquote p {
            margin-bottom: 0;
        }
        
        /* 表格样式 - 美化表格外观 */
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
            overflow-x: auto;
            display: block;
            background-color: rgba(255, 255, 255, 0.8);
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
            border-radius: 8px;
        }
        
        th, td {
            border: 1px solid rgba(226, 232, 240, 0.8);
            padding: 14px 16px;
            text-align: left;
            color: inherit;
        }
        
        th {
            background-color: rgba(247, 250, 252, 0.8);
            font-weight: 700;
            color: inherit;
            border-bottom: 2px solid rgba(203, 213, 224, 0.8);
        }
        
        tr:nth-child(even) {
            background-color: rgba(247, 250, 252, 0.8);
        }
        
        /* 图片样式 - 美化图片显示 */
        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            display: block;
            margin: 0 auto 20px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        /* 水平分割线 - 美化分割线样式 */
        hr {
            border: none;
            border-top: 2px solid rgba(226, 232, 240, 0.8);
            margin: 40px 0;
        }
        
        /* 自适应布局 - 调整内边距和最大宽度 */
        @media (min-width: 768px) {
            .content {
                padding: 32px 24px;
                max-width: 850px;
            }
        }
        
        @media (min-width: 1024px) {
            .content {
                padding: 40px 32px;
                max-width: 900px;
            }
        }
        
        /* 移动设备优化 - 调整布局和间距 */
        @media (max-width: 767px) {
            /* 增加移动设备上的页边距，提高阅读舒适度 */
            .content {
                padding: 24px 20px;
            }
            
            h1 {
                font-size: 2em;
            }
            
            h2 {
                font-size: 1.75em;
            }
            
            h3 {
                font-size: 1.5em;
            }
            
            /* 优化移动设备上的段落样式 */
            p {
                text-align: left;
                line-height: 1.8;
                letter-spacing: 0.2px;
                word-spacing: 0.5px;
            }
            
            /* 确保表格在小屏幕上可滚动 */
            table {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
            }
            
            /* 确保代码块在小屏幕上可滚动 */
            pre {
                overflow-x: auto;
                -webkit-overflow-scrolling: touch;
                padding: 16px;
                border-radius: 6px;
            }
            
            /* 优化移动设备上的列表样式 */
            ul, ol {
                padding-left: 28px;
            }
            
            /* 优化移动设备上的引用样式 */
            blockquote {
                padding: 16px 20px;
                margin-left: -10px;
                margin-right: -10px;
            }
            
            /* 优化移动设备上的图片显示 */
            img {
                border-radius: 6px;
                margin-left: -10px;
                margin-right: -10px;
                max-width: calc(100% + 20px);
            }
            
            /* 优化移动设备上的链接样式 */
            a {
                word-break: break-word;
                hyphens: auto;
            }
        }
    </style>
</head>
<body>
    <div class="content">
        ${marked.parse(markdown)}
    </div>
</body>
</html>`;
        
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `markdown-export-${Date.now()}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    exportToPDF() {
        // 再次检查html2pdf是否可用
        if (typeof html2pdf === 'undefined') {
            alert('PDF导出功能不可用，请检查网络连接后刷新页面重试');
            return;
        }
        
        // 获取编辑器的当前设置，与HTML导出保持一致
        const fontFamily = this.editor.style.fontFamily || 'inherit';
        const fontSize = this.editor.style.fontSize || '14px';
        const fontWeight = this.editor.style.fontWeight || '400';
        
        // 获取当前选择的背景和文字颜色方案
        const selectedBackgroundOption = document.querySelector('.background-options .color-option.active');
        const background = selectedBackgroundOption ? selectedBackgroundOption.getAttribute('data-background') : 'white';
        const textColor = selectedBackgroundOption ? selectedBackgroundOption.getAttribute('data-text-color') : '#666666';
        
        // 优先使用编辑器的颜色设置，如果没有则使用颜色方案
        const fontColor = this.editor.style.color || textColor;
        
        // 创建导出内容
        const markdown = this.editor.value;
        const htmlContent = marked.parse(markdown);
        
        // 创建导出容器，与HTML导出结构一致
        const wrapper = document.createElement('div');
        wrapper.className = 'pdf-content';
        wrapper.innerHTML = `
            <style>
                /* 基础重置 */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                /* 核心样式 - 与HTML导出一致 */
                body {
                    font-family: ${fontFamily};
                    font-size: ${fontSize};
                    font-weight: ${fontWeight};
                    line-height: 1.8;
                    color: ${fontColor};
                    background-color: transparent;
                    overflow-x: hidden;
                }
                
                /* 内容区域 - 与HTML导出一致 */
                .content {
                    display: block;
                    min-height: 100vh;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px 16px;
                }
                
                /* 标题样式 */
                h1, h2, h3, h4, h5, h6 {
                    margin-top: 32px;
                    margin-bottom: 20px;
                    font-weight: 700;
                    line-height: 1.3;
                    color: inherit;
                    opacity: 0.9;
                }
                
                h1 {
                    font-size: 2.5em;
                    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
                    padding-bottom: 12px;
                    margin-top: 0;
                }
                
                h2 {
                    font-size: 2em;
                    border-bottom: 2px solid rgba(0, 0, 0, 0.1);
                    padding-bottom: 10px;
                }
                
                h3 {
                    font-size: 1.5em;
                }
                
                /* 段落样式 */
                p {
                    margin-bottom: 20px;
                    text-align: justify;
                    color: inherit;
                }
                
                /* 链接样式 */
                a {
                    color: #2b6cb0;
                    text-decoration: none;
                    border-bottom: 1px solid rgba(0, 0, 0, 0.2);
                    padding-bottom: 2px;
                }
                
                /* 列表样式 */
                ul, ol {
                    margin-bottom: 20px;
                    padding-left: 32px;
                    color: inherit;
                }
                
                li {
                    margin-bottom: 12px;
                    line-height: 1.7;
                }
                
                /* 代码样式 */
                pre {
                    background-color: rgba(247, 250, 252, 0.8);
                    padding: 20px;
                    overflow-x: auto;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                }
                
                code {
                    font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
                    font-size: 0.9em;
                    background-color: rgba(237, 242, 247, 0.8);
                    padding: 3px 8px;
                    border-radius: 4px;
                    color: inherit;
                }
                
                pre code {
                    background-color: transparent;
                    padding: 0;
                    font-size: 0.85em;
                }
                
                /* 引用样式 */
                blockquote {
                    border-left: 4px solid #2b6cb0;
                    padding: 16px 24px;
                    margin: 0 0 20px 0;
                    color: inherit;
                    background-color: rgba(247, 250, 252, 0.8);
                    border-radius: 0 8px 8px 0;
                    font-style: italic;
                    line-height: 1.7;
                    opacity: 0.9;
                }
                
                /* 表格样式 */
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin-bottom: 20px;
                    overflow-x: auto;
                    display: block;
                    background-color: rgba(255, 255, 255, 0.8);
                    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
                    border-radius: 8px;
                }
                
                th, td {
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    padding: 14px 16px;
                    text-align: left;
                    color: inherit;
                }
                
                th {
                    background-color: rgba(247, 250, 252, 0.8);
                    font-weight: 700;
                    color: inherit;
                    border-bottom: 2px solid rgba(203, 213, 224, 0.8);
                }
                
                tr:nth-child(even) {
                    background-color: rgba(247, 250, 252, 0.8);
                }
                
                /* 图片样式 */
                img {
                    max-width: 100%;
                    height: auto;
                    border-radius: 8px;
                    display: block;
                    margin: 0 auto 20px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                /* 水平分割线 */
                hr {
                    border: none;
                    border-top: 2px solid rgba(226, 232, 240, 0.8);
                    margin: 40px 0;
                }
                
                /* 分页控制样式 */
                .pdf-content h1, .pdf-content h2, .pdf-content h3, .pdf-content h4, .pdf-content h5, .pdf-content h6 {
                    page-break-after: avoid;
                }
                .pdf-content p, .pdf-content li, .pdf-content pre, .pdf-content blockquote {
                    page-break-inside: avoid;
                }
                .pdf-content pre {
                    white-space: pre-wrap;
                    word-wrap: break-word;
                }
            </style>
            <div class="content">
                ${htmlContent}
            </div>
        `;
        
        // 添加包装器样式，确保没有背景框和背景色
        wrapper.style.background = 'transparent';
        wrapper.style.backgroundColor = 'transparent';
        wrapper.style.border = 'none';
        wrapper.style.boxShadow = 'none';
        wrapper.style.padding = '0';
        
        document.body.appendChild(wrapper);
        
        // 添加临时样式到文档头部
        const style = document.createElement('style');
        style.textContent = `
            .pdf-content {
                background: transparent !important;
                backgroundColor: transparent !important;
            }
        `;
        document.head.appendChild(style);
        
        const opt = {
            margin: [20, 20, 25, 20],
            filename: `markdown-export-${new Date().getTime()}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
                scale: 2,
                useCORS: true,
                allowTaint: true,
                backgroundColor: null, // 透明背景
                scrollX: 0,
                scrollY: 0,
                letterRendering: true
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['css', 'legacy'] }
        };
        
        const worker = html2pdf().set(opt).from(wrapper);
        
        worker.save().then(() => {
            document.body.removeChild(wrapper);
            document.head.removeChild(style);
        }).catch(function(error) {
            console.error('PDF导出失败:', error);
            alert('PDF导出失败，请稍后重试');
            document.body.removeChild(wrapper);
            document.head.removeChild(style);
        });
    }
    
    getContrastTextColor(backgroundColor) {
        const rgb = this.hexToRgb(backgroundColor);
        if (!rgb) return '#999999';
        
        const luminance = (0.299 * rgb.r + 0.587 * rgb.g + 0.114 * rgb.b) / 255;
        
        return luminance > 0.5 ? '#666666' : '#CCCCCC';
    }
    
    // 计算颜色对比度比率
    calculateContrastRatio(color1, color2) {
        // 将颜色转换为RGB
        const rgb1 = this.hexToRgb(color1);
        const rgb2 = this.hexToRgb(color2);
        
        if (!rgb1 || !rgb2) return 1;
        
        // 计算相对亮度
        const getRelativeLuminance = (rgb) => {
            const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(component => {
                const sRGB = component / 255;
                return sRGB <= 0.03928 ? sRGB / 12.92 : Math.pow((sRGB + 0.055) / 1.055, 2.4);
            });
            return 0.2126 * r + 0.7152 * g + 0.0722 * b;
        };
        
        const L1 = getRelativeLuminance(rgb1);
        const L2 = getRelativeLuminance(rgb2);
        
        // 计算对比度比率
        const contrastRatio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        
        return contrastRatio;
    }
    
    // 检查颜色对比度是否符合WCAG标准（至少4.5:1）
    isContrastSufficient(backgroundColor, textColor) {
        const contrastRatio = this.calculateContrastRatio(backgroundColor, textColor);
        return contrastRatio >= 4.5;
    }
    
    hexToRgb(hex) {
        if (!hex) return null;
        
        hex = hex.replace('#', '');
        
        if (hex.length === 3) {
            hex = hex.split('').map(char => char + char).join('');
        }
        
        if (hex.length !== 6) return null;
        
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec('#' + hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    }
    
    // 将RGB颜色转换为HSL
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            
            h /= 6;
        }
        
        return {
            h: Math.round(h * 360),
            s: Math.round(s * 100),
            l: Math.round(l * 100)
        };
    }
    
    // 将HSL颜色转换为十六进制
    hslToHex(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const hue2rgb = (p, q, t) => {
                if (t < 0) t += 1;
                if (t > 1) t -= 1;
                if (t < 1/6) return p + (q - p) * 6 * t;
                if (t < 1/2) return q;
                if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                return p;
            };
            
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        const toHex = (x) => {
            const hex = Math.round(x * 255).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return '#' + toHex(r) + toHex(g) + toHex(b);
    }
    
    // 自动调整背景色以提高对比度，保持同一色系
    adjustBackgroundColor(backgroundColor, textColor) {
        // 检查当前对比度是否足够
        if (this.isContrastSufficient(backgroundColor, textColor)) {
            return backgroundColor;
        }
        
        // 将颜色转换为RGB
        const bgRgb = this.hexToRgb(backgroundColor);
        const textRgb = this.hexToRgb(textColor);
        
        if (!bgRgb || !textRgb) return backgroundColor;
        
        // 将背景色转换为HSL
        const bgHsl = this.rgbToHsl(bgRgb.r, bgRgb.g, bgRgb.b);
        
        // 计算目标亮度
        const textLuminance = (0.299 * textRgb.r + 0.587 * textRgb.g + 0.114 * textRgb.b) / 255;
        let targetLightness = bgHsl.l;
        
        // 根据文字亮度调整背景亮度
        if (textLuminance > 0.5) {
            // 文字较亮，背景需要更暗
            targetLightness = Math.max(10, bgHsl.l - 15);
        } else {
            // 文字较暗，背景需要更亮
            targetLightness = Math.min(90, bgHsl.l + 15);
        }
        
        // 保持色相和饱和度不变，只调整亮度
        return this.hslToHex(bgHsl.h, bgHsl.s, targetLightness);
    }
    
    insertAtCursor(text) {
        const start = this.editor.selectionStart;
        const end = this.editor.selectionEnd;
        const before = this.editor.value.substring(0, start);
        const after = this.editor.value.substring(end);
        
        this.editor.value = before + text + after;
        this.editor.selectionStart = start + text.length;
        this.editor.selectionEnd = start + text.length;
        
        // 触发输入事件以更新预览
        this.editor.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    insertTable() {
        const tableText = '\n| 列1 | 列2 | 列3 |\n| --- | --- | --- |\n| 内容1 | 内容2 | 内容3 |\n';
        this.insertAtCursor(tableText);
    }
    
    applyFontFamily() {
        const fontFamily = this.fontFamilySelect.value;
        console.log('Applying font family:', fontFamily);
        
        // 保存到 localStorage
        localStorage.setItem('markdownFontFamily', fontFamily);
        
        if (fontFamily) {
            // 尝试多种方法来设置字体，确保在iOS上也能生效
            // 方法1: 使用setProperty并设置!important
            this.editor.style.setProperty('font-family', fontFamily, 'important');
            // 方法2: 直接设置style.fontFamily
            this.editor.style.fontFamily = fontFamily;
            // 方法3: 添加内联样式
            this.editor.setAttribute('style', this.editor.getAttribute('style') + '; font-family: ' + fontFamily + ' !important;');
        } else {
            this.editor.style.removeProperty('font-family');
        }
        
        // 同时更新预览区域的字体
        if (fontFamily) {
            this.preview.style.setProperty('font-family', fontFamily, 'important');
            this.preview.style.fontFamily = fontFamily;
        } else {
            this.preview.style.removeProperty('font-family');
        }
        
        // 打印最终的样式，用于调试
        console.log('Final editor style:', this.editor.style.cssText);
    }
    
    applyFontSize() {
        const fontSize = this.fontSizeSelect.value;
        
        // 保存到 localStorage
        localStorage.setItem('markdownFontSize', fontSize);
        
        if (fontSize) {
            this.editor.style.fontSize = fontSize;
        } else {
            this.editor.style.fontSize = '14px';
        }
        
        // 同时更新预览区域的字体大小
        this.preview.style.fontSize = this.editor.style.fontSize || '14px';
    }
    
    applyFontWeight() {
        const fontWeight = this.fontWeightSelect.value;
        
        // 保存到 localStorage
        localStorage.setItem('markdownFontWeight', fontWeight);
        
        if (fontWeight) {
            this.editor.style.fontWeight = fontWeight;
        } else {
            this.editor.style.fontWeight = '400';
        }
        
        // 同时更新预览区域的字重
        this.preview.style.fontWeight = this.editor.style.fontWeight || '400';
    }
    

    
    resetEditor() {
        if (confirm('确定要清空编辑器内容吗？此操作将清空所有内容，此操作不可撤销。')) {
            // 清空编辑器内容
            this.editor.value = '';
            
            // 重置历史记录
            this.history = [];
            this.historyIndex = -1;
            
            // 清除localStorage中的当前草稿
            localStorage.removeItem('markdownDraft');
            
            // 更新预览和统计信息
            this.updatePreview();
            this.updateStats();
            
            // 将初始状态加入历史记录
            this.addToHistory();
            
            // 保持编辑器焦点
            this.editor.focus();
            
            // 显示清空完成提示
            this.showNotification('编辑器内容已清空');
        }
    }
    
    clearEditorCache() {
        // 清除与编辑器相关的临时缓存数据
        const cacheKeys = [
            'markdownDraft', // 自动保存的草稿内容
            'markdown-editor-content',
            'markdown-editor-history',
            'markdown-editor-settings',
            'markdown-editor-font',
            'markdown-editor-last-save'
        ];
        
        cacheKeys.forEach(key => {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.warn(`无法清除缓存项: ${key}`, e);
            }
        });
        
        // 同时清除sessionStorage中的数据
        try {
            sessionStorage.clear();
        } catch (e) {
            console.warn('无法清除sessionStorage', e);
        }
    }
    
    restoreDefaultSettings() {
        // 恢复默认字体设置
        this.fontFamilySelect.value = 'default';
        this.fontSizeSelect.value = '14px';
        
        // 恢复默认样式
        this.editor.style.fontFamily = 'inherit';
        this.editor.style.fontSize = '14px';
        this.editor.style.color = 'black';
        this.editor.style.backgroundColor = 'white';
    }
    
    showNotification(message) {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color, #3b82f6);
            color: white;
            padding: 12px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            z-index: 9999;
            animation: slideIn 0.3s ease-out;
        `;
        
        // 添加动画样式
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            @keyframes slideOut {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(notification);
        
        // 3秒后移除通知
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease-out';
            setTimeout(() => {
                document.body.removeChild(notification);
                document.head.removeChild(style);
            }, 300);
        }, 3000);
    }
    
    
    
    async downloadPreviewAsImage() {
        // 生成手机尺寸的图片，默认白色底色
        const deviceType = 'phone'; // 固定为手机尺寸
        const background = 'white'; // 白色背景
        const textColor = '#333333'; // 默认文字颜色
        
        // 生成手机版图片
        const canvas = await this.generateImageForDevice(deviceType, background, textColor);
        
        // 创建下载链接
        this.downloadCanvasAsImage(canvas, `markdown-phone-${new Date().getTime()}.png`);
    }
    
    // 打开图片预览弹窗
    async openImagePreview() {
        // 显示模态框
        const modal = document.getElementById('imagePreviewModal');
        const previewImg = document.getElementById('previewImage');
        
        // 生成手机版预览图
        const phoneCanvas = await this.generateImageForDevice('phone');
        const phoneUrl = phoneCanvas.toDataURL('image/png');
        
        // 设置预览图片
        previewImg.src = phoneUrl;
        
        // 确保手机选项为激活状态
        const deviceOptions = document.querySelectorAll('.device-option');
        deviceOptions.forEach(opt => opt.classList.remove('active'));
        const phoneOption = document.querySelector('.device-option[data-device="phone"]');
        if(phoneOption) {
            phoneOption.classList.add('active');
        }
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 绑定关闭事件
        const closeBtn = document.querySelector('.close');
        const span = document.getElementsByClassName('close')[0];
        
        // 当点击(x)时，关闭模态框
        span.onclick = function() {
            modal.style.display = 'none';
        }
        
        // 当点击模态框外部时，关闭模态框
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
        
        // 绑定设备切换事件
        this.bindDeviceSwitchEvents();
        
        // 绑定下载按钮事件
        this.bindDownloadEvents();
        
        // 绑定背景选择事件
        this.bindBackgroundSelectionEvents();
    }
    
    // 绑定设备切换事件
    bindDeviceSwitchEvents() {
        const deviceOptions = document.querySelectorAll('.device-option');
        const previewImg = document.getElementById('previewImage');
        
        deviceOptions.forEach(option => {
            option.addEventListener('click', async (e) => {
                // 移除所有激活状态
                deviceOptions.forEach(opt => opt.classList.remove('active'));
                
                // 添加激活状态到当前选项
                e.currentTarget.classList.add('active');
                
                // 获取设备类型
                const deviceType = e.currentTarget.getAttribute('data-device');
                
                // 更新预览图片
                this.updatePreviewImage(deviceType);
            });
        });
    }
    
    // 打开图片生成配置模态框
    openImageConfig() {
        const modal = document.getElementById('imageConfigModal');
        const generateBtn = document.getElementById('generateImageButton');
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 初始化实时预览
        this.updateRealtimePreview();
        
        // 绑定生成按钮事件
        generateBtn.onclick = () => {
            const deviceType = document.querySelector('.device-option.active').dataset.device;
            const backgroundColor = document.querySelector('.color-option.active').dataset.background;
            const textColor = document.querySelector('.color-option.active').dataset.textColor;
            const author = ''; // 不再使用作者信息
            
            this.generateImageAndDownload(deviceType, backgroundColor, textColor, author);
            modal.style.display = 'none';
        };
        
        // 绑定关闭事件
        this.bindModalCloseEvents(modal);
        
        // 绑定设备选项切换事件
        this.bindDeviceOptionEvents();
        
        // 绑定背景选项切换事件
        this.bindBackgroundOptionEvents();
        
        // 绑定设备选项点击事件以更新预览
        const deviceOptions = document.querySelectorAll('.device-option');
        deviceOptions.forEach(option => {
            option.addEventListener('click', () => {
                setTimeout(() => {
                    this.updateRealtimePreview();
                }, 10);
            });
        });
        
        // 绑定背景选项点击事件以更新预览
        const colorOptions = document.querySelectorAll('.color-option');
        colorOptions.forEach(option => {
            option.addEventListener('click', () => {
                setTimeout(() => {
                    this.updateRealtimePreview();
                }, 10);
            });
        });
        

    }
    
    // 绑定设备选择事件
    bindDeviceSelectionEvents() {
        const deviceOptions = document.querySelectorAll('.device-option');
        
        deviceOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const clickedOption = e.currentTarget;
                
                // 移除所有选项的激活状态
                deviceOptions.forEach(opt => opt.classList.remove('active'));
                
                // 为当前选项添加激活状态
                clickedOption.classList.add('active');
            });
        });
    }
    
    // 生成卡片风格的图片
    async generateCardImage(deviceType, background, textColor, author) {
        const previewElement = document.getElementById('preview');
        
        // 保存预览元素的原始背景样式
        const originalBgColor = previewElement.style.backgroundColor;
        const originalBgImage = previewElement.style.backgroundImage;
        const originalBg = previewElement.style.background;
        
        // 临时移除预览元素的背景，避免克隆时出现双重背景
        previewElement.style.backgroundColor = 'transparent';
        previewElement.style.backgroundImage = 'none';
        previewElement.style.background = 'none';
        previewElement.style.borderRadius = '0';
        previewElement.style.boxShadow = 'none';
        
        // 克隆预览元素
        const clonedElement = previewElement.cloneNode(true);
        
        // 恢复预览元素的原始背景样式
        previewElement.style.backgroundColor = originalBgColor;
        previewElement.style.backgroundImage = originalBgImage;
        previewElement.style.background = originalBg;
        
        // 根据设备类型设置不同的宽度，高度将根据内容自适应
        let width;
        switch(deviceType) {
            case 'desktop':
                width = 1024;
                break;
            case 'tablet':
                width = 768;
                break;
            case 'phone':
                width = 375;
                break;
            default:
                width = 1024;
        }

        // 确保克隆元素及其所有子元素都没有背景
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach(el => {
            // 彻底清除所有元素的背景样式，使用!important确保覆盖CSS
            el.style.backgroundColor = 'transparent !important';
            el.style.backgroundImage = 'none !important';
            el.style.background = 'none !important';
            // 清除所有可能的背景相关类
            el.classList.remove('preview-content', 'card', 'bg-white', 'bg-gray-50', 'bg-gray-100');
        });
        
        // 确保克隆元素本身也没有背景和额外的padding
        clonedElement.style.backgroundColor = 'transparent !important';
        clonedElement.style.backgroundImage = 'none !important';
        clonedElement.style.background = 'none !important';
        clonedElement.style.borderRadius = '0 !important';
        clonedElement.style.boxShadow = 'none !important';
        clonedElement.style.padding = '0 !important'; // 移除默认padding，避免额外的背景空间
        // 清除克隆元素可能的背景相关类
        clonedElement.classList.remove('preview-content', 'card', 'bg-white', 'bg-gray-50', 'bg-gray-100');

        // 创建一个临时容器用于截图
        const tempContainer = document.createElement('div');
        tempContainer.appendChild(clonedElement);
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.background = background;
        tempContainer.style.padding = '20px';
        tempContainer.style.width = `${width}px`;
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.overflow = 'visible'; // 允许内容自然扩展
        tempContainer.style.fontFamily = this.editor.style.fontFamily || 'inherit';
        tempContainer.style.fontSize = this.editor.style.fontSize || '14px';
        tempContainer.style.fontWeight = this.editor.style.fontWeight || '400';
        tempContainer.style.color = textColor; // 使用色彩模板中指定的字体颜色
        tempContainer.style.borderRadius = '12px'; // 卡片风格的圆角
        tempContainer.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1);'; // 卡片风格的阴影
        document.body.appendChild(tempContainer);
        
        try {
            // 让容器高度根据内容自适应
            await new Promise(resolve => setTimeout(resolve, 100)); // 等待内容渲染完成
            
            // 获取实际内容高度（不包括padding）
            const contentHeight = tempContainer.scrollHeight;
            
            // 使用html2canvas将预览内容转换为图像
            const canvas = await html2canvas(tempContainer, {
                backgroundColor: background.startsWith('#') ? background : null,
                scale: 2, // 提高分辨率
                useCORS: true,
                allowTaint: true,
                width: width,
                height: contentHeight, // 使用实际内容高度
                scrollX: 0,
                scrollY: 0
            });
            
            // 清理临时元素
            document.body.removeChild(tempContainer);
            
            // 创建一个新的canvas来添加底部标识
            const finalCanvas = document.createElement('canvas');
            const ctx = finalCanvas.getContext('2d');
            
            // 设置最终画布尺寸（只增加标识所需的空间）
            const footerHeight = 50; // 增加底部标识的高度
            finalCanvas.width = canvas.width;
            finalCanvas.height = canvas.height + footerHeight;
            
            // 绘制原始内容
            ctx.drawImage(canvas, 0, 0);
            
            // 绘制卡片风格的底部区域
            ctx.fillStyle = textColor; // 文字颜色根据背景自适应
            ctx.font = '14px "Alibaba PuHuiTi", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
            ctx.textAlign = 'left'; // 左对齐
            ctx.textBaseline = 'middle'; // 设置基线对齐方式
            
            // 绘制作者信息（如果提供了的话）
            if (author) {
                ctx.fillText(`作者: ${author}`, 20, finalCanvas.height - 25);
            }
            
            // 绘制底部标识
            ctx.textAlign = 'right'; // 右对齐
            ctx.fillText('由 饸络随记 生成', finalCanvas.width - 20, finalCanvas.height - 25);
            
            return finalCanvas;
        } catch (error) {
            console.error(`生成${deviceType}卡片图片失败:`, error);
            // 清理临时元素
            if (document.body.contains(tempContainer)) {
                document.body.removeChild(tempContainer);
            }
            throw error;
        }
    }
    
    // 显示图片预览
    showImagePreview(canvas, deviceType) {
        const modal = document.getElementById('imagePreviewModalNew');
        const previewImg = document.getElementById('previewImageNew');
        const downloadBtn = document.getElementById('downloadPreviewBtn');
        
        // 将canvas转换为数据URL并设置为预览图片
        const imgDataUrl = canvas.toDataURL('image/png');
        previewImg.src = imgDataUrl;
        
        // 显示模态框
        modal.style.display = 'block';
        
        // 绑定关闭事件
        const closeBtn = modal.querySelector('.close');
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }
        
        // 当点击模态框外部时，关闭模态框
        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
        
        // 绑定下载事件
        downloadBtn.onclick = () => {
            this.downloadCanvasAsImage(canvas, `hunlun-note-${deviceType}-${new Date().getTime()}.png`);
        };
    }
    
    // 绑定下载按钮事件
    bindDownloadEvents() {
        const downloadBtns = document.querySelectorAll('.download-btn');
        
        downloadBtns.forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const deviceType = e.currentTarget.getAttribute('data-device');
                
                // 生成对应设备的图片（包含背景和底部标识）
                const canvas = await this.generateImageForDevice(deviceType);
                
                // 下载图片
                this.downloadCanvasAsImage(canvas, `markdown-${deviceType}-${new Date().getTime()}.png`);
            });
        });
    }
    
    // 生成图片并下载
    async generateImageAndDownload(deviceType, background, textColor, author) {
        // 生成对应设备的图片
        const canvas = await this.generateImageForDevice(deviceType, background, textColor);
        
        // 创建下载链接
        this.downloadCanvasAsImage(canvas, `markdown-${deviceType}-${new Date().getTime()}.png`);
    }
    
    // 为特定设备生成图片
    async generateImageForDevice(deviceType, background = null, textColor = null) {
        // 直接使用编辑器内容生成HTML，而不是依赖可能尚未更新的预览元素
        const markdown = this.editor.value;
        const htmlContent = marked.parse(markdown);
        
        // 根据设备类型设置不同的宽度，高度将根据内容自适应
        let width;
        let contentPadding;
        let footerMarginTop;
        switch(deviceType) {
            case 'desktop':
                width = 1024;
                contentPadding = '40px 40px 20px'; // 增加顶部和左右边距
                footerMarginTop = '30px';
                break;
            case 'tablet':
                width = 768;
                contentPadding = '32px 32px 20px'; // 增加顶部和左右边距
                footerMarginTop = '25px';
                break;
            case 'phone':
                width = 375;
                contentPadding = '50px 24px 20px'; // 增加顶部边距避开灵动岛，增加左右边距
                footerMarginTop = '20px';
                break;
            default:
                width = 1024;
                contentPadding = '40px 40px 20px';
                footerMarginTop = '30px';
        }
        
        // 如果没有传入背景和文字颜色，则获取当前选中的值
        if (!background || !textColor) {
            const selectedBackgroundOption = document.querySelector('.background-options .color-option.active');
            background = selectedBackgroundOption ? selectedBackgroundOption.getAttribute('data-background') : '#ffffff';
            textColor = selectedBackgroundOption ? selectedBackgroundOption.getAttribute('data-text-color') : '#333333';
        }
        
        // 应用编辑器的字体样式
        const fontFamily = this.editor.style.fontFamily || '"Microsoft YaHei", "PingFang SC", "Hiragino Sans GB", "Noto Sans CJK SC", sans-serif';
        const fontSize = this.editor.style.fontSize || '14px';
        const fontWeight = this.editor.style.fontWeight || '400';
        
        // 创建一个临时容器用于截图
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.top = '0';
        tempContainer.style.background = background;
        tempContainer.style.color = textColor; // 使用配色中指定的字体颜色
        tempContainer.style.width = `${width}px`;
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.borderRadius = '16px'; // 增大圆角，提升高级感
        tempContainer.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)'; // 增强阴影效果
        tempContainer.style.overflow = 'visible';
        tempContainer.style.fontFamily = fontFamily;
        tempContainer.style.fontSize = fontSize;
        tempContainer.style.fontWeight = fontWeight;
        tempContainer.style.lineHeight = '1.8';
        tempContainer.style.wordBreak = 'break-word';
        tempContainer.style.overflowWrap = 'break-word';
        
        // 添加文字渲染优化属性，提升文字清晰度和质感
        tempContainer.style.textRendering = 'optimizeLegibility';
        tempContainer.style.webkitFontSmoothing = 'antialiased';
        tempContainer.style.mozOsxFontSmoothing = 'grayscale';
        tempContainer.style.letterSpacing = '0.3px'; // 调整字间距
        tempContainer.style.wordSpacing = '0.5px'; // 调整词间距
        
        // 创建内容容器
        const contentDiv = document.createElement('div');
        contentDiv.innerHTML = htmlContent;
        contentDiv.style.color = textColor;
        contentDiv.style.fontFamily = fontFamily;
        contentDiv.style.fontSize = fontSize;
        contentDiv.style.fontWeight = fontWeight;
        contentDiv.style.lineHeight = '1.8';
        contentDiv.style.wordBreak = 'break-word';
        contentDiv.style.overflowWrap = 'break-word';
        contentDiv.style.width = '100%';
        contentDiv.style.boxSizing = 'border-box';
        contentDiv.style.padding = contentPadding;
        
        // 优化标题样式
        const headings = contentDiv.querySelectorAll('h1, h2, h3, h4, h5, h6');
        headings.forEach(heading => {
            heading.style.marginTop = '24px';
            heading.style.marginBottom = '16px';
            heading.style.fontWeight = '600';
            heading.style.lineHeight = '1.3';
        });
        
        // 优化段落样式
        const paragraphs = contentDiv.querySelectorAll('p');
        paragraphs.forEach(paragraph => {
            paragraph.style.marginBottom = '18px';
            paragraph.style.lineHeight = '1.8';
            paragraph.style.textAlign = 'justify';
        });
        
        // 优化列表样式
        const lists = contentDiv.querySelectorAll('ul, ol');
        lists.forEach(list => {
            list.style.marginBottom = '18px';
            list.style.paddingLeft = '24px';
        });
        
        const listItems = contentDiv.querySelectorAll('li');
        listItems.forEach(item => {
            item.style.marginBottom = '8px';
            item.style.lineHeight = '1.7';
        });
        
        // 优化行内代码样式
        const inlineCodes = contentDiv.querySelectorAll('code:not(pre code)');
        inlineCodes.forEach(code => {
            code.style.backgroundColor = 'rgba(128, 128, 128, 0.1)';
            code.style.padding = '2px 6px';
            code.style.borderRadius = '4px';
            code.style.fontFamily = '"Courier New", monospace';
            code.style.fontSize = '0.9em';
            code.style.color = textColor;
            code.style.wordBreak = 'break-all';
            code.style.whiteSpace = 'normal';
            code.style.overflowWrap = 'break-word';
        });
        
        // 优化代码块样式
        const codeBlocks = contentDiv.querySelectorAll('pre');
        codeBlocks.forEach(pre => {
            pre.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
            pre.style.padding = '16px';
            pre.style.borderRadius = '8px';
            pre.style.overflow = 'hidden';
            pre.style.marginBottom = '18px';
            pre.style.fontFamily = '"Courier New", monospace';
            pre.style.fontSize = '0.9em';
            pre.style.wordBreak = 'break-all';
            pre.style.whiteSpace = 'pre-wrap';
            pre.style.overflowWrap = 'break-word';
            
            // 确保代码块内的代码元素也有正确的样式
            const codeElements = pre.querySelectorAll('code');
            codeElements.forEach(code => {
                code.style.fontFamily = '"Courier New", monospace';
                code.style.color = textColor;
                code.style.backgroundColor = 'transparent';
                code.style.padding = '0';
                code.style.borderRadius = '0';
                code.style.wordBreak = 'break-all';
                code.style.whiteSpace = 'pre-wrap';
                code.style.overflowWrap = 'break-word';
            });
        });
        
        // 优化引用样式
        const blockquotes = contentDiv.querySelectorAll('blockquote');
        blockquotes.forEach(blockquote => {
            blockquote.style.borderLeft = `4px solid ${textColor}`;
            blockquote.style.paddingLeft = '16px';
            blockquote.style.marginBottom = '18px';
            blockquote.style.opacity = '0.8';
            blockquote.style.wordBreak = 'break-word';
            blockquote.style.overflowWrap = 'break-word';
        });
        
        // 优化链接样式
        const links = contentDiv.querySelectorAll('a');
        links.forEach(link => {
            link.style.color = '#1a73e8';
            link.style.textDecoration = 'underline';
            link.style.wordBreak = 'break-all';
        });
        
        // 优化图片样式
        const images = contentDiv.querySelectorAll('img');
        images.forEach(img => {
            img.style.maxWidth = '100%';
            img.style.height = 'auto';
            img.style.borderRadius = '4px';
            img.style.marginBottom = '16px';
            img.style.display = 'block';
            img.style.marginLeft = 'auto';
            img.style.marginRight = 'auto';
        });
        
        // 确保所有子元素都有正确的样式
        const allElements = contentDiv.querySelectorAll('*');
        allElements.forEach(el => {
            el.style.color = textColor;
            el.style.fontFamily = fontFamily;
            el.style.wordBreak = 'break-word';
            el.style.overflowWrap = 'break-word';
            // 继承文字渲染优化属性
            el.style.textRendering = 'optimizeLegibility';
            el.style.webkitFontSmoothing = 'antialiased';
            el.style.mozOsxFontSmoothing = 'grayscale';
            el.style.letterSpacing = '0.3px';
            el.style.wordSpacing = '0.5px';
        });
        
        // 添加内容到临时容器
        tempContainer.appendChild(contentDiv);
        
        // 为内容添加适当的底部空间，确保内容和页脚之间有足够的距离
        const contentSpaceDiv = document.createElement('div');
        contentSpaceDiv.style.height = '15px';
        tempContainer.appendChild(contentSpaceDiv);
        
        // 添加底部标识
        const footerDiv = document.createElement('div');
        footerDiv.style.padding = '20px 0';
        footerDiv.style.textAlign = 'center';
        footerDiv.style.color = textColor; // 使用配色中指定的字体颜色
        footerDiv.style.fontSize = '14px';
        footerDiv.style.fontFamily = '"汇文明朝体", serif';
        footerDiv.style.fontStyle = 'normal'; // 常规字体，非斜体
        footerDiv.style.fontWeight = 'normal'; // 常规字体，非粗体
        footerDiv.style.opacity = '0.8'; // 调整透明度
        footerDiv.style.lineHeight = '1.5';
        footerDiv.innerHTML = '<span style="font-style: italic; font-size: 6px;">imggenby</span> <span style="font-size: 14px;">字格 ZiGe</span>';
        tempContainer.appendChild(footerDiv);
        
        // 添加到文档中
        document.body.appendChild(tempContainer);
        
        // 等待内容完全渲染和布局计算完成
        await new Promise(resolve => {
            // 先等待一小段时间让DOM更新
            setTimeout(() => {
                // 强制浏览器重排
                tempContainer.offsetHeight;
                // 再等待一小段时间确保所有内容都已渲染
                setTimeout(resolve, 400);
            }, 100);
        });
        
        // 动态计算实际内容高度，确保捕获完整内容
        const actualHeight = tempContainer.scrollHeight;
        
        // 使用html2canvas生成图片，添加详细配置以确保捕获完整内容
        const canvas = await html2canvas(tempContainer, {
            backgroundColor: background,
            scale: 2, // 提高清晰度
            useCORS: true,
            allowTaint: true,
            width: width,
            height: actualHeight,
            scrollX: 0,
            scrollY: 0,
            windowWidth: width,
            windowHeight: actualHeight,
            letterRendering: true,
            logging: false,
            removeContainer: false,
            useExif: false,
            imageTimeout: 0,
            ignoreElements: (element) => {
                // 忽略可能导致问题的元素
                return false;
            }
        });
        
        // 清理临时元素
        document.body.removeChild(tempContainer);
        
        return canvas;
    }
    
    // 绑定背景选择事件
    bindBackgroundSelectionEvents() {
        const backgroundOptions = document.querySelectorAll('.background-options .color-option');
        
        backgroundOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                // 移除所有激活状态
                backgroundOptions.forEach(opt => opt.classList.remove('active'));
                
                // 添加激活状态到当前选项
                e.currentTarget.classList.add('active');
                
                // 重新生成当前预览图以应用新背景
                const deviceOptions = document.querySelectorAll('.device-option');
                const activeDeviceOption = document.querySelector('.device-option.active');
                if (activeDeviceOption) {
                    const deviceType = activeDeviceOption.getAttribute('data-device');
                    this.updatePreviewImage(deviceType);
                }
            });
        });
    }
    
    // 更新预览图片
    async updatePreviewImage(deviceType) {
        const previewImg = document.getElementById('previewImage');
        const canvas = await this.generateImageForDevice(deviceType);
        const imgUrl = canvas.toDataURL('image/png');
        previewImg.src = imgUrl;
    }
    
    // 下载canvas为图片
    downloadCanvasAsImage(canvas, filename) {
        // 将canvas转换为blob
        canvas.toBlob((blob) => {
            // 创建下载链接
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            
            // 清理
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }, 'image/png', 0.95);
    }
    
    // 绑定模态框关闭事件
    bindModalCloseEvents(modal) {
        const closeBtn = modal.querySelector('.close');
        
        // 绑定关闭按钮事件
        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }
        
        // 当点击模态框外部时，关闭模态框
        const closeModal = (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
        
        window.addEventListener('click', closeModal);
        
        // 存储事件监听器以便后续移除
        modal._closeEventListener = closeModal;
    }
    
    // 初始化隐私条款功能
    setupPrivacyPolicy() {
        const privacyLink = document.getElementById('privacyLink');
        const privacyText = document.querySelector('.privacy-footer-text');
        const privacyModal = document.getElementById('privacyModal');
        
        const openPrivacyModal = () => {
            if (privacyModal) {
                privacyModal.style.display = 'block';
                this.bindModalCloseEvents(privacyModal);
            }
        };
        
        if (privacyLink) {
            privacyLink.addEventListener('click', openPrivacyModal);
        }
        
        if (privacyText) {
            privacyText.addEventListener('click', openPrivacyModal);
        }
    }
    
    // 设置配色选项的字体颜色
    setupColorOptionsTextColor() {
        const colorOptions = document.querySelectorAll('.background-options .color-option');
        colorOptions.forEach(option => {
            const textColor = option.getAttribute('data-text-color');
            if (textColor) {
                option.style.color = textColor;
            }
        });
    }
    
    // 绑定设备选项事件
    bindDeviceOptionEvents() {
        const deviceOptions = document.querySelectorAll('.device-option');
        
        deviceOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const clickedOption = e.currentTarget;
                
                // 移除所有选项的激活状态
                deviceOptions.forEach(opt => opt.classList.remove('active'));
                
                // 为当前选项添加激活状态
                clickedOption.classList.add('active');
            });
        });
    }
    
    // 绑定背景选项事件
    bindBackgroundOptionEvents() {
        const backgroundOptions = document.querySelectorAll('.background-options .color-option');
        
        backgroundOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const clickedOption = e.currentTarget;
                
                // 移除所有选项的激活状态
                backgroundOptions.forEach(opt => opt.classList.remove('active'));
                
                // 为当前选项添加激活状态
                clickedOption.classList.add('active');
            });
        });
    }
    
    // 更新实时预览
    updateRealtimePreview() {
        const deviceType = document.querySelector('.device-option.active').dataset.device;
        const backgroundColor = document.querySelector('.color-option.active').dataset.background;
        const textColor = document.querySelector('.color-option.active').dataset.textColor;
        
        const previewContainer = document.getElementById('realtimePreviewContainer');
        
        // 清空预览容器
        previewContainer.innerHTML = '';
        
        // 创建预览内容的克隆以进行预览
        const previewElement = document.getElementById('preview');
        
        // 保存预览元素的原始背景样式
        const originalBgColor = previewElement.style.backgroundColor;
        const originalBgImage = previewElement.style.backgroundImage;
        const originalBg = previewElement.style.background;
        
        // 临时移除预览元素的背景，避免克隆时出现双重背景
        previewElement.style.backgroundColor = 'transparent';
        previewElement.style.backgroundImage = 'none';
        previewElement.style.background = 'none';
        previewElement.style.borderRadius = '0';
        previewElement.style.boxShadow = 'none';
        
        // 克隆预览元素
        const clonedElement = previewElement.cloneNode(true);
        
        // 恢复预览元素的原始背景样式
        previewElement.style.backgroundColor = originalBgColor;
        previewElement.style.backgroundImage = originalBgImage;
        previewElement.style.background = originalBg;
        
        // 根据设备类型设置不同的宽度，高度将根据内容自适应
        let width;
        let isMobile = false;
        switch(deviceType) {
            case 'desktop':
                width = 1024;
                break;
            case 'tablet':
                width = 768;
                break;
            case 'phone':
                width = 375;
                isMobile = true;
                break;
            default:
                width = 1024;
        }
        
        // 应用编辑器的字体样式到克隆元素
        clonedElement.style.fontFamily = this.editor.style.fontFamily || 'inherit';
        clonedElement.style.fontSize = this.editor.style.fontSize || '14px';
        clonedElement.style.color = textColor; // 使用色彩模板中指定的字体颜色
        
        // 确保克隆元素中的所有子元素也继承正确的颜色，并且没有背景
        const allElements = clonedElement.querySelectorAll('*');
        allElements.forEach(el => {
            if (!el.style.color || el.style.color === 'inherit') {
                el.style.color = textColor; // 使用色彩模板中指定的字体颜色
            }
            // 彻底清除所有元素的背景样式，使用!important确保覆盖CSS
            el.style.backgroundColor = 'transparent !important';
            el.style.backgroundImage = 'none !important';
            el.style.background = 'none !important';
            // 清除所有可能的背景相关类
            el.classList.remove('preview-content', 'card', 'bg-white', 'bg-gray-50', 'bg-gray-100');
        });
        
        // 确保克隆元素本身也没有背景和额外的padding
        clonedElement.style.backgroundColor = 'transparent !important';
        clonedElement.style.backgroundImage = 'none !important';
        clonedElement.style.background = 'none !important';
        clonedElement.style.borderRadius = '0 !important';
        clonedElement.style.boxShadow = 'none !important';
        clonedElement.style.padding = '0 !important'; // 移除默认padding，避免额外的背景空间
        // 清除克隆元素可能的背景相关类
        clonedElement.classList.remove('preview-content', 'card', 'bg-white', 'bg-gray-50', 'bg-gray-100');
        
        // 创建一个临时容器用于预览
        const tempContainer = document.createElement('div');
        tempContainer.appendChild(clonedElement);
        tempContainer.style.background = backgroundColor;
        tempContainer.style.color = textColor; // 使用色彩模板中指定的字体颜色
        tempContainer.style.padding = '20px';
        tempContainer.style.width = `${width}px`;
        tempContainer.style.boxSizing = 'border-box';
        tempContainer.style.minHeight = 'auto'; // 改为auto，让高度根据内容自适应
        tempContainer.style.borderRadius = '12px'; // 添加圆角
        tempContainer.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.05)'; // 添加阴影
        tempContainer.style.overflow = 'visible';
        tempContainer.style.margin = '0 auto'; // 居中显示
        
        // 添加底部标识
        const footerDiv = document.createElement('div');
        footerDiv.style.marginTop = '20px';
        footerDiv.style.padding = '10px 0';
        footerDiv.style.textAlign = 'center';
        footerDiv.style.color = textColor; // 使用色彩模板中指定的字体颜色
        footerDiv.style.fontSize = '14px';
        footerDiv.style.fontFamily = '"汇文明朝体", serif';
        footerDiv.style.fontStyle = 'normal'; // 常规字体，非斜体
        footerDiv.style.fontWeight = 'normal'; // 常规字体，非粗体
        footerDiv.innerHTML = '<span style="font-style: italic; font-size: 6px;">imggenby</span> <span style="font-size: 14px;">字格 ZiGe</span>';
        tempContainer.appendChild(footerDiv);
        
        // 将预览容器添加到实时预览区域
        previewContainer.appendChild(tempContainer);
        
        // 如果是移动端，缩放预览容器以适应空间，但保持比例不变
        if (isMobile) {
            const scale = Math.min(1, (previewContainer.offsetWidth - 20) / width);
            if (scale < 1) {
                tempContainer.style.transform = `scale(${scale})`;
                tempContainer.style.transformOrigin = 'top center';
                tempContainer.style.width = `${width * scale}px`;
            }
        }
    }
}

// 添加textarea自动调整高度功能
function autoResizeTextarea() {
    const textarea = document.getElementById('editor');
    const preview = document.getElementById('preview');
    if (!textarea) return;
    
    // 检查是否为移动设备
    const isMobile = window.innerWidth <= 768;
    
    // 移动端不执行自动调整高度，使用CSS设置的固定高度
    if (isMobile) {
        return;
    }
    
    // 保存当前滚动位置和选择范围
    const scrollTop = textarea.scrollTop;
    const scrollLeft = textarea.scrollLeft;
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    
    // 完全重置高度，确保获取准确的scrollHeight
    const originalBoxSizing = textarea.style.boxSizing;
    const originalPadding = textarea.style.padding;
    const originalBorder = textarea.style.border;
    
    // 使用content-box计算高度，避免padding和border影响
    textarea.style.boxSizing = 'content-box';
    textarea.style.height = 'auto';
    textarea.style.overflow = 'hidden';
    
    // 计算精确的内容高度
    const scrollHeight = textarea.scrollHeight;
    const style = getComputedStyle(textarea);
    const minHeight = parseFloat(style.minHeight) || 150;
    
    // 设置新高度，确保至少达到最小高度
    const newHeight = Math.max(scrollHeight, minHeight);
    textarea.style.height = newHeight + 'px';
    
    // 恢复原始样式
    textarea.style.boxSizing = originalBoxSizing;
    textarea.style.overflow = 'auto';
    
    // 恢复滚动位置和选择范围
    textarea.scrollTop = scrollTop;
    textarea.scrollLeft = scrollLeft;
    textarea.selectionStart = selectionStart;
    textarea.selectionEnd = selectionEnd;
    
    // 强制重排以确保高度正确应用
    textarea.offsetHeight;
    
    // 同时调整编辑器面板的高度，确保完全包含内容
    const editorPanel = document.querySelector('.editor-panel');
    if (editorPanel) {
        // 精确计算编辑器面板所需的总高度
        const actionsElement = document.querySelector('.editor-actions');
        const statusBarElement = document.querySelector('.status-bar');
        
        const actionsHeight = actionsElement ? actionsElement.offsetHeight : 0;
        const statusBarHeight = statusBarElement ? statusBarElement.offsetHeight : 0;
        const h2Element = editorPanel.querySelector('h2');
        const h2Height = h2Element ? h2Element.offsetHeight : 0;
        
        // 计算内边距和边框
        const panelStyle = getComputedStyle(editorPanel);
        const panelPaddingTop = parseFloat(panelStyle.paddingTop) || 0;
        const panelPaddingBottom = parseFloat(panelStyle.paddingBottom) || 0;
        const panelBorderTopWidth = parseFloat(panelStyle.borderTopWidth) || 0;
        const panelBorderBottomWidth = parseFloat(panelStyle.borderBottomWidth) || 0;
        
        // 计算总高度
        const panelTotalHeight = newHeight + actionsHeight + statusBarHeight + h2Height + 
                               panelPaddingTop + panelPaddingBottom + 
                               panelBorderTopWidth + panelBorderBottomWidth;
        
        // 设置面板高度
        const panelMinHeight = parseFloat(panelStyle.minHeight) || 200;
        const panelNewHeight = Math.max(panelTotalHeight, panelMinHeight);
        editorPanel.style.height = panelNewHeight + 'px';
    }
    
    // 如果预览面板存在且当前有内容，也调整其高度
    if (preview && preview.innerHTML.trim() !== '') {
        // 重置预览区域高度
        preview.style.height = 'auto';
        
        // 设置预览区域高度为内容高度
        const previewMinHeight = parseFloat(getComputedStyle(preview).minHeight) || 150;
        const previewNewHeight = Math.max(preview.scrollHeight, previewMinHeight);
        preview.style.height = previewNewHeight + 'px';
        
        // 调整预览面板的高度
        const previewPanel = document.querySelector('.preview-panel');
        if (previewPanel) {
            const padding = 40; // 估计的内边距总和
            const panelMinHeight = parseFloat(getComputedStyle(previewPanel).minHeight) || 200;
            const panelNewHeight = Math.max(previewNewHeight + padding, panelMinHeight);
            previewPanel.style.height = panelNewHeight + 'px';
        }
    }
}

// 初始化编辑器
document.addEventListener('DOMContentLoaded', () => {
    const editor = new MarkdownEditor();
    
    // 初始化textarea自动调整高度功能
    const textarea = document.getElementById('editor');
    if (textarea) {
        // 初始调整
        autoResizeTextarea();
        
        // 监听输入事件
        textarea.addEventListener('input', autoResizeTextarea);
        
        // 监听粘贴事件
        textarea.addEventListener('paste', () => {
            // 延迟执行以确保内容已粘贴
            setTimeout(autoResizeTextarea, 0);
        });
        
        // 监听窗口大小变化
        window.addEventListener('resize', autoResizeTextarea);
    }
});

// 打开许可证模态框
function openLicenseModal() {
    // 创建模态框容器
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.style.display = 'block';
    modal.style.position = 'fixed';
    modal.style.zIndex = '9999';
    modal.style.left = '0';
    modal.style.top = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.overflow = 'auto';
    modal.style.backgroundColor = 'rgba(0,0,0,0.4)';
    
    // 创建模态框内容
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    modalContent.style.backgroundColor = '#fefefe';
    modalContent.style.margin = '15% auto';
    modalContent.style.padding = '20px';
    modalContent.style.border = '1px solid #888';
    modalContent.style.width = '80%';
    modalContent.style.maxWidth = '600px';
    modalContent.style.borderRadius = '8px';
    modalContent.style.maxHeight = '70vh';
    modalContent.style.overflowY = 'auto';
    
    // 创建关闭按钮
    const closeBtn = document.createElement('span');
    closeBtn.className = 'close';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.color = '#aaa';
    closeBtn.style.float = 'right';
    closeBtn.style.fontSize = '28px';
    closeBtn.style.fontWeight = 'bold';
    closeBtn.style.cursor = 'pointer';
    
    // 创建标题
    const title = document.createElement('h2');
    title.textContent = 'MIT License';
    title.style.marginTop = '0';
    
    // 创建许可证内容容器
    const licenseContent = document.createElement('div');
    licenseContent.style.whiteSpace = 'pre-wrap';
    licenseContent.style.fontFamily = '"Source Han Sans SC", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif';
    licenseContent.style.fontSize = '14px';
    licenseContent.style.lineHeight = '1.8';
    licenseContent.style.letterSpacing = '0.5px';
    
    // 直接硬编码许可证内容，避免浏览器本地文件访问限制
    const licenseText = `MIT License
MIT许可协议

Copyright (c) 2026 饸饹随笔
版权所有 (c) 2026 饸饹随笔

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
特此授予任何获得本软件及相关文档文件（以下简称"软件"）副本的人免费使用许可，允许其不受限制地处理本软件，包括但不限于使用、复制、修改、合并、发布、分发、再许可和/或出售软件副本的权利，以及允许已获得软件的人员进行上述操作，但需遵守以下条件：

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
上述版权声明和本许可声明应包含在软件的所有副本或实质部分中。

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
本软件按"现状"提供，不附带任何形式的保证，无论是明示的还是默示的，包括但不限于适销性保证、特定用途适用性保证和不侵权保证。在任何情况下，作者或版权持有人均不对任何索赔、损害赔偿或其他责任承担责任，无论该责任是基于合同、侵权行为或其他原因产生的，且与软件、软件的使用或其他交易相关联、源于此或由此引发。

`;
    
    licenseContent.textContent = licenseText;
    
    // 组装模态框
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(title);
    modalContent.appendChild(licenseContent);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    // 绑定关闭事件
    closeBtn.onclick = function() {
        modal.style.display = 'none';
        document.body.removeChild(modal);
    };
    
    // 点击模态框外部关闭
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            document.body.removeChild(modal);
        }
    };
}