---
share: true
---
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260130000915998.png|file-20260130000915998.png]]
# 第一章 ComfyUI 基础概念与安装

## 1.1 ComfyUI 的本质与节点式架构
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260129233853038.png|file-20260129233853038.png]]

**定义** ComfyUI 是一个用于在本地运行 AI 模型（主要是图像生成模型如 Stable Diffusion）的基于节点的图形用户界面（GUI）。不同于 Forge UI 或 Fooocus 等将功能隐藏在按钮后的界面，ComfyUI 展示了数据流动的完整过程,。 $$ \text{Model} \xrightarrow{\text{Nodes}} \text{Interface} \xrightarrow{\text{Output}} $$

> **直观理解** 想象 AI 模型是一个非常强大的“大脑”或“引擎”，但你无法直接与它对话。ComfyUI 就像是你自己搭建的控制面板，通过连接不同的“乐高积木”（节点），你可以清楚地看到提示词（Prompts）、模型（Models）和采样器（Samplers）是如何像电路一样连接在一起工作的。

**操作步骤：理解节点优势**

1. 观察其他 UI：通常只有“生成”按钮和输入框，通过黑盒处理。
2. 观察 ComfyUI：你可以看到数据从加载模型开始，经过编码，进入采样器，最后解码成图像的每一步。

## 1.2 本地安装版本选择 (Portable Version)
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260129233949883.png|file-20260129233949883.png]]

**概念** 本教程推荐在 Windows 系统上使用 **ComfyUI Portable Version**（便携版）。这是一个自包含的文件夹，内置了独立的 Python 环境和依赖库,。

> **直观理解** 便携版就像一个“绿色软件”或“U盘系统”。它不依赖你电脑系统里安装的 Python 版本，所有的文件、模型、设置都在一个文件夹里。你可以随时把它复制到移动硬盘，或者在不影响系统其他软件的情况下删除它,。

**操作步骤：使用 Easy Install 安装**

1. 访问 ComfyUI Easy Install 的 GitHub 页面（由 IVO 制作）。
2. 下载压缩包并解压到目标磁盘（建议 SSD 以提高模型加载速度）。
3. 运行 `.bat` 安装脚本。它会自动安装 Git、配置 Python 环境并下载必要的节点,。
4. 安装完成后，你会看到 `run_nvidia_gpu.bat` 或类似的启动脚本。

# 第二章 界面概览与工作流基础

## 2.1 工作流文件结构 (.json)
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260129234227654.png|file-20260129234227654.png]]

**定义** ComfyUI 的工作流（Workflow）本质上是 **JSON** (JavaScript Object Notation) 格式的文本文件。它存储了节点的位置、连接关系、参数设置和提示词，但不包含模型或图像本身,。

> **直观理解** 工作流文件就像是一张“藏宝图”或“乐谱”。它告诉 ComfyUI 需要哪些乐器（模型）以及如何演奏（参数设置），但它不包含乐器本身。因此，分享工作流非常容易，因为文件很小，但接收者需要自己下载对应的模型。

**操作步骤：加载与保存工作流**

1. **加载**：将 `.json` 文件或包含工作流元数据的 `.png` 图片直接拖入 ComfyUI 画布，或点击右侧菜单栏的 `Load`,。
2. **保存**：点击菜单栏的 `Save` 或 `Export` 生成 `.json` 文件,。

## 2.2 界面导航与菜单系统
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260129234243008.png|file-20260129234243008.png]]
**功能布局**

- **Canvas (画布)**：放置和连接节点的区域，按住鼠标左键或滚轮可移动视图，滚轮缩放,。
- **Main Menu (主菜单)**：点击悬浮条上的 `ComfyUI` 图标或右键点击空白处唤起。包含 `Load`, `Save`, `Manager` (如果安装了插件), `Clear` 等功能。
- **Queue Prompt (运行按钮)**：通常位于侧边栏或悬浮条，用于执行当前工作流。

**操作步骤：基本视图控制**

1. **移动画布**：在空白处按住鼠标左键拖动，或按住空格键拖动。
2. **缩放**：滚动鼠标滚轮放大或缩小节点视图。
3. **重置视图**：如果迷失方向，可以使用 `View` 菜单中的重置选项或快捷键。

# 第三章 节点与连接逻辑

## 3.1 节点的输入与输出 (Inputs & Outputs)
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260129234606366.png|file-20260129234606366.png]]
**原理** 每个节点（Node）由三部分组成：

1. **Title (标题)**：显示节点功能。
2. **Widgets/Parameters (参数)**：输入数值或文本的控件。
3. **Slots (插槽)**：
    - **Input (左侧)**：接收数据。
    - **Output (右侧)**：输出数据。 连接遵循强类型规则，通常只有**相同颜色**和**相同类型**的插槽才能连接（例如 `IMAGE` 连 `IMAGE`, `LATENT` 连 `LATENT`）,。

> **直观理解** 节点就像工厂里的流水线机器。原料（Input）从左边进去，经过机器加工（参数设置），产品（Output）从右边出来。你不能把“面粉”（Image）塞进“炼钢炉”（Model Input），接口形状（颜色）会阻止你这么做,。

**操作步骤：添加与连接节点**

1. **添加节点**：双击画布空白处，弹出搜索框，输入节点名称（如 "Load Image"）并选择。
2. **连接**：从一个节点的输出点（Output dot）拖出线条，拉到另一个节点的输入点（Input dot）。松开鼠标即可连接。
3. **断开**：在连接点上点击并拖走，或者点击连接线中间的小圆点选择删除。

## 3.2 基础图像处理工作流实例
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260129234832843.png|file-20260129234832843.png]]
**流程逻辑** 一个最简单的非 AI 图像处理工作流： $$ \text{Load Image} \xrightarrow{\text{IMAGE}} \text{Image Crop} \xrightarrow{\text{IMAGE}} \text{Save Image} $$

**例题：构建图像裁剪工作流**

1. **添加节点**：双击搜索并添加 `Load Image`，`Image Crop`，`Save Image`,。
2. **连接**：
    - 将 `Load Image` 的 `IMAGE` 输出连接到 `Image Crop` 的 `IMAGE` 输入。
    - 将 `Image Crop` 的 `IMAGE` 输出连接到 `Save Image` 的 `images` 输入。
3. **设置参数**：在 `Image Crop` 中设置裁剪的 `width`, `height`, `x`, `y`。
4. **执行**：点击 `Queue Prompt`。
5. **结果**：在 `Save Image` 节点或输出文件夹中查看裁剪后的图片。
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260130011947638.png|file-20260130011947638.png]]
# 第四章 高级操作与逻辑节点

## 4.1 节点组 (Groups) 与 快捷操作
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260129234925101.png|file-20260129234925101.png]]
**功能**

- **Groups (组)**：用于组织管理多个节点，像文件夹一样。移动组会移动内部所有节点。
- **Bypass (旁路)**：暂时禁用节点，数据流会尝试跳过该节点直接传递（如果类型匹配）。快捷键 `Ctrl+B` 或右键菜单。
- **Mute (静音)**：完全停用节点，数据流在此中断。在组上使用可停用整组。

> **直观理解** **Group** 就像是一个收纳盒，把相关的零件放在一起，方便一起搬运。**Bypass** 就像电路中的短路开关，电流直接流过不经过电器。**Mute** 则是直接切断电源，电路不通,。

**操作步骤：创建与管理组**

1. **创建组**：按住 `Ctrl` 框选多个节点 -> 右键空白处 -> `Add Group for Selected Nodes`。
2. **调整组**：拖动组标题栏可移动整体；双击标题可重命名。
3. **Bypass/Mute**：右键点击节点或组，在属性中选择 `Bypass` 或 `Mode -> Never` (Mute),。

## 4.2 原始数据节点 (Primitive Node) 与 数学运算
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260129235558868.png|file-20260129235558868.png]]
**定理** `Primitive Node` 是一个通用节点，它可以根据连接的目标端口自动转换为相应的数据类型（整数、浮点数、字符串等）。它常用于将一个参数同时传递给多个节点，实现参数统一控制,。 $$ \text{Primitive} \xrightarrow{\text{connect to INT}} \text{INT Widget} $$ $$ \text{Primitive} \xrightarrow{\text{connect to STRING}} \text{STRING Widget} $$

> **直观理解** `Primitive Node` 就像一张万能支票。你把它交给谁，它就变成谁需要的货币。如果你把它连到“步数”输入，它就是数字；连到“提示词”输入，它就是文本。这让你能一处修改，处处生效。

**例题：使用 Math Nodes 进行自动化计算**

1. **目标**：计算 $A \times B$ 的结果。
2. **添加节点**：添加 `Math Int` (或类似数学节点) 和 `Preview as Text`,。
3. **转换输入**：右键点击 `Math Int` 节点，选择将 `a` 和 `b` 转换为输入端口（如果支持），或者直接在参数框输入。
4. **连接 Primitive**：添加 `Primitive Node`，连接到 `Math Int` 的输入端。此时 Primitive 自动变为整数输入框。
5. **查看结果**：将 `Math Int` 输出连接到 `Preview as Text`，运行查看结果。

# 第五章 扩散模型原理与文生图工作流构建

## 5.1 扩散模型核心组件映射 (The "Photographer" Analogy)
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260129235025949.png|file-20260129235025949.png]]
**理论映射** 构建 Text-to-Image (文生图) 工作流需要理解以下核心角色的对应关系-：

|角色/功能|ComfyUI 节点|作用描述|
|:--|:--|:--|
|**摄影师 (Brain)**|`Load Checkpoint`|包含 AI 训练的所有知识 (Model, Clip, VAE)。|
|**指令 (Instructions)**|`CLIP Text Encode`|将人类语言 (Prompt) 翻译成 AI 能懂的条件 (Conditioning)。需要正向和负向两组。|
|**相纸 (Paper)**|`Empty Latent Image`|定义图像的尺寸 (Width, Height) 和批次大小。此时图像是纯噪点。|
|**拍摄过程 (Shoot)**|`KSampler`|核心去噪过程。根据 Seed、Steps、CFG 进行计算。|
|**暗房冲洗 (Develop)**|`VAE Decode`|将潜空间 (Latent) 的数据解压为可视化的像素图像 (Pixel Image)。|
|**交付照片 (Deliver)**|`Save Image`|保存最终结果到硬盘。|

> **直观理解** **Load Checkpoint** 是雇佣摄影师；**CLIP** 是你给摄影师的拍摄需求清单（要什么，不要什么）；**Empty Latent** 是你选好的相纸大小；**KSampler** 是摄影师按下快门进行拍摄和修图的实际过程；**VAE Decode** 是把底片（Latent）洗成照片；**Save Image** 是把照片装进相框给你-。

## 5.2 构建标准 Text-to-Image 工作流
![[./assets/p1：ComfyUI入门：从安装到文生图工作流/file-20260129235800532.png|file-20260129235800532.png]]
**步骤详解**

1. **加载模型 (Hire Photographer)**:
    - 添加 `Load Checkpoint` 节点。
    - 选择模型文件 (例如 `Juggernaut Reborn`)。
2. **设置提示词 (Instructions)**:
    - 添加两个 `CLIP Text Encode` 节点。
    - 将模型的 `CLIP` 输出连接到这两个节点的 `clip` 输入。
    - 将一个改名为“Positive Prompt”（绿色），另一个为“Negative Prompt”（红色）,。
3. **定义尺寸 (Paper)**:
    - 添加 `Empty Latent Image` 节点。
    - 设置 `width` 和 `height` (推荐 512x512 用于 SD1.5)。
4. **核心生成 (Photo Shoot)**:
    - 添加 `KSampler` 节点。
    - **连接模型**：`Load Checkpoint` (MODEL) $\to$ `KSampler` (model)。
    - **连接正向提示词**：Positive `CLIP Text Encode` (CONDITIONING) $\to$ `KSampler` (positive)。
    - **连接负向提示词**：Negative `CLIP Text Encode` (CONDITIONING) $\to$ `KSampler` (negative)。
    - **连接潜空间图像**：`Empty Latent Image` (LATENT) $\to$ `KSampler` (latent_image)。
5. **解码图像 (Develop)**:
    - 添加 `VAE Decode` 节点。
    - 连接 `KSampler` (LATENT) $\to$ `VAE Decode` (samples)。
    - 连接 `Load Checkpoint` (VAE) $\to$ `VAE Decode` (vae)。
6. **保存图像 (Deliver)**:
    - 添加 `Save Image` 节点。
    - 连接 `VAE Decode` (IMAGE) $\to$ `Save Image` (images)。

**重要公式：潜空间分辨率** 模型训练时的分辨率决定了最佳生成尺寸。 $$ \text{Target Resolution} \approx \text{Training Resolution} $$ 对于 SD 1.5，推荐 $512 \times 512$。如果设置过大（如 2048x2048），会导致图像出现重复、畸变或伪影，因为模型不知道如何处理这么大的空间。