---
share: true
tags:
  - 专项测试
  - 移动App
  - 功能测试
  - SoftwareTesting2ndEd
---

# 专项测试-移动App功能测试

移动App的功能测试旨在验证应用是否实现了预期的功能。与传统应用类似，其手工测试方法（如基于场景的测试）没有本质区别。然而，其**自动化测试**在技术和工具上具有显著的特点，是本章讨论的重点。

## 自动化测试金字塔
书中引入了Mike Cohn的自动化测试金字塔模型，强调了自动化测试的分层策略，以获得最佳的投入产出比（ROI）。
1.  **单元测试 (Unit Tests)**: 投入最多，位于金字塔底层，覆盖率高，执行速度快。
2.  **API/服务测试 (Service Tests)**: 投入次之，位于中间层，针对应用的后端接口进行测试，比UI测试更稳定、高效。
3.  **UI测试 (UI Tests)**: 投入最少，位于塔尖，最脆弱，维护成本最高。

> 相对上层的API测试...自动化测试最适合进行单元测试...然后，自动化测试考虑尽量在接口进行测试，最后才是UI的自动化测试。
> —— 第8章 8.2.1 面向接口的自动化测试

## 面向接口的自动化测试
由于移动App的业务逻辑大多在后端服务器，因此针对API进行测试是高效且重要的。
- **测试对象**: 基于HTTP(S)的接口 (GET/POST)、Web Service (SOAP, REST)等。
- **测试工具**: [[./工具-JMeter|工具-JMeter]] 是一个强大的工具，支持多种协议，可以方便地构造请求、设置断言，完成接口的功能验证。

## UI自动化测试

### Android App
- **UI元素识别工具**:
    - **HierarchyViewer**: 观察UI的层次结构。
    - **UIAutomatorViewer**: 更强大的工具，可以扫描并分析UI组件的详细属性（ID, class, text等）。
- **主流测试框架**:
    - **[[./工具-Robotium|工具-Robotium]]**: 类似Selenium的黑盒测试框架，API简单，支持Native和WebView。
    - **[[./工具-Espresso|工具-Espresso]]**: Google官方框架，适合白盒测试，能与UI线程同步，测试更稳定可靠。
    - **[[./工具-UIAutomator|工具-UIAutomator]]**: Google官方框架，功能强大，可以跨应用进行测试。
    - **MonkeyRunner**: 基于Python脚本，通过坐标或控件ID操作UI，支持图像比较。

### iOS App
- **UI元素识别工具**:
    - **Accessibility Inspector**: 识别UI元素的属性。
- **主流测试框架**:
    - **UI Automation**: Xcode Instruments内置的工具，使用JavaScript编写脚本，但录制回放的稳定性较差。
    - **Frank/Cucumber**: 基于BDD（行为驱动开发）的黑盒测试框架。
    - **KIF (Keep It Functional)**: Square公司出品，面向UI的自动化测试框架，基于XCTest实现。
    - **Kiwi**: 基于BDD的测试框架，语法类似RSpec。

### 跨平台测试
- **Appium**: 使用WebDriver API封装了Android的UIAutomator和iOS的UI Automation，允许用同一套API测试不同平台的应用。
- **Calabash**: 基于Cucumber的跨平台测试框架。

## 关联概念
- [[./概念-测试自动化|概念-测试自动化]]
- [[测试类型-功能测试|测试类型-功能测试]]
- [[./工具-JMeter|工具-JMeter]], [[./工具-Robotium|工具-Robotium]], [[./工具-Espresso|工具-Espresso]], [[./工具-UIAutomator|工具-UIAutomator]]
