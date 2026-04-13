---
share: true
title: 第1章 Spring Boot入门（应试使用）
created: 2026-03-22
source: Cherry Studio
tags:
---

![[./assets/第1章 Spring Boot入门（应试使用）/第1章 绪论.png|第1章 绪论]]
# 第1章 Spring Boot入门（应试使用）

## 1.1 Spring Boot 概述

### 认识Spring Boot
**定理1**: Spring Boot是基于Spring框架开发的全新框架，其设计目的是为了简化新Spring应用的初始化搭建和开发过程。它通过整合大量常用框架和第三方库的配置，实现了“开箱即用”的效果，让开发者能更专注于业务逻辑。

> 从初学者的角度来看，Spring框架虽然强大，但配置起来非常繁琐，就像是组装一台电脑需要自己挑选CPU、主板、内存等所有零件并确保它们互相兼容。而Spring Boot就像是直接购买一台品牌组装好的整机，所有硬件都已预先配置和测试好，你只需要开机安装自己需要的软件（业务代码）就可以开始工作了，极大地简化了初始设置的难度和时间。

**例题1**: Spring Boot的优点有哪些？
**解**:
Spring Boot的主要优点包括：
1. **可快速构建独立的Spring应用**：可以打包成可执行的jar文件，通过`java -jar`命令直接运行。
2. **直接嵌入Tomcat、Jetty和Undertow服务器**：无需将项目打包成WAR文件再部署到外部服务器。
3. **提供依赖启动器（Starters）**：通过在`pom.xml`中引入如`spring-boot-starter-web`等启动器，即可自动管理一组相关的依赖，无需手动添加和管理版本。
4. **极大程度的自动化配置**：根据项目中引入的依赖，自动配置Spring和第三方库，免去了大量的XML配置或Java Config。
5. **提供生产就绪功能**：内置了如度量（metrics）、健康检查（health checks）和外部化配置等功能。
6. **极少的代码生成和XML配置**：遵循“约定大于配置”的原则，大大减少了样板代码。

## 1.2 Spring Boot 入门程序

### 环境准备与配置
**定理1**: 构建和运行Spring Boot项目前，需要确保开发环境已正确安装和配置。基本环境包括JDK（Java Development Kit）、Maven（项目管理和构建工具）以及IntelliJ IDEA（集成开发环境）。

> 在开始任何编程项目之前，都需要先搭建好工作环境。这就像一个木匠在开始做家具前，需要准备好锤子（JDK）、钉子和木材（Maven管理的依赖）以及一个工作台（IntelliJ IDEA）。确保这些工具都已就位并且配置正确，是顺利开工的前提。

**例题1**: 在IntelliJ IDEA中如何配置Maven和JDK？
**解**:
**1. 配置Maven**
- 打开IDEA设置：`File` -> `Settings` (或者 `Configure` -> `Project Defaults` -> `Settings` for welcome screen).
- 导航到 `Build, Execution, Deployment` -> `Build Tools` -> `Maven`.
- **Maven home path**: 设置为你本地Maven的安装目录。
- **User settings file**: 指向你的Maven `settings.xml`文件。
- **Local repository**: 设置为你的Maven本地仓库路径。

**2. 配置JDK**
- 打开项目结构设置：`File` -> `Project Structure` (或者 `Configure` -> `Project Defaults` -> `Project Structure` for welcome screen).
- 在 `Project Settings` -> `Project` 下：
- **SDK**: 点击下拉菜单，选择或添加你的JDK 1.8（或更高版本）的安装路径。
- **Project language level**: 选择与JDK版本对应的语言级别，如 `8 - Lambdas, type annotations etc.`。

### 使用Maven方式构建Spring Boot项目
**定理2**: 通过标准的Maven项目结构，手动添加Spring Boot父项目依赖和场景启动器依赖，可以从零开始构建一个Spring Boot应用。

> 这种方式就像是DIY一个基础款的乐高模型。你从一个空的底板（空的Maven项目）开始，然后按照说明书（官方文档），一步步添加核心的结构块（parent依赖）和功能模块（starter依赖），最终组装出你想要的应用。这能让你更清楚地理解项目的底层结构。

**例题2**: 请阐述使用Maven方式构建一个简单的Spring Boot Web应用的步骤。
**解**:
**步骤1：创建Maven项目**
- 在IntelliJ IDEA中，选择 `File` -> `New` -> `Project`。
- 选择 `Maven`，并勾选 `Create from archetype`，然后选择 `maven-archetype-quickstart` 或不勾选直接创建一个空项目。
- 填写 `GroupId` (如 `com.example`) 和 `ArtifactId` (如 `demo-manual`)。

**步骤2：在pom.xml中添加Spring Boot相关依赖**
```xml
<!-- 1. 继承Spring Boot的父项目，它统一管理了所有依赖的版本 -->
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>2.1.3.RELEASE</version>
</parent>

<dependencies>
    <!-- 2. 引入Web开发场景的启动器 -->
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-web</artifactId>
    </dependency>
</dependencies>
```

**步骤3：编写主程序启动类**
创建一个Java类，并使用`@SpringBootApplication`注解标记它。
```java
package com.example.demomanual;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

// @SpringBootApplication 标记这是一个Spring Boot主程序类
@SpringBootApplication
public class DemoManualApplication {

    public static void main(String[] args) {
        // SpringApplication.run() 启动整个Spring Boot应用
        SpringApplication.run(DemoManualApplication.class, args);
    }
}
```

**步骤4：创建一个用于Web访问的Controller**
```java
package com.example.demomanual;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

// @RestController 是 @Controller 和 @ResponseBody 的组合注解
// 它表示这个类中的所有方法返回的都是JSON/字符串数据，而不是视图名
@RestController
public class HelloController {

    // @GetMapping("/hello") 将HTTP GET请求的/hello路径映射到这个方法
    @GetMapping("/hello")
    public String hello() {
        return "hello Spring Boot";
    }
}
```

**步骤5：运行项目**
- 找到主程序类 `DemoManualApplication`。
- 右键点击 `main` 方法，选择 `Run 'DemoManualApplication.main()'`.
- 启动成功后，在浏览器中访问 `http://localhost:8080/hello`，页面将显示 "hello Spring Boot"。

### 使用Spring Initializr方式构建Spring Boot项目
**定理3**: Spring Initializr是一个Web应用或IDE插件，它提供了一个可视化的界面来生成Spring Boot项目结构，可以快速选择构建工具、语言、Spring Boot版本和所需的依赖。

> 这是最推荐的入门方式。它就像是在快餐店点一个套餐。你只需要告诉服务员（Spring Initializr界面）你想要什么主食（Web依赖）、什么饮料（数据库依赖），它就会自动为你配好一整套，省去了你自己搭配的麻烦。

**例题3**: 请阐述使用Spring Initializr方式构建一个简单的Spring Boot Web应用的步骤。
**解**:
**步骤1：创建Spring Boot项目**
- 在IntelliJ IDEA中，选择 `File` -> `New` -> `Project`。
- 选择 `Spring Initializr`。
- **Project Metadata**: 填写项目的 `Group`, `Artifact`, `Name`, `Description` 等信息。选择构建工具为 `Maven`，语言为 `Java`。
- **Dependencies**: 在 `Web` 分类下，勾选 `Spring Web`。
- 点击 `Finish`，IDEA会自动生成一个配置好依赖的完整项目。

**步骤2：创建一个用于Web访问的Controller**
项目生成后，`src/main/java`目录下已经有了主启动类。我们只需在相同包下创建一个`HelloController`类，代码与上一个例题完全相同。
```java
package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class HelloController {

    @GetMapping("/hello")
    public String hello() {
        return "hello Spring Boot";
    }
}
```

**步骤3：运行项目**
- 找到自动生成的 `DemoApplication` 主启动类。
- 右键点击 `main` 方法，选择 `Run`。
- 启动成功后，在浏览器中访问 `http://localhost:8080/hello`，页面将显示 "hello Spring Boot"。

## 1.3 单元测试与热部署

### 单元测试
**定理1**: Spring Boot通过`spring-boot-starter-test`启动器集成了常用的测试框架（如JUnit, Mockito），并提供了`@SpringBootTest`等注解，可以方便地加载Spring容器上下文，进行集成化的单元测试。

> 单元测试就像是给你的代码模块做一个“体检”。你不需要运行整个庞大的系统，就能单独检查某个函数或某个类是否按预期工作。Spring Boot让这个“体检”过程变得很简单，它会自动准备好测试所需的“医疗设备”（Spring环境），让你能直接对“病人”（你的代码）进行测试。

**例题1**: 如何为一个Controller编写并运行一个单元测试？
**解**:
**步骤1：在pom.xml中添加测试启动器依赖**
（使用Spring Initializr创建的项目通常已默认包含此依赖）
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-test</artifactId>
    <scope>test</scope> <!-- scope为test表示此依赖只在测试时生效 -->
</dependency>
```

**步骤2：编写单元测试类和方法**
在 `src/test/java` 目录下的测试类中编写测试代码。
```java
package com.example.demo;

import org.junit.Test;
import org.junit.runner.RunWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.junit4.SpringRunner;

// @RunWith(SpringRunner.class) 表示使用Spring的测试运行器
@RunWith(SpringRunner.class)
// @SpringBootTest 会加载完整的Spring Boot应用上下文用于测试
@SpringBootTest
public class DemoApplicationTests {

    // @Autowired 自动注入在Spring容器中已存在的Bean
    @Autowired
    private HelloController helloController;

    @Test
    public void helloControllerTest() {
        // 调用Controller的方法
        String result = helloController.hello();
        // 打印结果，或使用断言(Assertions)来验证结果是否正确
        System.out.println(result);
        // Assert.assertEquals("hello Spring Boot", result); // 更规范的测试方式
    }
}
```

**步骤3：运行测试**
- 在 `helloControllerTest` 方法名上右键，选择 `Run 'helloControllerTest()'`。
- 查看控制台输出，如果方法执行成功，测试会显示为绿色通过，并且控制台会打印 "hello Spring Boot"。

### 热部署
**定理2**: 热部署允许开发者在修改代码后，无需手动重启应用，开发工具能自动检测到变更并重新加载应用，从而提高开发效率。Spring Boot通过`spring-boot-devtools`模块提供了此功能。

> 热部署就像是在给一辆行驶中的汽车换轮胎。你不需要把车停下来，熄火，换好轮胎再点火启动。DevTools会自动帮你完成这个重启过程，你只需要改好代码，保存一下，然后刷新浏览器就能看到效果，这在频繁修改和调试界面或逻辑时特别省时间。

**例题2**: 如何为Spring Boot项目配置热部署？
**解**:
**步骤1：在pom.xml中添加devtools依赖**
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-devtools</artifactId>
</dependency>
```

**步骤2：配置IntelliJ IDEA**
1. **开启自动编译**:
 - `File` -> `Settings` -> `Build, Execution, Deployment` -> `Compiler`.
 - 勾选 `Build project automatically`。
2. **开启运行时自动编译**:
 - 按 `Ctrl+Shift+Alt+/`，选择 `Registry...`。
 - 找到 `compiler.automake.allow.when.app.running` 选项，并勾选它。

**步骤3：测试热部署**
1. 正常运行你的Spring Boot应用。
2. 访问 `http://localhost:8080/hello`，看到 "hello Spring Boot"。
3. 修改 `HelloController.java` 中 `hello()` 方法的返回值，例如改为 `return "hello world, hot deploy!";`。
4. **保存文件**（`Ctrl+S`）。此时观察IDEA的控制台，会看到应用自动重启的日志。
5. 刷新浏览器页面，你将看到新的返回内容 "hello world, hot deploy!"，整个过程无需手动点击重启按钮。

## 1.4 Spring Boot 原理分析

### Spring Boot 依赖管理
**定理1**: Spring Boot的核心依赖管理机制基于两个组件：`spring-boot-starter-parent`和各种`spring-boot-starter-*`。`parent`项目通过`<dependencyManagement>`标签定义了所有常用依赖的版本号，而`starter`则捆绑了一系列实现特定功能（如Web开发）所需的依赖。

> 把`pom.xml`想象成一个购物清单。`spring-boot-starter-parent`就像是超市的“价格和品牌指南”，它规定了所有商品（依赖）的推荐品牌和价格（版本号），确保你买的所有东西都互相兼容。而`spring-boot-starter-web`这样的`starter`则是超市的“火锅套餐”，你只要把这个套餐放进购物车，所有吃火锅需要的食材（Tomcat, Spring MVC, Jackson等）就都自动配齐了，你不需要一样一样地去货架上找。

**例题1**: `spring-boot-starter-parent`和`spring-boot-starter-web`分别起什么作用？
**解**:
1. **`spring-boot-starter-parent`**:
 - **作用**: 它是一个特殊的父项目。当你的项目在`pom.xml`中声明它为`<parent>`时，你的项目就继承了它的配置。
 - **核心功能**:
 - **版本仲裁**: 在其内部的`<properties>`和`<dependencyManagement>`中预先定义了海量常用第三方库的版本号。这样，当你在自己的项目中引入这些依赖时，无需指定版本号，SpringBoot会使用父项目中定义的统一版本，从而避免了版本冲突。
 - **默认配置**: 提供了一些默认的Maven插件配置（如打包插件）和Java编译器版本等。
 ```xml
 <!-- 继承父项目 -->
 <parent>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-starter-parent</artifactId>
 <version>2.1.3.RELEASE</version>
 </parent>
 ```

2. **`spring-boot-starter-web`**:
 - **作用**: 它是一个场景启动器，专门为Web开发场景服务。
 - **核心功能**: 它本身没有太多代码，主要作用是作为一个依赖集合。一旦你引入它，Maven会根据依赖传递性，把所有Web开发所需的库都下载到你的项目中，包括：
 - `spring-boot-starter-json`: 用于JSON读写。
 - `spring-boot-starter-tomcat`: 内嵌Tomcat服务器。
 - `spring-mvc`: Spring的Web框架核心。
 ```xml
 <!-- 引入Web场景启动器 -->
 <dependency>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-starter-web</artifactId>
 <!-- 无需指定版本号，因为它由parent管理 -->
 </dependency>
 ```

### Spring Boot 自动配置
**定理2**: Spring Boot自动配置的核心是`@SpringBootApplication`注解。它是一个组合注解，其中最重要的`@EnableAutoConfiguration`会利用Spring的SPI（Service Provider Interface）机制，扫描classpath下所有`META-INF/spring.factories`文件中定义的自动配置类，并根据条件（`@ConditionalOnClass`等）来判断是否需要将这些配置Bean加载到Spring容器中。

> 自动配置的原理就像一个非常智能的管家。当你把一堆电器（starters依赖）买回家后，管家（`@EnableAutoConfiguration`）会逐个检查这些电器。他看到你买了咖啡机（`spring-boot-starter-data-jpa`），他就会自动帮你找到咖啡豆和水，并把咖啡机设置好（配置数据源和JPA）。他看到你买了电视（`spring-boot-starter-web`），就会自动帮你接上有线电视信号和电源（配置Tomcat和Spring MVC）。这一切都是自动的，前提是你已经把这些电器“买”回了家（即添加了依赖）。

**例题2**: `@SpringBootApplication`注解由哪几个核心注解组成？它们各自的作用是什么？
**解**:
`@SpringBootApplication` 是一个复合注解，主要由以下三个核心注解组成：

1. **`@SpringBootConfiguration`**:
 - **作用**: 它本身是`@Configuration`注解的包装。`@Configuration`是Spring框架的注解，用于声明当前类是一个配置类，可以包含`@Bean`定义的Bean。`@SpringBootConfiguration`则专门标识这是一个Spring Boot应用的“主配置类”。

2. **`@EnableAutoConfiguration`**:
 - **作用**: 这是**自动配置的开关和核心**。它告诉Spring Boot根据当前classpath中的jar包依赖，自动“猜测”并配置你可能需要的Bean。例如，如果classpath下有`tomcat-embedded.jar`，它就会自动配置一个嵌入式的Tomcat服务器。

3. **`@ComponentScan`**:
 - **作用**: 它会自动扫描并加载Spring组件。默认情况下，它会扫描`@SpringBootApplication`注解所在类及其所有子包下的`@Component`, `@Service`, `@Repository`, `@Controller`等注解，并将它们注册为Spring容器中的Bean。这就是为什么我们可以把Controller放在主启动类的子包下而被自动发现的原因。

### Spring Boot 执行流程
**定理3**: Spring Boot应用的执行始于`main`方法中的`SpringApplication.run()`。其流程主要分为两大阶段：第一阶段是创建和初始化`SpringApplication`实例，收集应用的初始设置；第二阶段是执行`run`方法，该方法会创建并刷新Spring的`ApplicationContext`，完成环境准备、Bean加载、服务器启动等一系列操作。

> 启动过程好比一场火箭发射。
> **第一阶段（初始化`SpringApplication`）**：这是发射前的准备工作。地面指挥中心（`SpringApplication`的构造函数）会收集所有发射所需的信息：检查火箭类型（Web应用类型）、确认所有参与人员（`ApplicationListener`监听器）、阅读发射手册（`ApplicationContextInitializer`初始化器）。
> **第二阶段（执行`run()`）**：这是按下发射按钮后的倒计时和升空过程。指挥中心开始执行`run`方法：
> - 广播“准备发射”通知（运行监听器的`starting`事件）。
> - 准备燃料和环境（创建并配置`Environment`）。
> - 创建并配置火箭的核心引擎（创建并配置`ApplicationContext`）。
> - 点火！（刷新`ApplicationContext`，加载所有Bean，启动内嵌服务器）。
> - 广播“发射成功”（运行监听器的`started`和`running`事件）。

**例题3**: 简述Spring Boot的执行流程。
**解**:
Spring Boot的执行流程可以概括为以下两个主要步骤：

**1. 初始化`SpringApplication`实例**
当 `new SpringApplication(primarySources)`被调用时，它主要做以下事情：
- **推断应用类型**: 根据classpath中是否存在特定类（如Spring MVC的`DispatcherServlet`）来判断应用是`SERVLET` Web应用、`REACTIVE` Web应用还是`NONE`。
- **加载初始化器**: 从`META-INF/spring.factories`中加载所有可用的`ApplicationContextInitializer`。这些是用于在`ApplicationContext`刷新前对其进行编程性配置的类。
- **加载监听器**: 从`META-INF/spring.factories`中加载所有可用的`ApplicationListener`。这些是用于监听应用生命周期中各个事件（如启动、失败等）的类。
- **推断主程序类**: 通过分析调用栈来确定哪个类是包含`main`方法的主程序类。

**2. 运行`run()`方法**
当`SpringApplication.run(args)`被调用时，它执行以下一系列复杂操作：
- **获取并启动监听器**: 创建`SpringApplicationRunListeners`并调用其`starting()`方法，广播应用开始启动的事件。
- **准备环境**: 创建并配置`Environment`对象，用于管理应用的配置属性（来自`application.properties`等）。
- **创建应用上下文**: 根据之前推断的应用类型，创建对应的`ApplicationContext`实例（如`AnnotationConfigServletWebServerApplicationContext`）。
- **预处理上下文**: 调用之前加载的`ApplicationContextInitializer`来配置上下文，并调用监听器的`contextPrepared()`和`contextLoaded()`事件。
- **刷新上下文**: 这是最核心的步骤，调用`context.refresh()`。Spring容器会在此阶段扫描并创建所有Bean，执行自动配置，并启动内嵌的Web服务器（如Tomcat）。
- **调用`ApplicationRunner`和`CommandLineRunner`**: 在上下文刷新后，会查找并调用所有实现了`ApplicationRunner`或`CommandLineRunner`接口的Bean的`run`方法，用于执行一些应用启动后的自定义逻辑。
- **广播运行中事件**: 最后，调用监听器的`started()`和`running()`方法，标志着应用已成功启动并正在运行。
