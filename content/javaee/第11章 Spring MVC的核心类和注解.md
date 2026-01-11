---
share: true
---

![[./assets/第11章 Spring MVC的核心类和注解/file-20260111145455856.png|file-20260111145455856.png]]
# 第11章 Spring MVC的核心类和注解

## 11.1 DispatcherServlet

### 11.1.1 DispatcherServlet概述
**DispatcherServlet** 是 Spring MVC 的核心类，也是 Spring MVC 的流程控制中心，被称为**前端控制器**。
*   **作用**：它拦截客户端的请求，并根据具体规则将请求交给其他组件处理。
*   **好处**：所有请求都要经过 DispatcherServlet 进行转发处理，从而降低了 Spring MVC 组件之间的耦合性。

### 11.1.2 DispatcherServlet 配置

DispatcherServlet 本质上是一个 Servlet，需要在 `web.xml` 文件中进行配置和映射。

**配置分为两部分**：
1.  **配置前端控制器**：
    ```xml
    <servlet>
        <servlet-name>DispatcherServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <!-- 配置初始化参数，读取Spring MVC的配置文件 -->
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:spring-mvc.xml</param-value>
        </init-param>
        <!-- 应用加载时创建 -->
        <load-on-startup>1</load-on-startup>
    </servlet>
    ```
2.  **配置映射的 URL 路径**：
    ```xml
    <servlet-mapping>
        <servlet-name>DispatcherServlet</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
    ```

> **默认配置文件规则**：
> 如果 `web.xml` 没有通过 `<init-param>` 指定配置文件，DispatcherServlet 会自动在 `WEB-INF` 文件夹下寻找名为 `[servlet-name]-servlet.xml` 的文件。

**`<load-on-startup>` 元素取值说明**：
*   **正整数或 0**：项目启动时加载并初始化 Servlet。值越小，优先级越高。
*   **负数或未设置**：Servlet 在被请求时加载和初始化。
*   **值为 1**：DispatcherServlet 在项目启动时加载并初始化。

## 11.2 @Controller 注解

### 11.2.1 @Controller 注解作用
在 Spring MVC 中，传统的处理器类需要实现 Controller 接口，配置繁琐。Spring 2.5 以后引入了 `@Controller` 注解。
*   **作用**：将普通 Java 类标识为 Spring MVC 的处理器类（Controller）。
*   **使用方式**：标注在类上，配合 Spring 的扫描机制将类注册为 Bean。

**示例代码**：
```java
@Controller
public class FirstController {
    // ...
}
```

### 11.2.2 开启组件扫描
为了让 Spring 能够扫描到被 `@Controller` 标注的类，需要在 Spring MVC 的配置文件（如 `spring-mvc.xml`）中开启组件扫描。

**XML 配置**：
```xml
<beans ...>
    <!-- 配置要扫描的类包 -->
    <context:component-scan base-package="com.itheima.controller"/>
</beans>
```

> **优点**：相比传统方式，使用 `@Controller` 注解更加简单灵活，无需实现特定接口，且一个类中可以包含多个处理方法。

## 11.3 @RequestMapping 注解

### 11.3.1 @RequestMapping 注解的使用
**作用**：建立请求 URL 和 Handler（处理器）之间的映射关系。

**使用方式**：
1.  **标注在方法上**：
    *   该方法成为一个处理器，处理对应的 URL 请求。
    *   访问地址：`项目访问路径 + 方法映射路径`。
    ```java
    @Controller
    public class FirstController {
        @RequestMapping(value="/firstController")
        public void sayHello() {
            System.out.println("hello Spring MVC");
        }
    }
    ```

2.  **标注在类上**：
    *   `value` 属性值作为该类下所有请求路径的**父路径**（命名空间）。
    *   访问地址：`项目访问路径 + 类映射路径 + 方法映射路径`。
    ```java
    @Controller
    @RequestMapping(value="/springMVC")
    public class FirstController {
        @RequestMapping(value="/firstController")
        public void sayHello() {
             // 访问路径: /springMVC/firstController
             // ...
        }
    }
    ```

### 11.3.2 @RequestMapping 注解的属性
`@RequestMapping` 提供了多个属性来精确匹配请求。

| 属性名 | 类型 | 描述 |
| :--- | :--- | :--- |
| `value` | `String[]` | **默认属性**。指定请求的 URL 路径。支持映射单个 URL 或多个 URL（列表形式）。 |
| `name` | `String` | 为映射地址指定别名。 |
| `method` | `RequestMethod[]` | 限定请求方式（GET, POST, PUT, DELETE 等）。如果不匹配则无法处理。 |
| `params` | `String[]` | 限定请求参数。请求中必须包含指定的参数值才匹配。 |
| `headers` | `String[]` | 限定请求头。请求头中必须包含指定值才匹配。 |
| `consumes` | `String[]` | 限定提交内容类型 (`Content-Type`)。 |
| `produces` | `String[]` | 限定返回内容类型，仅当请求头 `Accept` 包含该类型时返回。 |

**method 属性示例**：
```java
// 仅处理 GET 请求
@RequestMapping(method = RequestMethod.GET)

// 同时支持 GET 和 POST
@RequestMapping(method = {RequestMethod.GET, RequestMethod.POST})
```

**params 属性示例**：
```java
// 请求必须包含 id 参数且值为 1
@RequestMapping(value = "/params", params = "id=1")
```

### 11.3.3 请求映射方式

#### 1. 基于请求方式的 URL 路径映射 (组合注解)
从 Spring 4.3 开始，提供了组合注解来简化 `method` 属性的配置：
*   `@GetMapping`：匹配 GET 请求。
*   `@PostMapping`：匹配 POST 请求。
*   `@PutMapping`：匹配 PUT 请求。
*   `@DeleteMapping`：匹配 DELETE 请求。
*   `@PatchMapping`：匹配 PATCH 请求。

**示例**：
```java
@GetMapping(value="/firstController") // 等同于 @RequestMapping(value="...", method=RequestMethod.GET)
public void sayHello() { ... }
```

#### 2. 基于 Ant 风格的 URL 路径映射
支持通配符匹配路径。

| 通配符 | 说明 | 示例 |
| :--- | :--- | :--- |
| `?` | 匹配任何单字符 | `/ant1?` 匹配 `/ant1a`, `/ant1b` |
| `*` | 匹配 0 或任意数量字符 | `/ant2/*.do` 匹配 `/ant2/findAll.do` |
| `**` | 匹配 0 或多级目录 | `/**/ant4` 匹配 `/a/b/ant4` |

> **最长匹配原则**：如果一个请求路径同时满足多个匹配规则，最终匹配满足规则字符最多的路径。

#### 3. 基于 RESTful 风格的 URL 路径映射
**REST (Representational State Transfer)** 是一种网络资源访问风格。
*   **特点**：将请求参数变成请求路径的一部分。
*   **传统 URL**：`http://.../findUserById?id=1`
*   **RESTful URL**：`http://.../user/1`

**HTTP 动词对应操作**：
*   `GET`：获取资源
*   `POST`：新建资源
*   `PUT`：更新资源
*   `DELETE`：删除资源