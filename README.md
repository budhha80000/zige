# 字格 ZiGe by 饸饹随笔
轻量 Markdown 编辑器，支持一键导出 PDF、HTML 与图片格式

# 字格 ZiGe Markdown 编辑器项目说明

## 项目概述

这是一个功能强大的在线 Markdown 编辑器，支持实时预览、多种导出格式和丰富的编辑工具。该编辑器专为中文用户优化，提供了多种中文字体选择和友好的用户界面，同时针对 iOS 设备进行了特别优化。

### 主要功能

- **实时预览**：编辑内容时实时生成预览效果
- **字体选择**：支持多种中文字体，包括思源黑体、思源宋体、阿里妈妈刀隶体、阿里妈妈东方大楷、阿里妈妈数黑体、爱点风雅黑、钉钉进步体、得意黑、鸿雷拙手简体、汇文明朝体、朱雀仿宋（按拼音排序）
- **字号调整**：提供小、中、大、特大四种字号选项
- **字重设置**：支持 Extralight、Light、Regular、Medium、Bold、Heavy 六种字重
- **丰富的编辑工具**：粗体、斜体、标题、代码块、列表、链接、图片等
- **文件操作**：支持上传、下载 Markdown 文件
- **高级导出功能**：
  - 导出为 HTML
  - 导出为 PNG 图片（支持多种设备类型和背景选项）
  - 图片生成时支持所有 Markdown 元素的完整样式
  - 代码块和行内代码自动适配换行
  - 页脚高度自动适配内容高度
- **历史记录**：支持撤销/重做操作
- **响应式设计**：适配不同屏幕尺寸
- **iOS 兼容性优化**：
  - 支持触摸事件
  - 优化了字体选择器在 iOS 上的表现
  - 响应式设计适配不同屏幕尺寸
 
<div style="text-align:center">![示例01](https://github.com/budhha80000/zige/blob/main/assets/images/demo01.png) </div>
 

![示例01](https://github.com/budhha80000/zige/blob/main/assets/images/demo01.png) 
  

## 安装指南

### 本地安装

1. **克隆项目**

   ```bash
   git clone https://github.com/budhha80000/zige.git
   cd zige
   ```

2. **直接打开**

   由于这是一个纯前端项目，您可以直接在浏览器中打开 `index.html` 文件即可使用。

3. **本地服务器（推荐）**

   为了获得更好的体验，建议使用本地服务器运行：

   ```bash
   # 使用 Python 3
   python -m http.server 8000
   
   # 或使用 Python 2
   python -m SimpleHTTPServer 8000
   
   # 或使用 Node.js
   npx serve .
   ```

   然后在浏览器中访问 `http://localhost:8000`

### Docker 安装

#### 前提条件

- 已安装 Docker

#### 安装步骤

1. **创建 Dockerfile**

   在项目根目录创建 `Dockerfile` 文件：

   ```dockerfile
   # 使用 Nginx 作为基础镜像
   FROM nginx:alpine
   
   # 复制项目文件到 Nginx 静态文件目录
   COPY . /usr/share/nginx/html
   
   # 暴露 80 端口
   EXPOSE 80
   ```

2. **构建 Docker 镜像**

   ```bash
   docker build -t markdown-editor .
   ```

3. **运行 Docker 容器**

   ```bash
   docker run -d -p 8080:80 --name markdown-editor markdown-editor
   ```

   然后在浏览器中访问 `http://localhost:8080`

### Docker Compose 安装

#### 前提条件

- 已安装 Docker 和 Docker Compose

#### 安装步骤

1. **创建 docker-compose.yml 文件**

   在项目根目录创建 `docker-compose.yml` 文件：

   ```yaml
   version: '3'
   services:
     markdown-editor:
       build: .
       ports:
         - "8080:80"
       restart: unless-stopped
       volumes:
         - ./:/usr/share/nginx/html
       environment:
         - TZ=Asia/Shanghai
   ```

2. **启动服务**

   ```bash
   docker-compose up -d
   ```

3. **访问应用**

   在浏览器中访问 `http://localhost:8080`

## Docker 安装指南

### Windows

1. **下载 Docker Desktop**

   访问 [Docker 官方网站](https://www.docker.com/products/docker-desktop) 下载 Docker Desktop for Windows。

2. **安装 Docker Desktop**

   运行安装程序，按照提示完成安装。安装完成后，Docker 会自动启动。

3. **验证安装**

   打开命令提示符或 PowerShell，运行以下命令：

   ```bash
   docker --version
   docker-compose --version
   ```

### macOS

1. **下载 Docker Desktop**

   访问 [Docker 官方网站](https://www.docker.com/products/docker-desktop) 下载 Docker Desktop for Mac。

2. **安装 Docker Desktop**

   打开下载的 `.dmg` 文件，将 Docker 图标拖动到 Applications 文件夹。

3. **验证安装**

   打开终端，运行以下命令：

   ```bash
   docker --version
   docker-compose --version
   ```

### Linux

#### Ubuntu/Debian

1. **更新系统**

   ```bash
   sudo apt-get update
   sudo apt-get upgrade
   ```

2. **安装依赖**

   ```bash
   sudo apt-get install apt-transport-https ca-certificates curl software-properties-common
   ```

3. **添加 Docker GPG 密钥**

   ```bash
   curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo apt-key add -
   ```

4. **添加 Docker 仓库**

   ```bash
   sudo add-apt-repository "deb [arch=amd64] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable"
   ```

5. **安装 Docker**

   ```bash
   sudo apt-get update
   sudo apt-get install docker-ce docker-ce-cli containerd.io
   ```

6. **安装 Docker Compose**

   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

7. **验证安装**

   ```bash
   docker --version
   docker-compose --version
   ```

#### CentOS/RHEL

1. **更新系统**

   ```bash
   sudo yum update
   ```

2. **安装依赖**

   ```bash
   sudo yum install -y yum-utils device-mapper-persistent-data lvm2
   ```

3. **添加 Docker 仓库**

   ```bash
   sudo yum-config-manager --add-repo https://download.docker.com/linux/centos/docker-ce.repo
   ```

4. **安装 Docker**

   ```bash
   sudo yum install docker-ce docker-ce-cli containerd.io
   ```

5. **启动 Docker 服务**

   ```bash
   sudo systemctl start docker
   sudo systemctl enable docker
   ```

6. **安装 Docker Compose**

   ```bash
   sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   sudo chmod +x /usr/local/bin/docker-compose
   ```

7. **验证安装**

   ```bash
   docker --version
   docker-compose --version
   ```

## 使用指南

### 基本编辑

1. 在左侧编辑器面板中输入 Markdown 语法
2. 右侧预览面板会实时显示渲染效果
3. 使用工具栏按钮可以快速插入常用的 Markdown 语法

### 字体设置

所有字体如果显示不正常（后缀为ttf-truetype fonts/OTF-opentype fonts）请下载后放在项目的子目录 assets/fonts 下。
以下字体下载地址，自由字体：
```URL
https://ziyouziti.com
```

1. 使用字体下拉菜单选择字体：
   - 思源黑体（默认）
   - 思源宋体
   - 阿里妈妈刀隶体
   - 阿里妈妈东方大楷
   - 阿里妈妈数黑体
   - 爱点风雅黑
   - 钉钉进步体
   - 得意黑
   - 鸿雷拙手简体
   - 汇文明朝体
   - 朱雀仿宋
2. 使用字重下拉菜单调整字重：Extralight、Light、Regular、Medium、Bold、Heavy
3. 使用字号下拉菜单调整字体大小：小、中、大、特大

### 导出功能

1. **导出为 HTML**：点击工具栏中的 "导出 HTML" 按钮
2. **导出为 PNG**：点击 "图片生成设置" 按钮，配置相关选项后生成图片

### 文件操作

1. **上传文件**：点击 "打开" 按钮选择 Markdown 文件
2. **清空编辑器**：点击 "清空" 按钮

## 故障排除

### 常见问题

1. **字体显示不正确**
   - 确保网络连接正常，字体文件需要从 CDN 加载
   - 尝试刷新页面

2. **导出功能无法使用**
   - 检查浏览器控制台是否有错误信息
   - 确保浏览器支持 Canvas API（用于 PNG 导出）

3. **Docker 容器无法启动**
   - 检查端口是否被占用
   - 查看容器日志：`docker logs markdown-editor`

### iOS 兼容性

该编辑器已针对 iOS 设备进行了优化：

- 支持触摸事件
- 优化了字体选择器在 iOS 上的表现
- 响应式设计适配不同屏幕尺寸

## 版本历史

- v15.0: 最新版本
  - 添加多种中文字体支持：阿里妈妈刀隶体、阿里妈妈东方大楷、阿里妈妈数黑体、爱点风雅黑、钉钉进步体、得意黑、鸿雷拙手简体、汇文明朝体、朱雀仿宋
  - 字体选择按拼音排序
  - 增强字重设置功能，支持六种字重选择
  - 添加图片快捷按钮到编辑工具栏
  - 优化编辑器默认选项显示
  - 修复展开/收起更多快捷按钮功能
  - 字体设置持久化保存到 localStorage
  - 网页 header 标题使用汇文明朝体字体
  - 图片生成页脚文字更改为"imggenby 字格 ZiGe"
  - 图片生成页脚使用汇文明朝体字体
  - 页脚添加 GitHub 项目链接
  - 更新项目文档说明
- v11.0.1: 
  - 更新 MIT 许可证的完整内容，添加中文翻译
  - 实现 MIT 许可证点击后在当前页面打开弹出窗口
  - 优化许可证弹出窗口的样式和字体显示
  - 修复许可证文件加载失败的问题
- v11.0: 功能增强
  - 优化图片生成功能，支持所有 Markdown 元素的完整样式
  - 代码块和行内代码自动适配换行
  - 页脚高度自动适配内容高度
  - 字体选择按照字母排序
  - 增强 iOS 兼容性
  - 界面优化和性能改进
- v10.5: 功能增强
- v10.4: 功能增强
- v10.3.1: bug 修复
- v10.3: 性能优化
- v10.2: 界面改进
- v10.1: 功能扩展
- v10.0: 重大更新
- v9.0: 稳定性改进
- v8.0: 导出功能增强
- v7.0: 界面优化
- v6.0: 功能扩展
- v5.0: 性能改进
- v4.0: 核心功能完善
- v3.0: 基本功能实现
- v2.0: 项目结构优化
- v1.0: 初始版本

## 许可证

本项目采用 MIT 许可证，详细内容如下：

### MIT License (MIT许可协议)

**Copyright (c) 2026 饸饹随笔**
**版权所有 (c) 2026 饸饹随笔**

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

**特此授予任何获得本软件及相关文档文件（以下简称"软件"）副本的人免费使用许可，允许其不受限制地处理本软件，包括但不限于使用、复制、修改、合并、发布、分发、再许可和/或出售软件副本的权利，以及允许已获得软件的人员进行上述操作，但需遵守以下条件：**

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

**上述版权声明和本许可声明应包含在软件的所有副本或实质部分中。**

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

**本软件按"现状"提供，不附带任何形式的保证，无论是明示的还是默示的，包括但不限于适销性保证、特定用途适用性保证和不侵权保证。在任何情况下，作者或版权持有人均不对任何索赔、损害赔偿或其他责任承担责任，无论该责任是基于合同、侵权行为或其他原因产生的，且与软件、软件的使用或其他交易相关联、源于此或由此引发。**

## 贡献

欢迎提交 Issue 和 Pull Request 来帮助改进这个项目。

## 联系方式

- 作者：蛮菩萨
- 驱动：囫囵拓扑

<center>![示例02](https://github.com/budhha80000/zige/blob/main/assets/images/demo02.png)</center>
