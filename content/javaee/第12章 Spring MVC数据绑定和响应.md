---
share: true
---


# 第12章 Spring MVC数据绑定和响应

## 12.1 数据绑定

### 12.1.1 数据绑定的概念
**数据绑定**是指将客户端请求中的消息数据（参数、请求头等）转换并绑定到处理器（Controller）的形参中。Spring MVC 接收到请求后，通过特定方式将请求参数值赋给处理器形参。

### 12.1.2 数据绑定流程
1.  **传递请求**：Spring MVC 将 `ServletRequest` 对象传递给 `DataBinder`。
2.  **传递参数**：将处理方法的入参对象传递给 `DataBinder`。
3.  **类型转换与填充**：`DataBinder` 调用 `ConversionService` 组件进行数据类型转换和格式化，将请求消息填充到参数对象中。
4.  **数据校验**：调用 `Validator` 组件对参数对象进行合法性校验。
5.  **绑定结果**：校验完成后生成 `BindingResult` 对象，Spring MVC 将其赋给处理方法的相应参数。

## 12.2 简单数据绑定

### 12.2.1 默认类型数据绑定
Spring MVC 默认支持以下类型的形参，会自动识别并赋值：
*   **HttpServletRequest**：获取请求信息。
*   **HttpServletResponse**：处理响应信息。
*   **HttpSession**：获取 session 对象。
*   **Model / ModelMap**：用于设置模型数据，数据会填充到 request 域。

**示例**：
```java
@RequestMapping("/getUserId")
public void getUserId(HttpServletRequest request) {
    String userid = request.getParameter("userid");
    System.out.println("userid=" + userid);
}
```

### 12.2.2 简单数据类型绑定
指 Java 基本数据类型（int, double, String 等）的绑定。
*   **规则**：客户端请求参数名称与处理器形参名称一致即可自动绑定。
*   **参数别名 (@RequestParam)**：当请求参数名与形参名不一致时使用。
    *   `value`：指定请求参数名称。
    *   `required`：是否必须，默认为 true。
    *   `defaultValue`：参数默认值。

**示例**：
```java
@RequestMapping("/getUserName")
public void getUserName(@RequestParam(value="name", defaultValue="itheima") String username) {
    System.out.println("username=" + username);
}
```

*   **RESTful 风格绑定 (@PathVariable)**：用于将 URL 中的占位符参数绑定到形参。
    *   `value`：指定 URL 中占位符名称。

**示例**：
```java
@RequestMapping("/user/{name}")
public void getPathVariable(@PathVariable("name") String username) { ... }
```

### 12.2.3 POJO 绑定
将所有关联的请求参数封装在一个 POJO 类中，直接使用该 POJO 作为形参。
*   **规则**：客户端请求参数名称必须与 POJO 类的属性名称保持一致。
*   **乱码处理**：使用 Spring 提供的 `CharacterEncodingFilter` 过滤器解决中文乱码问题（在 web.xml 中配置）。

**示例**：
```java
public class User {
    private String username;
    private String password;
    // getters and setters
}

@RequestMapping("/registerUser")
public void registerUser(User user) { ... }
```

### 12.2.4 自定义类型转换器
当默认转换器无法满足需求时（如特殊日期格式），需自定义转换器。
1.  **创建转换器类**：实现 `Converter<S, T>` 接口。
2.  **配置转换器**：在 spring-mvc.xml 中配置 `ConversionServiceFactoryBean` 并注册自定义转换器。
3.  **使用注解 (@DateTimeFormat)**：更简单的日期转换方式，直接在形参或属性上添加注解。
    ```java
    public void getBirthday(@DateTimeFormat(pattern="yyyy-MM-dd") Date birthday) { ... }
    ```

## 12.3 复杂数据绑定

### 12.3.1 数组绑定
用于接收客户端传递的多个同名参数（如复选框）。
*   **规则**：请求参数名称与处理器形参（数组）名称一致。

**示例**：
```java
public void getProducts(String[] proIds) { ... }
```

### 12.3.2 集合绑定
用于将数据绑定到 List 等集合中。
*   **规则**：请求参数名称与形参名称一致，且形参需要使用 `@RequestParam` 注解标注，否则 Spring MVC 会尝试创建 List 对象导致异常。

**示例**：
```java
public void getProducts(@RequestParam("proIds") List<String> proIds) { ... }
```

### 12.3.3 复杂 POJO 绑定
POJO 属性包含对象、List、Map 等引用类型。
1.  **属性为对象**：请求参数名为 `属性对象名.属性名`（如 `order.orderId`）。
2.  **属性为 List**：
    *   List 泛型为简单类型：参数名与 List 属性名一致。
    *   List 泛型为对象：参数名为 `List属性名[索引].对象属性名`（如 `orders[0].orderId`）。
3.  **属性为 Map**：请求参数名为 `Map属性名['key'].对象属性名`（如 `productInfo['生鲜'].proId`）。

### 12.3.4 JSON 数据绑定
将请求体中的 JSON 数据绑定到处理器形参。
*   **依赖**：需导入 Jackson 相关依赖。
*   **配置**：`<mvc:annotation-driven />` 自动注册消息转换器。
*   **静态资源放行**：配置 `<mvc:resources location="..." mapping="..." />` 防止静态资源被拦截。
*   **注解**：使用 `@RequestBody` 注解将请求体中的 JSON 数据绑定到形参对象。

**示例**：
```java
@RequestMapping("/getProduct")
public void getProduct(@RequestBody Product product) { ... }
```

## 12.4 页面跳转

### 12.4.1 返回值为 void 类型的页面跳转
默认跳转到 `前缀 + 方法映射路径 + 后缀` 对应的页面。

### 12.4.2 返回值为 String 类型的页面跳转
*   **返回逻辑视图名**：结合视图解析器跳转。
*   **转发**：返回 `forward:资源路径`（如 `forward:orders.jsp`）。
*   **重定向**：返回 `redirect:资源路径`（如 `redirect:http://www.itheima.com`）。

### 12.4.3 返回值为 ModelAndView 类型的页面跳转
`ModelAndView` 对象包含视图和模型数据。
*   **设置视图**：`setViewName(String viewName)`。
*   **添加数据**：`addObject(String attributeName, Object attributeValue)`。

**示例**：
```java
public ModelAndView showModelAndView() {
    ModelAndView mav = new ModelAndView();
    mav.addObject("username", "heima");
    mav.setViewName("register");
    return mav;
}
```

## 12.5 数据回写

### 12.5.1 普通字符串的回写
通过 `HttpServletResponse` 对象输出数据。
```java
public void showDataByResponse(HttpServletResponse response) {
    response.getWriter().print("response");
}
```

### 12.5.2 JSON 数据的回写
将对象或集合转换成 JSON 格式返回给客户端。
*   **注解**：使用 `@ResponseBody` 注解（可标注在方法或类上）。
*   **@RestController**：相当于 `@Controller` + `@ResponseBody`。

**示例**：
```java
@RequestMapping("getUser")
@ResponseBody
public User getUser() {
    User user = new User();
    user.setUsername("heima");
    return user; // 自动转换为 JSON 返回
}
```