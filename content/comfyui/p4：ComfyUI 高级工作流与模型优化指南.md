---
share: true
---

# 第十六章 新一代模型架构：ZImage Turbo 与语义理解

## 16.1 ZImage Turbo 与 SD 1.5 (Juggernaut) 的架构差异

**定义** ZImage Turbo 代表了更现代的扩散模型架构，与传统的 Stable Diffusion 1.5 (如 Juggernaut) 存在显著差异。

- **Juggernaut (SD1.5)**: 依赖关键词堆砌 (Keyword-based)，对短提示词敏感，容易产生伪影，通常需要负面提示词 (Negative Prompt) 来规避错误。
- **ZImage Turbo**: 结合了类似大语言模型 (LLM) 的语义理解能力，能更好地理解自然语言指令。它通常使用更少的步数 (Steps) 生成高质量图像,。

> **直观理解** **Juggernaut** 就像一个老派的搜索引擎，你需要输入 "best quality, 4k, masterpiece" 这种关键词它才懂。 **ZImage Turbo** 就像一个聪明的人类助手，你可以直接对它说 "一只猫戴着帽子吃披萨"，它能理解句子的逻辑，而不需要你念咒语。

**关键参数公式** ZImage Turbo 的推荐设置与 SD1.5 不同： $$ \text{Steps} \approx 4 \sim 6 \quad (\text{SD1.5 needs } 20 \sim 30) $$ $$ \text{CFG Scale} = 1.0 \quad (\text{Ignores Negative Prompt}) $$ 当 $CFG=1.0$ 时，负面提示词的影响力归零。

**操作步骤：构建 ZImage 工作流**

1. **加载模型**: 使用 `Load Checkpoint` 加载 ZImage Turbo 模型（通常是 FP8 版本以节省显存）。
2. **调整 Latent**: 使用 `Empty SD3 Latent Image` (或普通 Empty Latent)，分辨率建议 $1024 \times 1024$。
3. **采样调整**:
    - Sampler: `dpmpp_sde`
    - Scheduler: `beta` 或 `sgm_uniform`
4. **特殊节点**: 添加 `Model Sampling AuraFlow` 节点，连接在模型与 KSampler 之间。这是为了适配该模型的特定采样逻辑，参数 `shift` 通常设为 3。
5. **处理负面提示**: 由于 CFG=1.0，不需要负面提示词，但为了防止 KSampler 报错，使用 `Conditioning (Zero Out)` 节点连接到 KSampler 的 `negative` 输入。

## 16.2 语义提示词 (Semantic Prompting)

**定理** 对于 ZImage Turbo，使用自然语言的长句描述比标签式单词效果更好。 $$ \text{Quality} \propto \text{Sentence Structure} + \text{Detail Description} $$

**例题：Prompt 对比**

1. **SD1.5 风格**: "cat, hat, rose, 4k" $\rightarrow$ ZImage 可能无法很好地组合这些元素。
2. **ZImage 风格**: "A fluffy white cat holding a red rose in its mouth, wearing a ninja t-shirt"。
    - **结果**: 模型能准确理解“嘴里叼着”和“穿着”的逻辑关系，生成连贯的图像。

# 第十七章 模块化工作流：拆分模型 (Split Workflow)

## 17.1 AIO (All-In-One) vs. Split 架构

**概念**

- **AIO (Checkpoint)**: 将 UNET、CLIP、VAE 打包在一个 `.safetensors` 文件中。优点是方便，缺点是灵活性差，每次更新需下载全量文件。
- **Split (Modular)**: 将组件拆分为独立文件加载。 $$ \text{Generation} = \text{Diffusion Model (UNET)} + \text{Text Encoder (CLIP)} + \text{VAE} $$

> **直观理解** **AIO** 就像一体机电脑，买来就能用，但很难升级显卡。 **Split** 就像组装台式机。你可以只换显卡 (UNET) 而保留显示器 (VAE) 和键盘 (CLIP)。这样可以节省硬盘空间，因为不同的模型可以共用同一个 VAE 文件（如 Flux 和 ZImage 可能共用同一个 VAE）。

**操作步骤：构建拆分工作流 (Workflow 5B)**

1. **加载扩散模型**: 使用 `Load Diffusion Model` 节点，加载 `z_image_turbo_fp8.safetensors`,。
2. **加载文本编码器**: 使用 `Load CLIP` 节点。
    - 注意类型选择：ZImage 使用 `lumina2` 类型的 CLIP。
3. **加载 VAE**: 使用 `Load VAE` 节点。
4. **连接**:
    - Model $\rightarrow$ `Model Sampling AuraFlow` $\rightarrow$ KSampler.
    - CLIP $\rightarrow$ `CLIP Text Encode` $\rightarrow$ KSampler.
    - VAE $\rightarrow$ `VAE Decode`.

# 第十八章 模型量化与 GGUF 格式

## 18.1 量化 (Quantization) 原理

**定理** 量化是通过降低数字精度来压缩模型体积的技术。GGUF (GPT-Generated Unified Format) 是一种高效的量化格式，允许在低显存设备上运行大模型。 $$ \text{Size}_{FP16} \approx 2 \times \text{Size}_{FP8} \approx 4 \times \text{Size}_{Q4} $$ 常见量化等级：

- **Q8_0**: 接近原始精度，质量最高，体积较大。
- **Q4_K_S**: 平衡点，体积小，细节略有损失（如螺丝钉纹理丢失），但速度快,。

|格式|显存需求|速度 (取决于硬件)|细节保留|
|:--|:--|:--|:--|
|**FP16**|高|快 (GPU)|100%|
|**Q8**|中|中|~98%|
|**Q4**|低|慢 (可能受 CPU 限制)|~85%|

**操作步骤：加载 GGUF 模型**

1. **节点**: 必须使用 `UNET Loader (GGUF)` 节点，不能使用普通的 Checkpoint Loader。
2. **加载 CLIP**: 如果 CLIP 也是 GGUF 格式，需使用 `CLIP Loader (GGUF)`；如果是普通格式，使用标准 `Load CLIP`。
3. **连接逻辑**: 与 Split 工作流相同，只是加载器节点不同。

**例题：Q4 vs Q8 对比测试**

1. **设置**: 保持 Seed 固定，Prompt 固定。
2. **加载 Q4**: 加载 `z_image_turbo_q4_k_s.gguf`。生成图像 -> 观察细节（可能有些模糊）。
3. **加载 Q8**: 加载 `z_image_turbo_q8_0.gguf`。生成图像 -> 观察细节（纹理更清晰）。
4. **结论**: 如果显存允许，优先使用 Q8 或 FP8；只有在显存极度受限时使用 Q4。

# 第十九章 批量自动化：Prompt Styler 与 Batching

## 19.1 Batch Size vs. Batch Count

**区别**

- **Batch Size (并行)**: 在 `Empty Latent` 中设置。一次性生成 $N$ 张图。
    - 优点：总时间短。
    - 缺点：显存占用 $= N \times \text{Single Image VRAM}$。容易 OOM (Out Of Memory)。
- **Batch Count (串行)**: 在运行菜单 (Extra Options) 中设置。连续运行 $N$ 次工作流。
    - 优点：显存占用低（等于单张）。
    - 缺点：总时间 $= N \times \text{Single Run Time}$。

## 19.2 自动化提示词系统 (Prompt Automation)

**工具：Line Loader & Prompt Styler** 利用 `ComfyUI-Tools` 等插件实现提示词的自动轮播。

**操作步骤：从文件加载提示词**

1. **准备文件**: 创建 `prompts.txt`，每行写一个 Prompt。
2. **节点**: 添加 `Prompt Loader` 或 `Line Loader` 节点。
3. **设置**: 将 `control_after_generate` 设为 `increment` (递增)。
4. **连接**: 输出连接到 `CLIP Text Encode` 的文本输入。
5. **运行**: 设置 Batch Count 为 5，ComfyUI 将自动依次读取第 1 至 5 行的提示词生成图像。

**例题：使用 Prompt Styler 混合风格**

1. **节点**: 添加 `Prompt Styler` (或 `Prompt Styler Extra` 支持多风格),。
2. **输入**: 在文本框输入主体 "A white bunny"。
3. **选择风格**: 选择 "Cyberpunk" 和 "Watercolor"。
4. **原理**: 节点会自动将 Prompt 重写为模板格式： $$ \text{Final} = \text{Style}_{\text{prefix}} + \text{User Input} + \text{Style}_{\text{suffix}} $$
5. **输出**: 生成一只赛博朋克风格的水彩兔子。

# 第二十章 高级 ControlNet：Union 模型

## 20.1 Union ControlNet 机制

**定义** 传统的 ControlNet 需要为每种功能（Canny, Depth, Pose）下载单独的模型。**Union ControlNet** 将多种控制能力训练在同一个模型文件中，通过不同的预处理器即可激活对应功能。

> **直观理解** 以前你需要买三把不同的钥匙（Canny模型, Depth模型, Pose模型）来开三扇门。现在你有一把万能钥匙（Union模型），只要你拿对了地图（Preprocessor），这把钥匙就能开任意一扇门。

**操作步骤：ZImage 的 ControlNet 工作流 (Workflow 7)**

1. **加载模型**: 使用 `Model Patch Loader` 加载 Union ControlNet 模型文件。
2. **应用控制**: 使用 `DiffSynth ControlNet` (或类似支持 SD3/ZImage 的节点)。注意：ZImage 架构不同，不能使用标准的 `Apply ControlNet` 节点。
3. **连接**:
    - Model $\rightarrow$ `DiffSynth ControlNet` $\rightarrow$ KSampler.
    - Model Patch (Union) $\rightarrow$ `DiffSynth ControlNet`.
4. **预处理**:
    - 加载图像 $\rightarrow$ `AIO Aux Preprocessor`。
    - 选择预处理器：如 `Depth Anything` 或 `DW Pose`。
    - 输出连接到 `DiffSynth ControlNet` 的 image 输入。

**例题：人物姿态复刻**

1. **输入**: 加载一张做瑜伽的女性照片。
2. **预处理**: 选择 `DW Pose` 预处理器，生成骨骼图。
3. **Prompt**: "European woman doing yoga on a mountain"。
4. **执行**: 模型会严格遵循骨骼图的姿势，但根据 Prompt 改变人物的外貌和背景。如果原图是亚洲人，Prompt 指定欧洲人，生成结果会是欧洲人但姿势完全一致。
5. **修正**: 如果生成了多余物体（如地上的相机），在负面提示词中添加 "camera" 或在 Prompt 中明确描述环境。