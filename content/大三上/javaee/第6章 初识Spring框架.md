---
share: true
---

![[./assets/第6章 初识Spring框架/file-20260111144842445.png|file-20260111144842445.png]]
# 第6章 初识Spring框架

## 6.1 Spring介绍

### 6.1.1 Spring概述
**Spring** 是由 Rod Johnson 组织和开发的一个分层的 Java SE/EE **一站式（full-stack）** 轻量级开源框架。

**核心技术**：
1.  **IoC (Inversion of Control，控制反转)**：
    *   Spring 的基础。
    *   支撑 Spring 对 JavaBean 的管理功能。
2.  **AOP (Aspect Oriented Programming，面向切面编程)**：
    *   Spring 的重要特性。
    *   通过预编译方式和运行期间动态代理实现程序功能。
    *   可以在不修改源代码的情况下，给程序统一添加功能（如事务管理、日志记录）。

**在各层的作用**：
*   **表现层**：提供了 Spring MVC 框架，并支持与 Struts 整合。
*   **业务逻辑层**：管理事务、记录日志等。
*   **持久层**：可以整合 MyBatis、Hibernate、JdbcTemplate 等技术。

### 6.1.2 Spring框架的优点
Spring 框架之所以被广泛应用，主要归功于以下优点：

1.  **非侵入式设计 (Non-invasive)**：Spring 的 API 不会出现在业务逻辑中，业务逻辑代码纯净，易于移植。
2.  **降低耦合性**：Spring 就是一个大工厂，将对象创建和依赖关系维护交给 Spring 容器管理，降低组件间耦合。
3.  **支持 AOP 编程**：方便进行面向切面的编程，将通用任务（如安全、事务、日志）集中处理，减少代码冗余。
4.  **支持声明式事务**：通过配置管理事务，无需手动编程，提高开发效率。
5.  **方便程序的测试**：提供对 JUnit 的支持，方便进行单元测试。
6.  **方便集成各种优秀框架**：内部提供了对 Struts、Hibernate、MyBatis、Quartz 等框架的直接支持。
7.  **降低 Java EE API 的使用难度**：对 JDBC、JavaMail 等 API 进行了封装，降低了使用难度。

### 6.1.3 Spring的体系结构
Spring 框架主要由 8 大模块组成，涵盖了从核心容器到 Web 开发的各个方面。

**核心容器模块 (Core Container)**：
*   **Beans 模块**：提供 `BeanFactory` 类，是工厂模式的经典实现，负责创建和管理 Bean 对象。
*   **Core 模块**：提供框架的基本组成部分，包括 IoC 和 DI 功能。
*   **Context 模块**：构建于 Beans 和 Core 之上，通过 `ApplicationContext` 接口提供上下文信息。
*   **SpEL 模块**：Spring 3.0 新增，提供对 Spring 表达式语言 (SpEL) 的支持，运行时查询和操作对象图。

**数据访问/集成模块 (Data Access/Integration)**：
*   **JDBC 模块**：提供 JDBC 抽象层，简化 JDBC 编码。
*   **ORM 模块**：集成主流对象关系映射框架（如 Hibernate, MyBatis）。
*   **OXM 模块**：提供对 XML 映射抽象层的支持（如 JAXB, Castor）。
*   **JMS 模块**：用于消息传递（生产和消费）。
*   **Transactions 模块**：提供事务管理功能。

**Web 模块**：
*   **Web 模块**：提供基础 Web 开发集成特性（如文件上传）。
*   **Servlet 模块**：包含 Spring MVC 实现。
*   **WebSocket 模块**：Spring 4.0 新增，支持 WebSocket 和 SockJS。
*   **Portlet 模块**：提供 Portlet 环境下的 MVC 实现。

**其他模块**：
*   **AOP 模块**：提供面向切面编程支持。
*   **Aspects 模块**：提供与 AspectJ 的集成。
*   **Instrumentation 模块**：提供类工具支持和类加载器实现。
*   **Messaging 模块**：Spring 4.0 新增，支持消息传递体系结构和协议。
*   **Test 模块**：支持单元测试和集成测试。

### 6.1.4 Spring 5的新特性
Spring 5 是当前最新版本，运行于 **JDK 8+** 之上。

1.  **更新 JDK 基线**：最低要求 JDK 8，积极运用 Java 8 新特性。
2.  **修订核心框架**：
    *   基于 JDK 8 反射增强，高效访问类参数。
    *   核心接口提供基于 JDK 8 默认方法的选择性声明。
    *   使用 `@Nullable` 和 `@NotNull` 注解处理空值，避免运行时空指针异常。
3.  **更新核心容器**：支持**候选组件索引**，替代类路径扫描，缩减启动时间。
4.  **支持响应式编程**：包含响应流和 Reactor (Java 实现)，专注于构建响应式应用。
5.  **支持函数式 Web 框架**：引入 `HandlerFunction` 和 `RouterFunction`，RouterFunction 替代了 `@RequestMapping`。
6.  **支持 Kotlin**：支持 Kotlin 语言，允许进行深度的函数式 Spring 编程。
7.  **提升测试功能**：完全支持 JUnit 5 Jupiter，支持并行测试，引入 `WebTestClient` 进行响应式集成测试。

### 6.1.5 Spring的下载及目录结构
**下载**：访问 Spring 官网 (repo.spring.io) 下载 `dist.zip` 压缩包（如 `spring-framework-5.2.8.RELEASE-dist.zip`）。

**目录结构**：
*   **docs**：包含 API 文档和开发规范。
*   **libs**：包含开发所需的 JAR 包和源码（共 63 个，每个模块 3 个：编译包、文档包、源码包）。
*   **schema**：包含配置文件的 XML Schema 文档。

> **注意**：Spring 核心容器还需要依赖 `commons-logging` JAR 包。

## 6.2 Spring的入门程序

### 实现步骤
1.  **创建 Maven 项目**：在 `pom.xml` 中引入 Spring 基础包（`spring-core`, `spring-beans`, `spring-context`, `spring-expression`）和 `commons-logging` 依赖。
2.  **创建类**：创建一个普通 Java 类（如 `HelloSpring`），定义属性和方法。
    ```java
    public class HelloSpring {
        private String userName;
        public void setUserName(String userName) {
            this.userName = userName;
        }
        public void show() {
            System.out.println(userName + ": 欢迎来到Spring");
        }
    }
    ```
3.  **创建配置文件**：创建 `applicationContext.xml`，配置 Bean。
    ```xml
    <!-- 将 HelloSpring 类配置给 Spring 管理 -->
    <bean id="helloSpring" class="com.itheima.HelloSpring">
        <!-- 依赖注入：为 userName 属性赋值 -->
        <property name="userName" value="张三" />
    </bean>
    ```
    > 提示：XML 约束信息可以在 Spring 文档 (`docs/spring-framework-reference/core.html`) 中找到。
4.  **编写测试类**：初始化容器并获取 Bean。
    ```java
    public class TestHelloSpring {
        public static void main(String[] args) {
            // 1. 初始化 Spring 容器，加载配置文件
            ApplicationContext applicationContext = 
                new ClassPathXmlApplicationContext("applicationContext.xml");
            // 2. 通过容器获取 Bean 实例
            HelloSpring helloSpring = 
                (HelloSpring) applicationContext.getBean("helloSpring");
            // 3. 调用方法
            helloSpring.show();
        }
    }
    ```

## 6.3 控制反转与依赖注入

### 6.3.1 控制反转 (IoC) 的概念
*   **传统方式**：应用程序通过 `new` 关键字主动创建对象，应用程序掌握控制权。
*   **控制反转 (IoC)**：对象由 **IoC 容器** 统一管理。当程序需要对象时，直接从容器中获取。**对象的控制权从应用程序转移到了 IoC 容器**。
    > 作用：实现对象之间的解耦。

### 6.3.2 依赖注入 (DI) 的概念
**依赖注入 (Dependency Injection)**：由 IoC 容器在运行期间动态地将某种依赖资源（如对象、数值）注入到对象之中。
*   例如：将对象 B 注入给对象 A 的成员变量。
*   **关系**：IoC 和 DI 是同一件事的两个角度。IoC 是从容器角度（控制反转），DI 是从应用程序角度（依赖注入）。

### 6.3.3 依赖注入的类型
Spring 主要提供两种依赖注入方式：

1.  **构造方法注入**：
    *   通过 `<constructor-arg>` 元素配置。
    *   Spring 调用带参构造方法，通过反射传入参数。
    ```xml
    <bean id="user1" class="com.itheima.User1">
        <constructor-arg name="id" value="1"/>
        <constructor-arg name="name" value="张三"/>
        <constructor-arg name="password" value="123"/>
    </bean>
    ```

2.  **属性 setter 方法注入** (**主流方式**)：
    *   通过 `<property>` 元素配置。
    *   Spring 调用对象的 setter 方法赋值。
    ```xml
    <bean id="user2" class="com.itheima.User2">
        <property name="id" value="2" />
        <property name="name" value="李四" />
        <property name="password" value="456" />
    </bean>
    ```

### 6.3.4 依赖注入的应用 (案例)
实现一个简单的登录验证，通过 Spring 注入 DAO 层到 Service 层。

1.  **DAO 层**：定义 `UserDao` 接口和 `UserDaoImpl` 实现类。
2.  **Service 层**：定义 `UserService` 接口和 `UserServiceImpl` 实现类。
    *   在 `UserServiceImpl` 中声明 `UserDao` 属性，并提供 **setter 方法**。
    ```java
    public class UserServiceImpl implements UserService {
        private UserDao userDao;
        public void setUserDao(UserDao userDao) {
            this.userDao = userDao;
        }
        public boolean login(String name, String password) {
            return userDao.login(name, password);
        }
    }
    ```
3.  **配置文件 (`applicationContext.xml`)**：
    ```xml
    <bean id="userDao" class="com.itheima.dao.impl.UserDaoImpl" />
    <bean id="userService" class="com.itheima.service.impl.UserServiceImpl">
        <!-- 将 userDao Bean 注入到 userService 中 -->
        <property name="userDao" ref="userDao" />
    </bean>
    ```
4.  **测试**：从容器获取 `userService` 并调用 `login` 方法。