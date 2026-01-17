---
share: true
tags:
  - 工具
  - Android
  - 移动App
  - SoftwareTesting2ndEd
---

# 工具-Robotium

Robotium是一款针对Android平台的、开源的自动化集成测试框架，常被誉为“Android平台的Selenium”。它封装了Android官方的Instrumentation测试框架，提供了更简洁、强大的API，用于编写功能和系统测试用例。

> Robotium（https://github.com/RobotiumTech/robotium）是Android平台上类似Selenium的集成测试工具，能够对各种控件（Activity、Dialog、Toast、Menu等）进行操作，模拟各种手势操作、查找和断言机制的API。
> —— 第8章 8.2.2 Android App UI 自动化测试

## 核心特性
- **简化API**: 通过`Solo`类，极大地简化了与UI控件的交互，如`solo.clickOnText("...")`, `solo.enterText(...)`等，使测试脚本更具可读性。
- **跨Activity支持**: 能够自动处理多个Activity之间的切换，无需手动管理。
- **混合应用支持**: 支持对原生应用（Native App）和Web视图（WebView）进行测试。
- **强大的交互模拟**: 可以模拟各种手势操作，如点击、长按、滑动等。
- **集成友好**: 可以与Maven, Gradle, Ant等主流构建工具集成，方便地融入[[./过程-持续集成测试|过程-持续集成测试]]流程。
- **录制回放**: 官方提供了商业版的录制回放工具，可以进一步降低脚本编写门槛。

## 工作原理
Robotium在Android的Instrumentation框架之上增加了一个`Solo`测试用例层，测试人员通过调用`Solo`对象的方法来驱动应用，而无需直接处理复杂的Instrumentation API。

![Robotium基本层次结构](https://cdn-mineru.openxlab.org.cn/result/2025-12-31/209fc6e5-97e0-4ca7-a163-837765007e60/e4be5f278b409dcef6a1f2fcb0ed44671272a341f0a1e4b0a64a46a43a4710e8.jpg)
*(图8-14 Robotium基本层次结构)*

## 关联概念
- [[./专项测试-移动App功能测试|专项测试-移动App功能测试]]
- [[./工具-Espresso|工具-Espresso]]
- [[./工具-UIAutomator|工具-UIAutomator]]
- [[./概念-测试自动化|概念-测试自动化]]
