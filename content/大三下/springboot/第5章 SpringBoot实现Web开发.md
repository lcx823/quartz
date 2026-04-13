---
share: true
title: 第5章 SpringBoot实现Web开发
created: 2026-03-22
source: Cherry Studio
tags:
---

# 第5章 SpringBoot实现Web开发

## 5.1 Spring MVC 整合支持

### Spring MVC 自动配置介绍
**定理1**: 在Spring Boot项目中，只要引入了`spring-boot-starter-web`依赖，Spring Boot就会自动启用对Spring MVC框架的整合和自动化配置。这使得开发者几乎无需任何手动配置即可开始Web开发。

> `spring-boot-starter-web`就像一个Web开发的“新手大礼包”。一旦你把它加入项目，Spring Boot就会自动为你配置好一套功能完善的MVC框架，包括视图解析器、字符编码过滤器、JSON转换器等，让你直接就能上手写Controller处理网页请求，省去了大量繁琐的XML配置或Java配置。

**定理2**: Spring Boot对Spring MVC的自动化配置包括以下核心功能特性：
1. **内置视图解析器**: 自动注册`ContentNegotiatingViewResolver`和`BeanNameViewResolver`，能根据请求头智能选择视图，或根据Bean名查找视图。
2. **静态资源支持**: 自动配置了静态资源（CSS, JS, 图片等）的映射路径，默认指向`classpath:/static/`等目录。
3. **转换器和格式化器**: 自动注册了`Converter`和`Formatter`，用于请求参数的类型转换和格式化（如字符串转日期）。
4. **HTTP消息转换器**: 自动注册了`HttpMessageConverter`（如`Jackson2JsonMessageConverter`），用于处理`@RequestBody`和`@ResponseBody`，实现Java对象与HTTP请求/响应体（如JSON）之间的自动转换。
5. **消息代码解析器**: 自动注册`MessageCodesResolver`，用于JSR303数据校验时的错误信息提示。
6. **首页和图标支持**: 支持静态首页`index.html`和自定义应用图标`favicon.ico`。
7. **Web数据绑定器**: 自动初始化`ConfigurableWebBindingInitializer`，用于支持Web数据绑定。

### Spring MVC 功能拓展实现
**定理3**: 如果需要对Spring Boot自动配置的MVC功能进行扩展或定制（如添加自定义的视图控制器、拦截器、格式化器等），推荐的方式是创建一个配置类并实现`WebMvcConfigurer`接口。

> Spring Boot的自动配置虽然好用，但有时我们想增加一些自己的“规矩”。`WebMvcConfigurer`接口就是Spring Boot提供的一个“扩展插槽”。你只需要实现这个接口，重写它里面的方法，就可以在不破坏原有自动配置的基础上，添加你自己的新功能，比如定义一个简单的URL跳转，或者加一个登录拦截器。

**例题1**: 如何不通过编写Controller方法，直接将`/toLoginPage`请求映射到`login.html`视图？
**解**:
**步骤1: 创建一个配置类并实现`WebMvcConfigurer`接口**
```java
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MyMvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // 将对 "/toLoginPage" 的请求直接转发到名为 "login" 的视图
        registry.addViewController("/toLoginPage").setViewName("login");
        // 为了兼容，也可以将对 "login.html" 的直接访问也映射到 "login" 视图
        registry.addViewController("/login.html").setViewName("login");
    }
}
```
**步骤2: 效果测试**
启动项目后，在浏览器访问`http://localhost:8080/toLoginPage`，会直接显示`templates/login.html`页面的内容，而不需要在任何`@Controller`中编写一个返回`"login"`的方法。

**定理4**: 通过实现`WebMvcConfigurer`接口并重写`addInterceptors`方法，可以向应用中注册自定义的拦截器（`HandlerInterceptor`），并指定拦截和排除的URL模式。

> 拦截器就像是Web应用的“门卫”。你可以雇佣一个门卫（实现`HandlerInterceptor`），然后通过`addInterceptors`方法告诉他需要看守哪些门（`addPathPatterns`），哪些门不用管（`excludePathPatterns`）。门卫可以在客人（请求）进入房间（Controller）前进行检查（`preHandle`），也可以在客人离开时做一些记录（`postHandle`和`afterCompletion`）。

**例题2**: 创建一个登录拦截器，要求访问`/admin/**`路径下的所有请求都必须在Session中存在`loginUser`属性，否则重定向到登录页面。
**解**:
**步骤1: 创建自定义拦截器`MyInterceptor`**
```java
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

@Component // 将拦截器注册为Spring组件，以便自动注入
public class MyInterceptor implements HandlerInterceptor {

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Object loginUser = request.getSession().getAttribute("loginUser");
        // 如果用户未登录
        if (loginUser == null) {
            // 重定向到登录页
            response.sendRedirect("/toLoginPage");
            return false; // 阻止请求继续执行
        }
        // 用户已登录，放行
        return true;
    }
}
```
**步骤2: 在`MyMvcConfig`中注册拦截器**
```java
@Configuration
public class MyMvcConfig implements WebMvcConfigurer {
    
    @Autowired
    private MyInterceptor myInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(myInterceptor)
                .addPathPatterns("/**") // 拦截所有请求
                .excludePathPatterns("/toLoginPage", "/login.html", "/login", "/css/**", "/js/**"); // 排除登录页、静态资源等
    }
    
    // addViewControllers等其他配置...
}
```
**步骤3: 效果测试**
启动项目，在未登录的情况下直接访问`http://localhost:8080/admin/dashboard`（假设有这个页面），浏览器会自动跳转到`http://localhost:8080/toLoginPage`。

## 5.2 Spring Boot 整合Servlet三大组件

### 组件注册整合Servlet三大组件
**定理1**: Spring Boot推荐使用Java配置的方式来注册传统的Servlet三大组件（Servlet, Filter, Listener）。通过在`@Configuration`类中创建类型为`ServletRegistrationBean`, `FilterRegistrationBean`, `ServletListenerRegistrationBean`的`@Bean`，可以实现对这些组件的精细化控制。

> 这种方式是Spring Boot的“官方”做法，它把Servlet、Filter这些“非Spring原生”的组件包装成了Spring能理解的Bean。这样做的好处是你可以像配置其他Spring Bean一样配置它们，比如设置URL映射、初始化参数等，管理起来非常清晰统一。

**例题1**: 使用组件注册的方式整合自定义的Servlet、Filter和Listener。
**解**:
**步骤1: 创建自定义组件**
* **MyServlet.java**:
```java
    @Component // 注册为组件，以便在配置类中注入
    public class MyServlet extends HttpServlet {
        @Override
        protected void doGet(HttpServletRequest req, HttpServletResponse resp) throws IOException {
            resp.getWriter().write("Hello MyServlet");
        }
    }
    ```
*   **MyFilter.java**:
    ```java
    @Component
    public class MyFilter implements Filter {
        @Override
        public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain) throws IOException, ServletException {
            System.out.println("Hello MyFilter");
            chain.doFilter(request, response);
        }
    }
    ```
*   **MyListener.java**:
    ```java
    @Component
    public class MyListener implements ServletContextListener {
        @Override
        public void contextInitialized(ServletContextEvent sce) {
            System.out.println("contextInitialized...");
        }
    }
    ```

**步骤2: 创建Servlet组件配置类**
```java
@Configuration
public class ServletConfig {

 // 注册Servlet
 @Bean
 public ServletRegistrationBean<MyServlet> getServlet(MyServlet myServlet) {
 return new ServletRegistrationBean<>(myServlet, "/myServlet");
 }

 // 注册Filter
 @Bean
 public FilterRegistrationBean<MyFilter> getFilter(MyFilter myFilter) {
 FilterRegistrationBean<MyFilter> registrationBean = new FilterRegistrationBean<>(myFilter);
 registrationBean.setUrlPatterns(Arrays.asList("/toLoginPage", "/myServlet"));
 return registrationBean;
 }

 // 注册Listener
 @Bean
 public ServletListenerRegistrationBean<MyListener> getListener(MyListener myListener) {
 return new ServletListenerRegistrationBean<>(myListener);
 }
}
```
**步骤3: 效果测试**
*   启动应用，控制台会打印`contextInitialized...`。
*   访问`http://localhost:8080/myServlet`，页面显示`Hello MyServlet`，同时控制台打印`Hello MyFilter`。

### 路径扫描整合Servlet三大组件
**定理2**: Spring Boot提供了另一种更简单的方式来整合Servlet三大组件。只需在主启动类上添加`@ServletComponentScan`注解，Spring Boot就会自动扫描项目中使用了`@WebServlet`, `@WebFilter`, `@WebListener`注解的类，并自动注册它们。

> `@ServletComponentScan`就像一个“星探”，它会在你的项目中寻找那些贴着`@WebServlet`、`@WebFilter`等“我想当明星”标签的类，然后自动把它们签约到公司的花名册（Spring容器）里。这种方式完全遵循Java EE的原始标准，代码更简洁。

**例题2**: 使用路径扫描的方式整合Servlet、Filter和Listener。
**解**:
**步骤1: 修改自定义组件，使用注解**
*   **AnnotationServlet.java**:
    ```java
    @WebServlet("/annotationServlet")
    public class AnnotationServlet extends HttpServlet {
        // ...
    }
    ```
*   **AnnotationFilter.java**:
    ```java
    @WebFilter(urlPatterns = "/annotationServlet")
    public class AnnotationFilter implements Filter {
        // ...
    }
    ```
*   **AnnotationListener.java**:
    ```java
    @WebListener
    public class AnnotationListener implements ServletContextListener {
        // ...
    }
    ```

**步骤2: 在主启动类上开启扫描**
```java
@SpringBootApplication
@ServletComponentScan // 开启基于注解的Servlet组件扫描
public class Chapter05Application {
 public static void main(String[] args) {
 SpringApplication.run(Chapter05Application.class, args);
 }
}
```
**步骤3: 效果测试**
*   启动应用，控制台会打印Listener的初始化信息。
*   访问`http://localhost:8080/annotationServlet`，Filter会生效，并且Servlet会正确响应。

## 5.3 文件的上传与下载

### 文件上传
**定理1**: Spring Boot利用Spring MVC的`MultipartResolver`自动处理文件上传。在Controller方法中，可以直接使用`MultipartFile`类型的参数来接收上传的文件。文件大小等限制可以在`application.properties`中通过`spring.servlet.multipart.*`属性进行配置。

> 上传文件就像寄快递。HTML表单（`enctype="multipart/form-data"`）负责打包，Spring Boot的Controller就像收件人，他收到的`MultipartFile`就是一个封装好的包裹，里面有文件名、文件内容等所有信息。你只需调用`transferTo()`方法，就能把这个包裹里的东西存到你的仓库（服务器磁盘）里。

**例题1**: 实现一个支持多文件上传的功能。
**解**:
**步骤1: 编写文件上传的表单页面 (`upload.html`)**
```html
<form th:action="@{/uploadFile}" method="post" enctype="multipart/form-data">
 <input type="file" name="fileUpload" multiple required>
 <input type="submit" value="上传">
</form>
```
**步骤2: 在全局配置文件中添加相关配置**
```properties
# 单个上传文件大小限制（默认1MB）
spring.servlet.multipart.max-file-size=10MB
# 总上传文件大小限制（默认10MB），用于多文件上传
spring.servlet.multipart.max-request-size=50MB
```
**步骤3: 编写Controller处理文件上传**
```java
@Controller
public class FileController {

 @GetMapping("/toUpload")
 public String toUpload() {
 return "upload";
 }

 @PostMapping("/uploadFile")
 public String uploadFile(@RequestParam("fileUpload") MultipartFile[] files, Model model) throws IOException {
 String uploadPath = "F:/file/"; // 定义上传路径
 File uploadDir = new File(uploadPath);
 if (!uploadDir.exists()) uploadDir.mkdir();

 for (MultipartFile file : files) {
 if (!file.isEmpty()) {
 String originalFilename = file.getOriginalFilename();
 // 防止文件名重复，使用UUID
 String newFilename = UUID.randomUUID().toString() + "_" + originalFilename;
 file.transferTo(new File(uploadPath + newFilename));
 }
 }
 model.addAttribute("uploadStatus", "上传成功！");
 return "upload";
 }
}
```
**步骤4: 效果测试**
访问`/toUpload`，选择一个或多个文件上传，文件将被保存到`F:/file/`目录下。

### 文件下载
**定理2**: 文件下载的本质是服务器将文件的字节流写入HTTP响应中。在Spring Boot中，返回一个`ResponseEntity<byte[]>`是实现文件下载的便捷方式。通过设置HTTP头`Content-Disposition: attachment; filename="your_file.ext"`，可以告诉浏览器这是一个需要下载的附件，而不是在页面上直接显示。

> 文件下载就像提供外卖服务。用户下单（点击下载链接），你的Controller（后厨）去仓库（磁盘）把商品（文件）拿出来，打包（读入`byte[]`），贴上外卖单（设置`HttpHeaders`，写明商品名称和“请直接享用”），然后交给骑手（Spring MVC）送给用户（浏览器）。

**定理3**: 为确保下载的文件名（特别是包含中文时）在不同浏览器中都能正常显示，需要根据请求头中的`User-Agent`来判断浏览器类型，并对文件名进行相应的URL编码。

**例题2**: 实现一个文件下载功能，支持中文文件名。
**解**:
**步骤1: 添加`commons-io`依赖（可选，但很方便）**
```xml
<dependency>
 <groupId>commons-io</groupId>
 <artifactId>commons-io</artifactId>
 <version>2.6</version>
</dependency>
```
**步骤2: 编写文件下载的Controller方法**
```java
import org.apache.commons.io.FileUtils;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import javax.servlet.http.HttpServletRequest;
import java.io.File;
import java.io.IOException;
import java.net.URLEncoder;

@Controller
public class FileController {

 @GetMapping("/download")
 public ResponseEntity<byte[]> fileDownload(HttpServletRequest request, @RequestParam String filename) throws Exception {
 String filePath = "F:/file/" + filename;
 File file = new File(filePath);

 // 创建响应头
 HttpHeaders headers = new HttpHeaders();
 // 处理中文文件名乱码
 String downloadFileName = getEncodedFilename(request, filename);
 headers.setContentDispositionFormData("attachment", downloadFileName);
 headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);

 // 使用FileUtils读取文件到字节数组，并返回ResponseEntity
 return new ResponseEntity<>(FileUtils.readFileToByteArray(file), headers, HttpStatus.OK);
 }

 // 根据不同浏览器对文件名进行编码
 private String getEncodedFilename(HttpServletRequest request, String filename) throws Exception {
 String userAgent = request.getHeader("User-Agent");
 // 针对IE或IE内核的浏览器
 if (userAgent.contains("MSIE") || userAgent.contains("Trident")) {
 return URLEncoder.encode(filename, "UTF-8").replace("+", " ");
 }
 // 其他浏览器（Chrome, Firefox等）
 return new String(filename.getBytes("UTF-8"), "ISO-8859-1");
 }

 // 省略其他方法...
}
```
**步骤3: 效果测试**
在页面上创建一个链接如`<a th:href="@{/download(filename='测试文档.pdf')}">下载测试文档</a>`，点击后即可下载文件，且文件名显示正常。

## 5.4 Spring Boot应用的打包和部署

### Jar包方式打包部署
**定理1**: Spring Boot项目默认打包为可执行的JAR文件。此JAR文件内置了Web服务器（如Tomcat），使得应用可以独立运行，无需外部容器。打包任务由`spring-boot-maven-plugin`插件完成。

> JAR包部署是Spring Boot最酷的特性之一。它把你的应用和服务器打包成一个“绿色软件”，你把它复制到任何有Java环境的机器上，用一个`java -jar`命令就能启动，非常适合微服务和云原生部署。

**例题1**: 如何将Spring Boot项目打包成可执行的JAR并运行？
**解**:
**步骤1: 确认`pom.xml`中有打包插件**
Spring Initializr创建的项目会默认包含此插件。
```xml
<build>
 <plugins>
 <plugin>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-maven-plugin</artifactId>
 </plugin>
 </plugins>
</build>
```
**步骤2: 使用Maven进行打包**
在IDEA的Maven面板中，双击`Lifecycle -> package`，或者在项目根目录运行命令：
```bash
mvn package
```
打包成功后，会在`target`目录下生成如`my-app-0.0.1-SNAPSHOT.jar`的文件。

**步骤3: 部署和运行**
将生成的JAR包复制到服务器上，通过命令行启动：
```bash
java -jar my-app-0.0.1-SNAPSHOT.jar
```
也可以在后台运行，并将日志输出到文件：
```bash
nohup java -jar my-app-0.0.1-SNAPSHOT.jar > app.log 2>&1 &
```

### War包方式打包部署
**定理2**: 如果需要将Spring Boot应用部署到传统的外部Servlet容器（如独立的Tomcat服务器）中，需要将其打包成WAR文件。这需要三个关键步骤：1) 在`pom.xml`中将`<packaging>`改为`war`；2) 将内嵌的Tomcat依赖范围设为`provided`；3) 让主启动类继承`SpringBootServletInitializer`并重写`configure`方法。

> WAR包部署是“回归传统”。你告诉Spring Boot：“你不用自己带服务器了，我给你找了个大房子（外部Tomcat），你按规矩住进去就行。”为此，你需要把应用打包成Tomcat认识的WAR格式，并提供一个“门钥匙”（`SpringBootServletInitializer`），让Tomcat知道如何启动你的应用。

**例题2**: 如何将Spring Boot项目打包成WAR并部署到外部Tomcat？
**解**:
**步骤1: 修改`pom.xml`**
```xml
<!-- 1. 声明打包方式为war -->
<packaging>war</packaging>

<dependencies>
 ...
 <!-- 2. 将内嵌tomcat依赖范围设为provided，表示由外部容器提供 -->
 <dependency>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-starter-tomcat</artifactId>
 <scope>provided</scope>
 </dependency>
 ...
</dependencies>
```
**步骤2: 修改主启动类**
```java
@SpringBootApplication
public class Chapter05Application extends SpringBootServletInitializer {

 // 3. 重写configure方法，指向当前应用的主类
 @Override
 protected SpringApplicationBuilder configure(SpringApplicationBuilder application) {
 return application.sources(Chapter05Application.class);
 }

 public static void main(String[] args) {
 SpringApplication.run(Chapter05Application.class, args);
 }
}
```
**步骤3: 打包**
执行`mvn package`命令，此时`target`目录下会生成一个WAR文件。

**步骤4: 部署**
将生成的WAR文件（例如`my-app-0.0.1-SNAPSHOT.war`）复制到外部Tomcat服务器的`webapps`目录下。启动Tomcat（执行`bin/startup.bat`或`bin/startup.sh`），Tomcat会自动解压并部署该应用。

**步骤5: 访问**
访问路径通常为`http://localhost:8080/项目名/`，项目名即WAR包的文件名（不含`.war`后缀）。
