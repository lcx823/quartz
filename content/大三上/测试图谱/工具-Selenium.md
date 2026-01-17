---
share: true
tags:
  - 工具
  - 功能测试
  - SoftwareTesting2ndEd
---

# 工具-Selenium

Selenium是一个强大的、开源的Web应用程序自动化测试框架。它能够模拟真实用户在浏览器中的操作，如点击、输入、选择等，从而实现对Web应用的功能进行自动化测试。

> Selenium（http://seleniumhq.org/）适合Web应用的、关键字驱动的功能测试工具。
> —— 第6章 6.5.2 开源工具

## 核心组件

Selenium框架主要由四个组件构成：
1.  **Selenium IDE**: 一个Firefox浏览器的插件，提供简单的录制和回放功能，用于快速创建测试脚本原型。
2.  **Selenium Core**: Selenium IDE录制脚本的核心引擎，是一组JavaScript函数集合。
3.  **Selenium Remote Control (RC)** (已与WebDriver合并): 一个测试服务器，它接收来自测试脚本的命令，并在真实的浏览器中执行这些命令。
4.  **Selenium WebDriver**: RC的后继者，通过直接调用浏览器原生的API来驱动浏览器，执行速度更快，稳定性更高。现在是Selenium项目的核心。
5.  **Selenium Grid**: 允许将测试脚本在多台机器、多种浏览器上并行执行，极大地提高了测试效率。

## 主要特性

- **跨平台与跨浏览器**: 支持Windows, Linux, Mac等多种操作系统，并支持Chrome, Firefox, IE, Safari等主流浏览器。
- **多语言支持**: 允许使用多种编程语言（如Java, C#, Python, Ruby, JavaScript）来编写测试脚本。
- **关键字驱动**: Selenium IDE生成的脚本采用类似关键字驱动的表格形式（HTML格式），清晰易懂。命令（Command）、目标（Target）和值（Value）构成了脚本的基本单元。
- **灵活的对象定位**: 提供多种方式来定位页面元素，如ID、Name、XPath、CSS Selector、Link Text等。
- **强大的集成能力**: 可以与[[./工具-JUnit|工具-JUnit]]、TestNG等测试框架以及Maven、Jenkins等CI/CD工具无缝集成，构建强大的自动化测试体系。

## 在书中的应用示例

书中通过一个在必应（Bing）上进行搜索的实例，展示了如何使用Selenium IDE进行录制、添加验证点（`verifyTextPresent`）和回放，直观地演示了自动化测试的基本流程。

> 然后，启动脚本录制操作...在 Firefox 打开必应搜索中文站点首页...单击右键，选择相应的验证方式（命令）assertText、verifyText...这里选择 verifyText...即增加一个验证点...
> —— 第4章 4.1.2 自动化测试的例子

## 关联概念
- [[./概念-测试自动化|概念-测试自动化]]
- [[./方法-黑盒测试|方法-黑盒测试]]
- [[测试类型-回归测试|测试类型-回归测试]]
- [[./过程-持续集成测试|过程-持续集成测试]]
- [[./工具-JUnit|工具-JUnit]]
