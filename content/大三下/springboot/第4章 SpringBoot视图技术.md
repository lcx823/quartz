---
share: true
title: 第4章 SpringBoot视图技术
created: 2026-03-22
source: Cherry Studio
tags:
---


# 第4章 SpringBoot视图技术

## 4.1 Spring Boot 支持的视图技术

### 模板引擎概述
**定理1**: Spring Boot支持多种视图技术，但主要推荐使用模板引擎（Template Engine）来实现前端页面的动态化。模板引擎允许开发者编写包含特定语法标记的HTML页面，这些标记在服务器端被处理，用动态数据替换后，最终生成标准的HTML页面发送给浏览器。

> 从初学者的角度来看，模板引擎就像一个“填空题”工具。你先设计一个HTML页面的“卷子”，在需要显示动态内容的地方挖好“空”（例如，显示用户名的地方）。当用户请求时，后端（Controller）会把“答案”（用户的具体名字）写在“答题卡”（Model）上，然后模板引擎这个“自动阅卷机”会把“答案”填到“卷子”的“空”里，最后生成一份填满内容的完整HTML页面给用户看。

**例题1**: Spring Boot常整合的模板引擎技术有哪些？
**解**:
Spring Boot官方提供了对多种模板引擎的自动化配置支持，常见的包括：
* **Thymeleaf**: Spring Boot官方首推的模板引擎，与Spring有非常好的集成，功能强大。
* **FreeMarker**: 一个成熟且广泛使用的模板引擎。
* **Groovy Templates**: Groovy语言自带的模板引擎。
* **Mustache**: 一个逻辑较少的模板引擎，语法简单，多语言支持。

## 4.2 Thymeleaf 基本语法

### Thymeleaf常用标签 (th:*)
**定理1**: Thymeleaf通过在标准HTML标签上添加`th:`前缀的属性来嵌入逻辑。为了让IDE能够识别Thymeleaf语法并提供支持，通常在`<html>`标签中声明其命名空间 `xmlns:th="http://www.thymeleaf.org"`。

> `th:*`属性就像是给普通的HTML标签贴上了一些“魔法指令”。浏览器会忽略这些它不认识的属性，所以不经Thymeleaf处理的HTML文件也能正常打开。而当文件经过Thymeleaf引擎处理时，引擎会识别这些“魔法指令”，并根据指令内容对标签进行操作，比如修改文本、循环渲染、条件判断等。

**例题1**: 列举Thymeleaf中常用的`th:`标签属性及其作用。
**解**:
| `th:`标签 | 说明 |
| :--- | :--- |
| **th:text** | 设置标签内的文本内容，会对特殊字符进行转义。 |
| **th:utext** | "Unescaped Text"，设置文本内容，但**不**转义特殊字符（如`<br>`)。 |
| **th:href** | 设置链接地址，通常与`@{...}`表达式结合使用。 |
| **th:src** | 设置图片、脚本等资源的路径，通常与`@{...}`表达式结合。 |
| **th:if** | 条件判断，当表达式结果为`true`时，渲染该元素。 |
| **th:unless** | 与`th:if`相反，当表达式结果为`false`时，渲染该元素。 |
| **th:each** | 遍历集合或数组，对每个元素重复渲染该标签。 |
| **th:object** | 选取一个对象，用于后续的`*{...}`选择表达式。 |
| **th:switch`, `th:case` | 多路选择结构，类似于Java的`switch-case`。 |
| **th:fragment** | 声明一个可被其他模板引用的页面片段。 |
| **th:insert`, `th:replace` | 引入一个页面片段。 |
| **th:attr** | 通用属性修改，可以设置任何HTML属性。 |

### 标准表达式
**定理2**: Thymeleaf定义了五种标准表达式，用于在`th:*`属性中获取数据和执行操作。
1. **变量表达式 `${...}`**: 用于从上下文中获取变量值。
2. **选择变量表达式 `*{...}`**: 用于从`th:object`选定的对象中获取属性值，比`${...}`更简洁。
3. **消息表达式 `#{...}`**: 用于实现国际化（i18n），根据当前语言环境获取对应的文本消息。
4. **链接URL表达式 `@{...}`**: 用于生成URL，可以自动处理上下文路径。
5. **片段表达式 `~{...}`**: 用于引用模板片段。

> 这五种表达式就像你在Thymeleaf世界里说话的五种基本句式。
> - `${...}` 是直接喊一个人的名字（变量名）来获取信息。
> - `*{...}` 是先指着一个家庭（`th:object`），然后再喊这个家庭里的成员名字（属性名）。
> - `#{...}` 是去查字典（国际化文件）获取某个词条的翻译。
> - `@{...}` 是问路，Thymeleaf会自动帮你规划好正确的路径。
> - `~{...}` 是引用别人说过的一段话（模板片段）。

**例题2**: Thymeleaf提供哪些内置对象来方便地访问Web上下文信息？
**解**:
在Web环境中，Thymeleaf提供了一些可以直接在表达式中使用的内置对象，方便访问请求、会话等信息：
* `#ctx`: 上下文对象。
* `#vars`: 上下文中的所有变量。
* `#locale`: 当前的区域设置（语言环境）。
* `#request`: `HttpServletRequest`对象。
* `#response`: `HttpServletResponse`对象。
* `#session`: `HttpSession`对象。
* `#servletContext`: `ServletContext`对象。

## 4.3 Thymeleaf 基本使用

### Thymeleaf 模板基本配置
**定理1**: 在Spring Boot项目中使用Thymeleaf，首先需要引入`spring-boot-starter-thymeleaf`依赖。Spring Boot会自动配置大部分参数，但开发者也可以在`application.properties`或`application.yaml`中自定义Thymeleaf的行为。

> 就像安装一个软件，`spring-boot-starter-thymeleaf`是安装包，装上就能用。`application.properties`里的配置就是软件的“设置”面板，你可以调整一些高级选项，比如是否开启缓存、模板文件放在哪里等。

**例题1**: 如何在Spring Boot项目中配置Thymeleaf？列出核心依赖和常用配置项。
**解**:
**1. 添加Maven依赖**
在`pom.xml`中加入Thymeleaf启动器：
```xml
<dependency>
   <groupId>org.springframework.boot</groupId>
   <artifactId>spring-boot-starter-thymeleaf</artifactId>
</dependency>
```

**2. 在`application.properties`中进行配置**
以下是常用配置项及其默认值：
```properties
# 模板文件的前缀路径。默认情况下，Spring Boot会在classpath:/templates/下查找模板。
spring.thymeleaf.prefix=classpath:/templates/

# 模板文件的后缀。默认是.html。
spring.thymeleaf.suffix=.html

# 模板的编码。默认是UTF-8。
spring.thymeleaf.encoding=UTF-8

# 模板模式。默认是HTML5。
spring.thymeleaf.mode=HTML

# 是否开启模板缓存。开发时建议设为false，方便实时查看修改效果；生产环境应设为true以提高性能。
spring.thymeleaf.cache=false 
```

### 静态资源的访问
**定理2**: Spring Boot项目会自动将Web请求 `/**` 映射到特定的classpath路径下，用于提供静态资源（如CSS, JavaScript, 图片等）。这些路径有固定的优先级。

> Spring Boot就像一个管家，他默认设置了几个“公共储物间”。你只要把CSS、JS这些公共物品放到这些储物间里，任何页面都可以通过一个简单的URL路径直接拿到，而不需要你为每个文件单独设置访问规则。

**例题2**: Spring Boot默认的静态资源映射路径有哪些？
**解**:
Spring Boot默认会从以下四个位置查找静态资源，优先级从高到低：
1. `classpath:/META-INF/resources/`
2. `classpath:/resources/`
3. `classpath:/static/` (最常用)
4. `classpath:/public/` (也很常用)

例如，在`src/main/resources/static/css/style.css`放置一个CSS文件，可以通过浏览器直接访问`http://localhost:8080/css/style.css`。

## 4.4 数据页面展示

### 使用Thymeleaf完成数据的页面展示
**定理1**: 在Spring MVC中，Controller方法可以通过`Model`对象将数据传递给视图。Thymeleaf模板则使用变量表达式`${...}`来获取并渲染这些从`Model`中传递过来的数据。

> 整个流程是：`Controller`负责准备数据并放入一个叫`Model`的“包裹”里，然后指定要去的“地址”（返回视图名）。Thymeleaf引擎在那个“地址”接收到“包裹”，拆开它，并根据模板里的`${...}`指令，把数据展示在页面的正确位置。

**例题1**: 创建一个Spring Boot应用，从Controller传递当前年份到`login.html`页面，并在页面上动态显示。
**解**:
**步骤1: 引入Thymeleaf依赖**
确保`pom.xml`中已有`spring-boot-starter-thymeleaf`。

**步骤2: 编写配置文件**
在`application.properties`中关闭缓存，便于开发调试。
```properties
spring.thymeleaf.cache=false
```

**步骤3: 创建Controller**
```java
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import java.util.Calendar;

@Controller
public class LoginController {

    @GetMapping("/toLoginPage")
    public String toLoginPage(Model model) {
        // 将当前年份添加到Model中，key为"currentYear"
        model.addAttribute("currentYear", Calendar.getInstance().get(Calendar.YEAR));
        // 返回视图名 "login"，Spring Boot会根据配置找到 "classpath:/templates/login.html"
        return "login";
    }
}
```

**步骤4: 创建模板页面和静态资源**
项目结构如下:
```
src/main/resources/
├── static
│   └── login
│       └── css
│           ├── bootstrap.min.css
│           └── signin.css
└── templates
    └── login.html
```
在`src/main/resources/templates/login.html`中编写代码:
```html
<!DOCTYPE html>
<html lang="en" xmlns:th="http://www.thymeleaf.org">
<head>
    <meta charset="UTF-8">
    <title>用户登录界面</title>
    <!-- 使用 @{...} 表达式引入静态CSS文件 -->
    <link th:href="@{/login/css/bootstrap.min.css}" rel="stylesheet">
    <link th:href="@{/login/css/signin.css}" rel="stylesheet">
</head>
<body>
    <!-- 其他登录表单内容 -->
    ...
    <!-- 使用 ${...} 表达式显示Controller传来的年份 -->
    <p class="mt-5 mb-3 text-muted">
        © <span th:text="${currentYear}">2018</span>
    </p>
</body>
</html>
```

**步骤5: 效果测试**
启动应用，访问`http://localhost:8080/toLoginPage`。页面底部的年份会动态显示为当前年份（如2024），而不是HTML中硬编码的2018。

## 4.5 Thymeleaf国际化页面

### 使用Thymeleaf配置国际化页面
**定理1**: Spring Boot通过自动配置`MessageSource`来支持国际化。开发者只需按照`basename_language_COUNTRY.properties`的格式创建国际化资源文件，并在`application.properties`中指定基础名（`basename`）。Thymeleaf使用消息表达式`#{key}`来从这些文件中获取对应语言的文本。

**定理2**: 为了实现动态语言切换，需要自定义一个`LocaleResolver`组件。该组件负责解析每次请求的区域信息（`Locale`），例如通过检查URL参数或Session属性。

> 国际化就像是为你的网站配备了一个多语言翻译团队。
> - `*.properties`文件是不同语种的“翻译稿”。
> - `spring.messages.basename`是告诉Spring Boot这些“翻译稿”的基本文件名是什么。
> - `LocaleResolver`是“接待员”，他根据访客（用户请求）的特征（如URL里的`?l=en_US`参数）判断访客的国籍，然后通知系统使用哪份“翻译稿”。
> - `#{login.tip}`是你在页面上下的指令：“此处内容，请去翻译稿里找`login.tip`这一条进行翻译”。

**例题1**: 为`login.html`页面配置中英文国际化，并实现通过URL参数切换语言。
**解**:
**步骤1: 编写多语言国际化文件**
在`src/main/resources/i18n/`目录下创建文件：
* `login.properties` (默认，中文)
```properties
    login.tip=请登录
    login.username=用户名
    login.password=密码
    login.button=登录
    ```
*   `login_en_US.properties` (英文)
    ```properties
    login.tip=Please sign in
    login.username=Username
    login.password=Password
    login.button=Login
    ```

**步骤2: 在全局配置文件中指定basename**
在`application.properties`中添加：
```properties
# 配置国际化文件基础名，指向 i18n 目录下的 login 文件
spring.messages.basename=i18n/login
```

**步骤3: 定制区域信息解析器**
创建一个`MyLocaleResolver`类，用于从URL参数`l`中解析语言。
```java
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.LocaleResolver;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.Locale;

@Configuration
public class MyLocaleResolverConfig {
 @Bean
 public LocaleResolver localeResolver() {
 return new MyLocaleResolver();
 }

 public static class MyLocaleResolver implements LocaleResolver {
 @Override
 public Locale resolveLocale(HttpServletRequest request) {
 // 获取请求参数l
 String lang = request.getParameter("l");
 // 获取系统默认的Locale
 Locale defaultLocale = Locale.getDefault();
 // 如果请求参数不为空，则根据请求参数创建Locale
 if (StringUtils.hasText(lang)) {
 String[] split = lang.split("_");
 return new Locale(split[^0], split[^1]);
 }
 // 否则返回系统默认的Locale
 return defaultLocale;
 }

 @Override
 public void setLocale(HttpServletRequest request, HttpServletResponse response, Locale locale) {
 // setLocale方法在此处可以不实现，因为我们是无状态的，每次都从请求中解析
 }
 }
}
```

**步骤4: 在页面中使用消息表达式**
修改`login.html`，使用`#{...}`替换硬编码的文本。
```html
...
<h1 class="h3 mb-3 font-weight-normal" th:text="#{login.tip}">请登录</h1>
<input type="text" class="form-control" th:placeholder="#{login.username}" required>
<input type="password" class="form-control" th:placeholder="#{login.password}" required>
<button class="btn btn-lg btn-primary btn-block" type="submit" th:text="#{login.button}">登录</button>
...
<!-- 添加语言切换链接 -->
<a class="btn btn-sm" th:href="@{/toLoginPage(l='zh_CN')}">中文</a>
<a class="btn btn-sm" th:href="@{/toLoginPage(l='en_US')}">English</a>
...
```

**步骤5: 整合效果与问题排查**
1. 启动项目，访问`http://localhost:8080/toLoginPage`，默认显示中文。
2. 点击"English"链接，URL变为`http://localhost:8080/toLoginPage?l=en_US`，页面切换为英文。
3. **乱码问题**: 如果中文显示为乱码，通常是`.properties`文件的编码问题。在IntelliJ IDEA中，进入`File` -> `Settings` -> `Editor` -> `File Encodings`，将`Default encoding for properties files`设置为`UTF-8`，并勾选`Transparent native-to-ascii conversion`。然后重启项目。
