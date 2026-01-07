---
share: true
tags:
  - 工具
  - Android
  - 移动App
  - SoftwareTesting2ndEd
---

# 工具-Espresso

Espresso是Google官方推出的一款面向Android UI的自动化测试框架。它专注于在单个应用内部的功能UI测试，其设计理念是提供一个简洁、可靠且可扩展的API，让UI测试的编写和执行变得简单快捷。

> Espresso...是Google开源的一套面向Android移动应用UI的自动化测试框架...能够实现UI线程同步，这是因为Espresso会等待当前进程的消息队列中的UI事件，并且等待其中的AsyncTask结束才会执行下一个测试...
> —— 第8章 8.2.2 Android App UI 自动化测试

## 核心特性

1.  **自动同步**: 这是Espresso最核心的优势。它能自动同步UI线程，在执行操作前会等待UI事件处理完毕或异步任务（AsyncTask）完成，从而极大地提高了测试的稳定性和可靠性，避免了因时序问题导致的测试失败。
2.  **简洁的API**: Espresso的API遵循“Find-Act-Assert”模式，非常清晰：
    - **`onView(...)`**: 使用`ViewMatchers`来查找UI元素。
    - **`.perform(...)`**: 使用`ViewActions`对找到的元素执行操作（如点击、输入文本）。
    - **`.check(...)`**: 使用`ViewAssertions`来验证元素的状态是否符合预期。
3.  **可读性强**: 测试代码`onView(withId(R.id.my_button)).perform(click());`非常接近自然语言，易于理解和维护。
4.  **白盒风格**: Espresso鼓励开发者利用应用的内部知识（如资源ID `R.id.*`）来编写测试，这使得定位元素更加精确和稳定。
5.  **官方支持**: 作为Android Testing Support Library的一部分，它与Android Studio和Gradle构建系统深度集成。

## 适用场景
Espresso非常适合进行应用内的功能UI测试，特别是对于遵循TDD或BDD开发模式的团队。它不适合跨应用测试，跨应用场景应使用[[./工具-UIAutomator|工具-UIAutomator]]。

## 关联概念
- [[./专项测试-移动App功能测试|专项测试-移动App功能测试]]
- [[./工具-Robotium|工具-Robotium]]
- [[./工具-UIAutomator|工具-UIAutomator]]
- [[./概念-测试自动化|概念-测试自动化]]
