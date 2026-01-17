---
share: true
---
![[./assets/第10章 初识Spring MVC框架/file-20260111145336284.png|file-20260111145336284.png]]

# 第10章 初识Spring MVC框架

## 10.1 Spring MVC介绍

### 10.1.1 Spring MVC概述
**Spring MVC** 是目前最主流的 Web MVC 应用框架之一。它基于 **JSP Model2** 架构发展而来，解决了 JSP Model2 中控制器逻辑硬编码、代码复用性差等问题。

**Java EE三层架构**：
*   **表现层 (Web层)**：负责接收客户端请求，向客户端响应结果。
*   **业务层 (Service层)**：负责业务逻辑处理。
*   **持久层 (Dao层)**：负责与数据库交互 (CRUD)。

**Spring MVC在三层架构中的位置及作用**：
*   **位置**：作用于 **表现层**。
*   **作用**：接收客户端请求并进行响应。
    *   **控制器 (Controller)**：接收请求、解析封装数据、交给业务层。
    *   **视图 (View)**：渲染业务层处理后的结果并响应给客户端。

### 10.1.2 Spring MVC特点
1.  **基于 Spring 框架**：方便使用 Spring 提供的其他功能。
2.  **简单易用**：易于设计简洁的 Web 层。
3.  **灵活的映射策略**：支持多种请求资源的映射。
4.  **灵活的数据处理**：支持数据验证、格式化和数据绑定，无需实现特定 API。
5.  **支持国际化**：可根据用户区域显示多国语言。
6.  **支持多种视图技术**：如 JSP、Velocity、FreeMarker 等。
7.  **灵活性强，易扩展**。

## 10.2 Spring MVC入门程序

本节演示一个简单的入门程序：浏览器发起请求，Spring MVC 接收并响应跳转到指定页面。

### 实现步骤

#### STEP 01: 创建项目
在 IDEA 中创建一个名为 `chapter10` 的 Maven Web 项目。

#### STEP 02: 引入依赖
在 `pom.xml` 中引入 `spring-webmvc` 等相关依赖。
> 注意：课件中演示了引入 `spring-context`，实际 Web 开发通常需要 `spring-webmvc`。

```xml
<dependency>
    <groupId>org.springframework</groupId>
    <artifactId>spring-webmvc</artifactId>
    <version>5.2.8.RELEASE</version>
</dependency>
```

#### STEP 03: 配置前端控制器
在 `web.xml` 中配置 Spring MVC 的核心控制器 `DispatcherServlet`。

```xml
<servlet>
    <servlet-name>DispatcherServlet</servlet-name>
    <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
    <!-- 初始化参数：指定 Spring MVC 配置文件路径 -->
    <init-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:spring-mvc.xml</param-value>
    </init-param>
    <!-- 启动时加载 -->
    <load-on-startup>1</load-on-startup>
</servlet>
<servlet-mapping>
    <servlet-name>DispatcherServlet</servlet-name>
    <!-- 拦截所有请求 -->
    <url-pattern>/</url-pattern>
</servlet-mapping>
```

#### STEP 04: 配置 Spring MVC
创建 `spring-mvc.xml` 配置文件，配置组件扫描和视图解析器。

```xml
<!-- 扫描控制器包 -->
<context:component-scan base-package="com.itheima.controller"/>

<!-- 配置视图解析器 -->
<bean class="org.springframework.web.servlet.view.InternalResourceViewResolver">
    <property name="prefix" value="/WEB-INF/pages/"/>
    <property name="suffix" value=".jsp"/>
</bean>
```

#### STEP 05: 创建处理器 (Controller)
创建 `FirstController` 类，处理请求。

```java
@Controller
public class FirstController {
    // 映射访问路径
    @RequestMapping("/firstController")
    public String sayHello() {
        System.out.println("访问到FirstController!");
        // 返回逻辑视图名，结合视图解析器跳转到 /WEB-INF/pages/success.jsp
        return "success";
    }
}
```

#### STEP 06: 创建视图页面
在 `/WEB-INF/pages/` 目录下创建 `success.jsp`。

```html
<html>
<body>
    <h2>Spring MVC FirstController!</h2>
</body>
</html>
```

#### STEP 07: 启动测试
启动服务器（如 Tomcat），访问 `http://localhost:8080/chapter10/firstController`。
*   **控制台输出**：“访问到FirstController!”
*   **浏览器显示**：success.jsp 的内容。

## 10.3 Spring MVC工作原理

### Spring MVC 三大组件
1.  **处理器映射器 (HandlerMapping)**：
    *   作用：根据请求的 URL 找到对应的处理器 (Handler)。
    *   理解：`Map<URL, Handler>`。
2.  **处理器适配器 (HandlerAdapter)**：
    *   作用：调用并执行 Handler (即 Controller 中的方法)。
    *   原因：不同类型的 Handler 需要不同的适配器来解析执行。
3.  **视图解析器 (ViewResolver)**：
    *   作用：将逻辑视图名解析为物理视图名 (具体的页面地址)，并生成 View 对象。

### Spring MVC 执行流程
1.  **请求**：用户发送请求至前端控制器 `DispatcherServlet`。
2.  **映射**：`DispatcherServlet` 调用 `HandlerMapping`，根据 URL 查找 Handler。
3.  **返回链**：`HandlerMapping` 返回执行链 (`HandlerExecutionChain`)，包含 Handler 和 拦截器。
4.  **适配**：`DispatcherServlet` 调用 `HandlerAdapter`。
5.  **执行**：`HandlerAdapter` 执行 Handler (Controller)。
6.  **返回 M&V**：Handler 执行完毕，返回 `ModelAndView` 对象。
7.  **解析视图**：`DispatcherServlet` 请求 `ViewResolver` 解析视图。
8.  **返回 View**：`ViewResolver` 返回具体的 `View` 对象。
9.  **渲染**：`DispatcherServlet` 对 View 进行渲染 (填充模型数据)。
10. **响应**：响应用户。

> **小提示**：
> 在 Spring MVC 4.0 以后，如果不配置三大组件，框架会加载默认配置。
> 推荐在配置文件中使用 `<mvc:annotation-driven/>` 快速开启注解驱动，自动注册映射器和适配器。