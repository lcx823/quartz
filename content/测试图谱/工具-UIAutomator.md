---
share: true
tags:
  - 工具
  - Android
  - 移动App
  - SoftwareTesting2ndEd
---

# 工具-UIAutomator

UI Automator是Google官方提供的一个强大的UI自动化测试框架，它主要用于**跨应用**的功能UI测试。与[[./工具-Espresso|工具-Espresso]]专注于单个应用内部测试不同，UI Automator可以在已安装的应用之间进行交互，甚至可以与系统设置、通知栏等进行交互。

> UI Automator: 跨多个 App、跨系统和 App 的功能 UI 测试自动化框架。
> —— 第8章 8.2.2 Espresso与UI Automator

## 核心组件

1.  **UI Automator API**: 一个Java库，包含了用于查找和操作UI组件的类，如`UiDevice`, `UiSelector`, `UiObject`等。测试脚本通过调用这些API来模拟用户操作。
2.  **UI Automator Viewer**: 一个图形化工具（`uiautomatorviewer`），用于扫描和分析Android设备当前屏幕上的UI组件，并以层级结构展示。测试人员可以通过这个工具方便地获取UI元素的属性（如resource-id, text, class），用于编写测试脚本。

![UIAutomatorViewer识别微信登录界面](https://cdn-mineru.openxlab.org.cn/result/2025-12-31/209fc6e5-97e0-4ca7-a163-837765007e60/6186c6d6156071b5225a40c64ef4c3d47711e8e5a747cb0a7a17cf2e363dbeb0.jpg)
*(图8-12 微信登录功能的UI layout view识别)*

## 主要特性

- **跨应用测试**: 能够启动一个应用，执行操作，然后跳转到另一个应用（如系统设置、联系人）继续执行操作。这是它与Espresso最本质的区别。
- **黑盒测试方法**: UI Automator通过分析屏幕上显示的UI元素来进行测试，不需要访问应用的内部代码。
- **系统级交互**: 可以模拟物理按键（如Home, Back, Menu）、打开通知栏、截屏等系统级操作。
- **强大的元素定位**: 提供了`UiSelector`来根据文本、内容描述、资源ID、类名等多种属性来查找UI元素。

## 适用场景
- 测试需要与多个应用或系统组件交互的复杂场景（例如，测试一个应用能否正确调用系统相机拍照并分享到另一个社交应用）。
- 对第三方应用进行黑盒自动化测试。

## 关联概念
- [[./专项测试-移动App功能测试|专项测试-移动App功能测试]]
- [[./工具-Espresso|工具-Espresso]] (用于应用内测试)
- [[./工具-Robotium|工具-Robotium]]
- [[./概念-测试自动化|概念-测试自动化]]
