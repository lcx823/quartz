---
share: true
---


# 第13章 Spring MVC的高级功能

## 13.1 异常处理

### 13.1.1 简单异常处理器
如果希望对 Spring MVC 中所有异常进行统一处理，可以使用 `HandlerExceptionResolver` 接口。Spring MVC 内部提供了其实现类 **`SimpleMappingExceptionResolver`**。

> 就像是医院的分诊台，根据病人的症状（异常类型），将其指引到对应的科室（错误页面）。

**功能：**
*   将不同类型的异常映射到不同的页面。
*   指定一个默认的异常处理页面（当没有匹配到特定异常映射时使用）。

**配置示例 (spring-mvc.xml)：**
```xml
<!-- 注入 SimpleMappingExceptionResolver -->
<bean class="org.springframework.web.servlet.handler.SimpleMappingExceptionResolver">
    <!-- 定义异常与页面的映射关系 -->
    <property name="exceptionMappings">
        <props>
            <!-- key为异常全限定名，value为视图名称 -->
            <prop key="java.lang.NullPointerException">nullPointerExp</prop>
            <prop key="java.io.IOException">IOExp</prop>
        </props>
    </property>
    <!-- 设置默认错误页面 -->
    <property name="defaultErrorView" value="defaultError"/>
    <!-- 设置异常属性名，在页面中通过 ${ex} 获取异常信息 -->
    <property name="exceptionAttribute" value="ex"/>
</bean>
```

### 13.1.2 自定义异常处理器
通过实现 `HandlerExceptionResolver` 接口并重写 `resolveException()` 方法，可以自定义异常处理逻辑。

**`resolveException()` 方法：**
当 Handler 执行抛出异常时，自定义异常处理器拦截异常并执行该方法。返回值是 `ModelAndView` 对象，可存储异常信息并跳转到指定页面。

**实现步骤：**
1.  **创建自定义异常类** (如 `MyException`)。
2.  **创建异常处理器类**：实现 `HandlerExceptionResolver` 接口。
3.  **重写 `resolveException`**：区分自定义异常和系统异常，分别处理。
4.  **注册 Bean**：在 Spring MVC 配置文件中注册自定义异常处理器。

**代码示例：**
```java
public class MyExceptionHandler implements HandlerExceptionResolver {
    @Override
    public ModelAndView resolveException(HttpServletRequest request, 
            HttpServletResponse response, Object handler, Exception ex) {
        String msg;
        if (ex instanceof MyException) {
            msg = ex.getMessage(); // 自定义异常信息
        } else {
            msg = "网络异常！"; // 系统异常隐藏细节
        }
        ModelAndView mav = new ModelAndView();
        mav.addObject("msg", msg);
        mav.setViewName("error"); // 跳转到 error.jsp
        return mav;
    }
}
```

### 13.1.3 异常处理注解
从 Spring 3.2 开始，提供了 `@ControllerAdvice` 注解，用于增强 Controller。

**主要作用：**
*   **全局异常处理**：结合 `@ExceptionHandler` 注解，捕获 Controller 中抛出的指定异常，实现统一处理。

**使用步骤：**
1.  **定义异常处理类**：使用 `@ControllerAdvice` 标注。
2.  **定义处理方法**：使用 `@ExceptionHandler(ExceptionClass.class)` 标注，指定处理的异常类型。

**代码示例：**
```java
@ControllerAdvice
public class ExceptionAdvice {
    // 处理 MyException 类型的异常
    @ExceptionHandler(MyException.class)
    public ModelAndView doMyException(MyException ex) {
        ModelAndView mav = new ModelAndView();
        mav.addObject("msg", ex.getMessage());
        mav.setViewName("error");
        return mav;
    }
}
```

## 13.2 拦截器

### 13.2.1 拦截器概述
**拦截器 (Interceptor)** 是一种动态拦截 Controller 方法调用的对象。它类似于 Servlet 中的 Filter（过滤器），但技术归属和拦截范围不同。

| 特性 | Filter (过滤器) | Interceptor (拦截器) |
| :--- | :--- | :--- |
| **技术归属** | Servlet 技术 | Spring MVC 技术 |
| **拦截内容** | 所有请求 | 仅针对 Spring MVC 的请求 |

**定义方式：**
1.  实现 `HandlerInterceptor` 接口（需重写所有方法）。
2.  继承 `HandlerInterceptorAdapter` 类（可选择性重写方法）。

**三个核心方法：**
1.  **`preHandle`**：控制器方法**调用前**执行。返回 `true` 放行，`false` 中断。用于登录拦截、权限校验。
2.  **`postHandle`**：控制器方法**调用后，视图解析前**执行。可修改请求域中的模型和视图。
3.  **`afterCompletion`**：整个请求完成（**视图渲染结束**）后执行。用于资源清理、日志记录。

### 13.2.2 拦截器的配置
在 Spring MVC 配置文件中通过 `<mvc:interceptors>` 元素配置。

**配置示例：**
```xml
<mvc:interceptors>
    <!-- 方式1：拦截所有请求 -->
    <bean class="com.itheima.interceptor.GlobalInterceptor"/>
    
    <!-- 方式2：拦截指定路径 -->
    <mvc:interceptor>
        <mvc:mapping path="/**"/> <!-- 拦截所有 -->
        <mvc:exclude-mapping path="/login"/> <!-- 排除登录 -->
        <bean class="com.itheima.interceptor.MyInterceptor"/>
    </mvc:interceptor>
</mvc:interceptors>
```

### 13.2.3 拦截器的执行流程
**单个拦截器：**
*   `preHandle` (true) -> `Handler` (Controller方法) -> `postHandle` -> 视图渲染 -> `afterCompletion`
*   若 `preHandle` 返回 false，后续流程全部中断。

**多个拦截器 (Interceptor1, Interceptor2)：**
*   `preHandle` 按配置顺序执行：1 -> 2
*   `postHandle` 按配置**逆序**执行：2 -> 1
*   `afterCompletion` 按配置**逆序**执行：2 -> 1

> 注意：如果拦截器 1 放行，拦截器 2 拦截（`preHandle` 返回 false），则执行拦截器 1 的 `afterCompletion`，但不会执行任何 `postHandle`。

### 13.2.4 案例：后台系统登录验证
**实现逻辑：**
1.  创建拦截器 `LoginInterceptor`。
2.  在 `preHandle` 中判断：
    *   如果是登录请求或已登录（Session 中有用户对象），返回 `true` 放行。
    *   否则，跳转到登录页面，返回 `false`。
3.  配置拦截器，拦截除登录相关外的其他请求。

## 13.3 文件上传和下载

### 13.3.1 文件上传
**表单要求：**
1.  `method="post"`
2.  `enctype="multipart/form-data"`
3.  文件输入框：`<input type="file" name="filename" />`

**Spring MVC 配置：**
需要配置多部件解析器 `MultipartResolver`。依赖 `commons-fileupload` 包。

**配置示例 (spring-mvc.xml)：**
```xml
<bean id="multipartResolver" class="org.springframework.web.multipart.commons.CommonsMultipartResolver">
    <property name="defaultEncoding" value="UTF-8"/>
    <property name="maxUploadSize" value="2097152"/> <!-- 最大2M -->
</bean>
```
> **注意**：Bean 的 `id` 必须为 `multipartResolver`。

**控制器处理：**
使用 `MultipartFile` 接口接收上传文件。
```java
@RequestMapping("/fileUpload")
public String fileUpload(MultipartFile file) throws IOException {
    if (!file.isEmpty()) {
        file.transferTo(new File("目标路径")); // 保存文件
        return "success";
    }
    return "fail";
}
```

### 13.3.2 文件下载
**原理：** 将服务器文件以流的形式传输到客户端。

**关键配置（HTTP 响应头）：**
1.  **Content-Disposition**：设置文件的打开方式（`attachment; filename=xxx` 表示以附件形式下载）。
2.  **Content-Type**：设置 MIME 类型（如 `application/octet-stream` 表示二进制流）。

**实现方式：** 使用 `ResponseEntity<byte[]>` 返回文件数据。

**代码示例：**
```java
@RequestMapping("/download")
public ResponseEntity<byte[]> download(HttpServletRequest request, String filename) throws IOException {
    // 1. 获取文件路径
    String path = request.getServletContext().getRealPath("/upload/") + File.separator + filename;
    File file = new File(path);
    
    // 2. 设置响应头
    HttpHeaders headers = new HttpHeaders();
    // 处理中文文件名乱码（针对不同浏览器需单独处理，此处略）
    headers.setContentDispositionFormData("attachment", filename); 
    headers.setContentType(MediaType.APPLICATION_OCTET_STREAM);
    
    // 3. 返回 ResponseEntity
    return new ResponseEntity<>(FileUtils.readFileToByteArray(file), headers, HttpStatus.OK);
}
```

### 13.3.3 案例：文件上传和下载
综合运用上述知识点，实现文件上传到服务器指定目录，记录文件名到 JSON 文件，并提供列表展示和下载功能。

**核心思路：**
1.  **上传**：`MultipartFile` 接收 -> 保存文件 -> 更新 `files.json` 记录。
2.  **列表**：读取 `files.json` -> 返回 JSON 数据 -> 前端展示下载链接。
3.  **下载**：根据文件名读取文件 -> `ResponseEntity` 返回二进制流。