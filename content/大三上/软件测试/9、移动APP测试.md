---
share: true
---
# 第九章 移动APP测试

![[./assets/9、移动APP测试/c9.png|c9.png]]
## 9.1 App测试概述

### 9.1.1 App的特性
与传统PC端软件相比，移动App具有以下显著特性：
*   **设备多样性**：设备类型繁多（手机、平板、智能手表等），具有轻巧便携的特点。
*   **网络多样性**：连接方式多样（3G、4G、5G、Wi-Fi），网络稳定性不如有线网络。
*   **平台多样性**：依赖的操作系统平台多样（iOS, Android, Windows Phone, BlackBerry等），其中iOS和Android为主流。

### 9.1.2 App与PC端软件测试的区别
| 维度 | PC端软件 | 移动App |
| :--- | :--- | :--- |
| **页面布局** | 屏幕大，显示信息多，布局灵活 | 屏幕小，显示信息有限，需考虑布局合理性 |
| **输入方法** | 键盘、鼠标 | 触屏、电容笔、语音等多种方式 |
| **使用场合** | 地点固定，网络稳定 | 地点不固定，网络不稳定，需考虑信号差及**电量不足**的情况 |
| **操作方式** | 鼠标精确操作 | 触屏操作误差大，**不支持鼠标悬停事件** |

### 9.1.3 App测试流程
App测试流程与PC端大体相同，但需考虑App固有属性（如安装、卸载、升级）。通常包括以下7个环节：
1.  **接受测试版本**
2.  **App版本测试**
3.  **UI测试**
4.  **功能测试**
5.  **专项测试**
6.  **正式环境测试**
7.  **上线准备**

## 9.2 App测试要点

### 9.2.1 UI测试
*   **导航测试**：关注按钮/窗口导航、布局合理性、风格一致性、导航帮助准确性。
*   **图形测试**：
    *   图片质量与尺寸。
    *   字体与标签风格。
    *   颜色搭配。
    *   控件操作方式统一。
    *   **自适应界面设计**。
*   **内容测试**：关注文字准确性、错别字、用语简洁友好、敏感词汇、长度限制。

### 9.2.2 功能测试
依据需求说明书验证功能实现的正确性，包括注册、登录、运行、后台切换、删除进程、推送、锁屏、更新等。

### 9.2.3 专项测试
*   **弱网测试**：验证在网络信号切换或变弱（如电梯、地铁场景）时App的响应和功能正确性。
*   **耗电量测试**：验证App运行时的电量消耗，确保架构设计合理，避免异常耗电。
*   **安装/卸载/升级测试**。
*   **交互性测试**。

### 9.2.4 性能测试
*   **边界测试**：在电量不足、存储空间不足、网络不稳定等边界条件下测试。
*   **压力测试**：不断增加负载（如数据吞吐量），确定服务瓶颈和最大性能。
*   **耗能测试**：验证长期运行时的内存、CPU占用及耗电量。
*   **响应能力测试**：验证特定条件下的响应正确性及响应时间。

### 9.2.5 兼容性测试
*   **系统兼容**：覆盖Android（8.0/9.0/10.0等）和iOS（12.0/13.0/14.0等）不同版本。
*   **屏幕分辨率兼容**：适配不同分辨率（如1920x1080 vs 1280x720），防止显示不全或模糊。
*   **屏幕尺寸兼容**：适配不同物理尺寸。
*   **网络兼容**：覆盖Wi-Fi、2G/3G/4G/5G及不同运营商。
*   **品牌兼容**：覆盖主流品牌（华为、小米、三星、OPPO、vivo、荣耀等）。
> **多学一招**：可利用第三方云测试平台（如阿里EasyTest、华为云测）提高兼容性测试效率。

## 9.3 搭建App测试环境

### 9.3.1 环境准备
1.  **JDK**：App基于Java开发，需安装JDK。
2.  **Android SDK**：包含 **uiautomatorviewer** 工具，用于定位元素。
3.  **Android模拟器**：如雷电模拟器，用于运行App。

### 9.3.2 配置环境变量
*   配置 `ANDROID_HOME`。
*   配置 `Path`。
*   **常用ADB命令**：
    *   `adb start-server`：启动ADB服务。
    *   `adb devices`：查看设备。
    *   `adb connect <IP>`：连接设备。
    *   `adb install <apk路径>`：安装App。
    *   `adb uninstall <包名>`：卸载App。
    *   `adb shell dumpsys window windows | findstr mFocusedApp`：获取当前App包名和界面名。

### 9.3.3 uiautomatorviewer工具
位于Android SDK的 `tools\bin` 目录下，用于扫描和分析App界面控件信息（布局、组件、属性）。

### 9.3.4 Appium安装
*   **Appium**：开源、跨平台自动化测试工具，支持WebDriver协议。
*   **安装步骤**：
    1.  下载并安装Appium Desktop。
    2.  安装 `Appium-Python-Client` 库：`pip install Appium-Python-Client`。

## 9.4 自动化测试框架

### 9.4.1 unittest框架
Python标准库自带。
*   **核心要素**：`TestCase`（测试用例）、`TestSuite`（测试套件）、`TextTestRunner`（执行器）、`TextTestResult`（结果）、`Fixture`（测试固件，如setUp/tearDown）。
*   **断言**：`assertEqual`, `assertTrue`, `assertIn` 等。

### 9.4.2 pytest框架
第三方框架，简洁高效。
*   **安装**：`pip install pytest`。
*   **规范**：测试类以 `Test` 开头，测试方法以 `test` 开头。
*   **断言**：直接使用Python的 `assert` 关键字。

## 9.5 实例：使用Appium测试“学车不”App

### 9.5.1 测试环境与工具
*   **语言**：Python。
*   **编辑器**：PyCharm。
*   **工具**：Appium, JDK, Android SDK, 雷电模拟器。

### 9.5.2 元素定位
*   **uiautomatorviewer**：手动定位元素属性（id, class, xpath等）。
*   **Katalon Recorder**：浏览器插件，辅助录制脚本（主要用于Web，App测试中可辅助思路）。

### 9.5.3 功能测试脚本编写
*   **前置代码**：连接模拟器，设置Desired Capabilities（平台、版本、设备名、包名、Activity名）。
    ```python
    desired_caps = {}
    desired_caps['platformName'] = 'Android'
    desired_caps['platformVersion'] = '7.1.2'
    desired_caps['deviceName'] = '127.0.0.1:5554'
    desired_caps['appPackage'] = 'com.bjcsxq.chat.carfriend'
    desired_caps['appActivity'] = '.module.main.MainActivity'
    driver = webdriver.Remote('http://localhost:4723/wd/hub', desired_caps)
    ```
*   **测试场景**：
    1.  **搜索功能**：定位搜索框 -> 输入内容 -> 点击搜索 -> 验证结果。
    2.  **界面切换**：点击底部导航栏 -> 验证界面跳转。
*   **注意**：
    *   脚本执行前需开启Appium Server。
    *   首次运行可能需要手动授权App权限或处理更新提示。