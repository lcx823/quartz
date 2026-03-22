---
share: true
---
这份指南是针对 **ComfyUI 高级工作流与模型优化** 的深度教程，旨在通过模块化的逻辑帮助用户从基础操作跨越到专业级应用。文本的核心架构围绕 **效率封装、精准控制与性能平衡** 三大主题展开，首先介绍了如何利用 **子图与模板** 将复杂的节点逻辑简化为可复用的“黑盒子”，以优化画布的整洁度。随后，文章深入探讨了 **LoRA 微调与 ControlNet 结构控制** 的技术细节，解释了如何在保留大模型底蕴的同时，通过注入特定风格或空间构图来精准引导 AI 的创作。最后，针对硬件限制提供了 **模型量化（如 GGUF/FP8 格式）与批处理优化** 的实用方案，确保用户能在有限的显存条件下，通过 **Turbo/LCM 架构** 实现高效、自动化的图像生成。
# 第六章 封装与复用：子图与模板 (Subgraphs & Templates)

## 6.1 子图 (Subgraphs) 的构建与逻辑
![[./assets/p2：ComfyUI 高级工作流与模型优化指南/file-20260130003031046.png|file-20260130003031046.png]]
**定义** 子图（Subgraph）是将多个节点封装为一个单一节点的机制，类似于编程中的函数（Function）或 Photoshop 中的智能对象。它用于减少视觉混乱、复用逻辑逻辑块。 $$ \text{Subgraph}(\text{Inputs}) \rightarrow { \text{Node}_1 \rightarrow \text{Node}_2 \rightarrow \dots } \rightarrow \text{Outputs} $$

> **直观理解** 想象你有一堆乱七八糟的电线（节点连接），你把它们全部塞进一个黑盒子里，只留出几个插口（输入参数）和几个插头（输出结果）。这样你的工作台（画布）看起来就干净多了，而且这个黑盒子可以在其他地方直接拿来用。

**操作步骤：创建与编辑子图**

1. **创建**：按住 `Ctrl` 框选多个节点，在选中区域右键点击，选择 `Convert Selection to Subgraph`。
2. **解包**：右键点击子图节点，选择 `Unpack Subgraph` 可将其还原为原始节点。
3. **参数暴露**：右键点击子图，选择 `Edit Subgraph Widgets`，勾选需要显示在子图节点面板上的参数（如 seed, steps），使其无需进入内部即可调节。
4. **内部编辑**：点击子图节点上的进入图标（通常是小方块箭头），修改内部连接。使用 `Unpack` 以外的方式修改内部逻辑不会破坏封装结构。

## 6.2 模板系统 (Templates)
![[./assets/p2：ComfyUI 高级工作流与模型优化指南/file-20260130004427858.png|file-20260130004427858.png]]
**定义** 模板是将当前选中的节点组合（可以是子图，也可以是普通节点集合）保存为可快速调用的预设。不同于 `.json` 工作流文件，模板存储在浏览器缓存或特定目录下，方便在现有工作流中插入片段。

> **直观理解** 如果工作流是“整篇文章”，那么模板就是“常用短语”或“签名档”。你不需要每次都重写一遍，只需右键点击粘贴即可。

**例题：保存提示词模板**

1. **选择**：选中一个配置好的 `CLIP Text Encode` 节点或一组常用的注释节点。
2. **保存**：右键点击画布空白处（或节点），选择 `Save Selected as Template`，输入名称（如 "My Standard Prompts"）。
3. **调用**：在任何工作流中，右键点击画布 -> `Node Templates` -> 选择刚才保存的模板名称。

# 第七章 模型微调：LoRA (Low-Rank Adaptation)

## 7.1 LoRA 的工作原理
![[./assets/p2：ComfyUI 高级工作流与模型优化指南/file-20260130004452205.png|file-20260130004452205.png]]
**定理** LoRA (Low-Rank Adaptation) 是一种无需重新训练整个大模型即可注入新风格或概念的技术。它通过在原有模型权重 $W$ 上附加一个小的权重增量 $\Delta W$ 来工作。 $$ W_{new} = W_{base} + \alpha \cdot \Delta W_{LoRA} $$ 其中 $\alpha$ 是强度系数（Strength）。

> **直观理解** 如果主模型（Checkpoints）是刚毕业的全能摄影师，LoRA 就是让他去进修的短期培训班。比如“蛋糕摄影培训班”（Cake Style LoRA）。他还是那个摄影师，但他现在学会了专门拍蛋糕的技巧。你可以让他同时上好几个培训班（Stacking LoRA），但他还是原来的那个人。

**操作步骤：加载 LoRA**

1. **添加节点**：使用 `Load LoRA (Model Only)` 或 `LoRA Loader` 节点。
2. **连接逻辑**：
    - 将 `Load Checkpoint` 的 `MODEL` 和 `CLIP` 输出连接到 LoRA Loader 的输入。
    - 将 LoRA Loader 的 `MODEL` 和 `CLIP` 输出连接到 `KSampler` 或下一个 LoRA Loader。
3. **触发词 (Trigger Words)**：LoRA 通常需要特定的提示词才能激活效果。需要在 Prompt 中包含这些词（如 "cake style"）。
4. **强度调节**：通过 `strength_model` 和 `strength_clip` 参数调节。推荐范围通常在 $0.6$ 到 $1.0$ 之间。

## 7.2 多重 LoRA 堆叠 (Stacking)

**概念** 可以通过串联多个 LoRA Loader 节点来混合不同的风格或角色。 $$ \text{Model} \xrightarrow{\text{LoRA}_1} \text{Model}' \xrightarrow{\text{LoRA}_2} \text{Model}'' \rightarrow \text{Sampler} $$

**例题：构建多风格工作流**

1. **节点准备**：放置一个 `Load Checkpoint` 和两个 `LoRA Loader`。
2. **串联**：
    - Checkpoint $\to$ LoRA A (Style) $\to$ LoRA B (Character) $\to$ KSampler。
    - 注意：每经过一个 LoRA 节点，模型的数据流都会被修改。
3. **参数设置**：
    - LoRA A 强度设为 $0.6$（避免风格过强）。
    - LoRA B 强度设为 $0.8$。
4. **提示词**：在 CLIP Text Encode 中同时写入 LoRA A 和 LoRA B 的触发词。

# 第八章 结构控制：ControlNet

## 8.1 ControlNet 核心机制

**定义** ControlNet 是一个附加的神经网络层，用于在扩散过程中引入额外的空间条件（Spatial Conditioning）。它允许用户通过边缘图、深度图或姿态图来“锁定”图像的结构，而让 AI 仅发挥在纹理和风格上的创造力。

> **直观理解** 纯 Prompt 生成就像告诉画家“画一个站着的人”，画家可以随意发挥姿势。ControlNet 就像是给画家一张线稿底图，告诉他“必须画在这个轮廓里，姿势不能变，衣服和颜色你自己定”。

**重要表格：常见 ControlNet 类型**

|类型|预处理器 (Preprocessor)|作用|适用场景|
|:--|:--|:--|:--|
|**Canny**|Canny Edge|提取硬边缘线条|保留构图细节，线稿上色|
|**Depth**|Depth Anything / Midas|提取前后景深信息|保持三维空间结构，物体体积感|
|**OpenPose**|DW Pose / OpenPose|提取人体骨骼点|只需要固定人物动作，不固定外貌|

## 8.2 构建 ControlNet 工作流

**流程图** $$ \text{Image} \xrightarrow{\text{Preprocessor}} \text{Control Map} \xrightarrow{\text{Apply ControlNet}} \text{Conditioning} $$

**例题：使用 Canny 边缘控制生成**

1. **准备输入**：添加 `Load Image` 节点，加载一张参考图（如手绘草图）。
2. **预处理**：添加 `Canny Edge Preprocessor`（属于 ControlNet Preprocessors），连接图像。
3. **加载模型**：添加 `Load ControlNet Model`，选择 `control_canny-fp16.safetensors`（必须与底模版本匹配，如 SD1.5 配 SD1.5 的 CN）。
4. **应用控制**：
    - 添加 `Apply ControlNet` 节点。
    - 输入连接：`Positive Prompt` (Conditioning), `ControlNet Model`, `Preprocessor Image` (作为 image 输入)。
    - 输出连接：将输出的 Conditioning 连接到 `KSampler` 的 `positive` 输入。
5. **参数调整**：
    - `Strength`: 控制权重的强弱（默认 1.0）。
    - `Start %` / `End %`: 控制介入的时机。例如 `End=0.8` 表示最后 20% 的步数释放控制，让 AI 自由发挥细节。

# 第九章 模型格式与优化 (FP16/FP8/GGUF)

## 9.1 模型精度与显存权衡

**分类体系** AI 模型本质是巨大的数字矩阵。存储这些数字的精度决定了模型的大小和速度。

|格式|描述|显存占用|速度|推荐场景|
|:--|:--|:--|:--|:--|
|**FP16**|半精度浮点数 (Standard)|中|快|大多数显卡 (6GB+ VRAM)|
|**FP8**|8位浮点数|低|较快|较新显卡 (40系)，或显存不足时|
|**GGUF**|量化模型 (Q4/Q6/Q8)|极低|慢(取决于CPU/GPU)|极低显存或仅通过 CPU 运行|
|**AIO**|All-In-One|含 VAE/CLIP|-|新手推荐，一键加载|

> **直观理解** **FP16** 就像高清电影，画质好但文件大。**GGUF/Quantized** 就像压缩后的视频，文件小了，显存够用了，但某些微小的细节（比如远处的螺丝钉）可能会变模糊或丢失。**Q4** 是高压缩（细节损失多），**Q8** 是低压缩（细节接近原版）。

**例题：加载 GGUF 模型 (节省显存)**

1. **节点选择**：不使用普通的 `Load Checkpoint`，而是使用 `Unet Loader (GGUF)` 节点。
2. **加载组件**：
    - **Model**: 选择 `.gguf` 格式的模型（如 `z_image_turbo_q4_k_s.gguf`）。
    - **CLIP**: 使用 `CLIP Loader (GGUF)` 或普通 CLIP Loader（取决于 CLIP 格式）。
    - **VAE**: 使用 `Load VAE`。
3. **连接**：将三个组件分别连接到采样器或相关的 Conditioning 节点。此模块化方法虽然复杂，但能极大降低显存需求。

# 第十章 高级工作流与批处理

## 10.1 ZImage Turbo 与 LCM 架构

**差异点**

- **采样步数**：Turbo/LCM 类模型通常只需要 4-8 步（Steps）即可生成图像，而 SD1.5 通常需要 20-30 步。
- **CFG Scale**：Turbo 模型通常固定 CFG 为 $1.0$ 或 $1.5$，过高会产生伪影。
- **负面提示词**：部分 Turbo 模型不使用 Negative Prompt。此时需使用 `Conditioning (Zero Out)` 节点来填补 KSampler 的 negative 插槽，防止报错。

**例题：构建 ZImage Turbo 工作流**

1. **加载模型**：使用 `Load Checkpoint` 加载 `z_image_turbo.safetensors`。
2. **设置采样器**：
    - Steps: `5`
    - CFG: `1.0`
    - Sampler: `dpmpp_sde` (或模型推荐的采样器)
    - Scheduler: `beta` 或 `karras`。
3. **处理 Conditioning**：
    - Positive: 连接 Prompt。
    - Negative: 添加 `Conditioning (Zero Out)` 节点连接到 KSampler 的 negative。

## 10.2 批处理 (Batching) 与 自动化

**两种批处理模式**

1. **Batch Size (并行)**：
    - 在 `Empty Latent Image` 节点中设置 `batch_size > 1`。
    - **特点**：并行生成，速度快，但显存消耗成倍增加（显存不足会报错）。
2. **Batch Count (串行)**：
    - 在悬浮菜单的 `Queue Prompt` 旁的 `Extra Options` 中设置 `Batch Count`。
    - **特点**：按顺序一张张生成，不增加显存压力，适合显存较小的显卡。

**自动化技巧：Prompt Styler 与文本拼接**

- **Prompt Styler**：使用外部 YAML 文件加载预设风格（如 "Cyberpunk", "Watercolor"），通过 `Concatenate` 节点将用户的主体描述与风格模板拼接。 $$ \text{Final Prompt} = \text{User Input} + \text{Style Template} $$
- **Line Loader / Prompt Loader**：从文本文件 (`.txt`) 中按行读取提示词，配合 `Batch Count` 实现自动连续生成不同内容的图像。

> **直观理解** **Prompt Styler** 就像填空题模板：“一张[用户输入]风格的照片，具有电影感光照”。你只需要填“猫”，它自动补全剩下的高质量描述词。