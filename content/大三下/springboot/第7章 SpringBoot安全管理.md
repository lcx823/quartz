---
share: true
title: 第7章 SpringBoot安全管理
created: 2026-03-22
source: Cherry Studio
tags:
---

# 第7章 SpringBoot安全管理

## 7.1 Spring Security 介绍

### 认识Spring Security
**定理1**: Spring Security 是一个功能强大且高度可定制的框架，为基于Spring的应用程序提供身份验证（Authentication）和授权（Authorization）的安全服务。
* **认证 (Authentication)**: 验证用户是否是他们声称的身份，即“你是谁？”。通常涉及用户名和密码的校验。
* **授权 (Authorization)**: 认证成功后，决定用户是否有权限执行某个操作或访问某个资源，即“你能做什么？”。通常涉及用户的角色或权限。

> 从初学者的角度来看，认证就像进入一座大厦时，保安需要你出示身份证或工牌来确认你的身份。授权则是保安根据你的工牌级别，决定你能够进入哪些楼层（普通员工区、VIP会议室、服务器机房等）。

**定理2**: Spring Boot根据项目的依赖和配置，整合Spring Security提供了多种安全管理功能，主要包括：
* **MVC Security**: 保护基于Spring MVC构建的传统Web应用。
* **WebFlux Security**: 保护基于Spring WebFlux构建的响应式Web应用。
* **OAuth2**: 用于实现第三方认证、单点登录等复杂的分布式系统安全方案。
* **Actuator Security**: 保护Spring Boot Actuator的监控端点（如`/health`, `/info`），防止敏感信息泄露。

## 7.2 Spring Security 快速入门

### 开启安全管理
**定理1**: 在Spring Boot项目中，只需添加`spring-boot-starter-security`依赖，Spring Boot的自动配置机制就会立即启用Web安全管理。

> 这就像给你的Web应用安装了一套默认的安防系统。一旦依赖添加进来，安防系统立即启动，它会：
> 1. 保护所有URL，任何访问都需要先登录。
> 2. 自动生成一个登录页面。
> 3. 在控制台生成一个默认的用户名`user`和一串随机密码。

**例题1**: 体验Spring Security的默认安全管理。
**解**:
**步骤1: 创建基础项目**
使用Spring Initializr创建一个包含`Spring Web`和`Thymeleaf`依赖的Spring Boot项目。

**步骤2: 添加Spring Security依赖**
在`pom.xml`中加入`spring-boot-starter-security`启动器。
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>
```

**步骤3: 编写简单的Web控制层**
```java
@Controller
public class FilmeController {
    // 假设有首页和影片详情页
    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/detail/{type}/{path}")
    public String toDetail(@PathVariable String type, @PathVariable String path) {
        return "detail/" + type + "/" + path;
    }
}
```

**步骤4: 项目启动测试**
1. 启动项目，观察控制台输出，会找到一行类似下面的日志，其中包含随机生成的密码：
 `Using generated security password: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
2. 在浏览器中访问`http://localhost:8080/`。
3. 页面会自动重定向到一个由Spring Security生成的默认登录页面。
4. 输入用户名`user`和控制台中生成的随机密码，即可登录并访问到首页。

**问题**: 这种默认方式存在明显问题：密码随机且暴露在日志中、登录页面丑陋、只有一个用户、无法自定义权限等，因此必须进行自定义配置。

## 7.3 MVC Security安全配置介绍

**定理1**: Spring Security的默认Web安全配置主要由`SecurityAutoConfiguration`和`UserDetailsServiceAutoConfiguration`两个自动配置类实现。
**定理2**: 要覆盖Spring Security的默认配置，最核心的方式是创建一个继承自`WebSecurityConfigurerAdapter`的配置类，并使用`@EnableWebSecurity`注解。

> `WebSecurityConfigurerAdapter`是Spring Security提供给我们的一个“配置蓝图”。Spring Boot说：“默认情况下，我按我自己的蓝图来搭建安防系统。但如果你提供了一个继承自`WebSecurityConfigurerAdapter`的自定义蓝图，我就会完全按照你的要求来搭建。”

**定理3**: `WebSecurityConfigurerAdapter`中有两个最重要的方法需要重写，以实现自定义：
* `configure(AuthenticationManagerBuilder auth)`: 用于配置**认证**规则，即定义用户和密码从哪里来（内存、数据库等）。
* `configure(HttpSecurity http)`: 用于配置**授权**和HTTP层面的安全规则，如URL访问权限、自定义登录页面、登出、CSRF防护等。

## 7.4 自定义用户认证

### 内存身份认证 (In-Memory Authentication)
**定理1**: 通过重写`configure(AuthenticationManagerBuilder auth)`方法并使用`auth.inMemoryAuthentication()`，可以在内存中快速定义一组用于测试或演示的用户信息。

> 这就像给保安一份手写的临时访客名单。它简单快捷，适合内部测试，但不适用于生产环境，因为应用一重启，名单就丢失了。

**例题1**: 使用内存认证定义两个用户：`zhangsan`（普通用户）和`lisi`（VIP用户）。
**解**:
**步骤1: 创建`SecurityConfig`配置类**
```java
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityConfigurerAdapter;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

@EnableWebSecurity // 开启Web Security自定义功能
public class SecurityConfig extends WebSecurityConfigurerAdapter {

    @Override
    protected void configure(AuthenticationManagerBuilder auth) throws Exception {
        // 必须指定密码编码器，否则会报错
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        auth.inMemoryAuthentication()
            .passwordEncoder(encoder) // 设置密码编码器
            .withUser("zhangsan")
            .password(encoder.encode("123456"))
            .roles("common") // 赋予common角色
            .and()
            .withUser("lisi")
            .password(encoder.encode("123456"))
            .roles("common", "vip"); // 赋予common和vip两个角色
    }
}
```
* **注意**: 从Spring Security 5开始，必须为密码提供一个`PasswordEncoder`。`BCryptPasswordEncoder`是推荐的强哈希加密实现。

**步骤2: 效果测试**
重启项目，控制台不再生成随机密码。可以使用`zhangsan/123456`或`lisi/123456`在默认登录页面进行登录。

### JDBC身份认证
**定理2**: 通过`auth.jdbcAuthentication()`，可以让Spring Security直接通过JDBC连接数据库来验证用户身份。这需要数据库中有符合特定结构的表（或通过自定义查询来指定）。

> 这相当于保安系统直接连接到了公司的人事数据库。当有人刷卡时，系统直接查询数据库验证身份和权限，更加正式和持久化。

**例题2**: 配置JDBC认证，从数据库读取用户信息。
**解**:
**步骤1: 准备数据库和依赖**
* 在数据库中创建用户表`t_customer`、权限表`t_authority`和关联表`t_customer_authority`。确保用户密码是使用`BCrypt`加密后存储的。
* 在`pom.xml`中添加`spring-boot-starter-jdbc`和`mysql-connector-java`依赖。
* 在`application.properties`中配置数据源信息。

**步骤2: 修改`SecurityConfig`**
```java
@Autowired
private DataSource dataSource; // 自动注入配置好的数据源

@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    
    auth.jdbcAuthentication()
        .passwordEncoder(encoder) // 密码编码器
        .dataSource(dataSource) // 数据源
        .usersByUsernameQuery("select username, password, enabled from t_customer where username = ?") // 根据用户名查询用户
        .authoritiesByUsernameQuery("select c.username, a.authority from t_customer c, t_authority a, t_customer_authority ca where ca.customer_id = c.id and ca.authority_id = a.id and c.username = ?"); // 根据用户名查询权限
}
```

### UserDetailsService 身份认证
**定理3**: 这是最常用、最灵活的认证方式。通过实现`UserDetailsService`接口，并将其Bean注入Spring Security，可以完全自定义用户信息的加载逻辑（从JPA、MyBatis、Redis、LDAP等任何来源）。

> 这是最专业的模式。你聘请了一个专门的人事专员（`UserDetailsService`实现类）。保安系统（Spring Security）不再自己查数据库，而是将用户名交给这位专员，专员负责从任何地方（数据库、缓存、第三方服务）找到用户的详细档案（`UserDetails`对象）并返回给保安系统。

**例题3**: 使用`UserDetailsService`实现认证。
**解**:
**步骤1: 创建`UserDetailsService`的实现类**
```java
@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    
    @Autowired
    private CustomerService customerService; // 假设这是查询用户和权限的业务Service

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        // 1. 从数据库查询用户
        Customer customer = customerService.getCustomer(username);
        if (customer == null) {
            throw new UsernameNotFoundException("用户不存在");
        }
        // 2. 查询用户的权限
        List<Authority> authorities = customerService.getCustomerAuthority(username);
        // 3. 将权限集合转换为Security需要的GrantedAuthority集合
        List<GrantedAuthority> grantedAuthorities = authorities.stream()
            .map(auth -> new SimpleGrantedAuthority(auth.getAuthority()))
            .collect(Collectors.toList());

        // 4. 构建并返回UserDetails对象
        return new org.springframework.security.core.userdetails.User(
            customer.getUsername(),
            customer.getPassword(),
            grantedAuthorities
        );
    }
}
```

**步骤2: 修改`SecurityConfig`**
```java
@Autowired
private UserDetailsServiceImpl userDetailsService;

@Override
protected void configure(AuthenticationManagerBuilder auth) throws Exception {
    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
    // 使用自定义的UserDetailsService进行认证
    auth.userDetailsService(userDetailsService).passwordEncoder(encoder);
}
```

## 7.5 自定义用户授权与访问控制

### 自定义用户访问控制
**定理1**: 通过重写`configure(HttpSecurity http)`方法，可以精细化地定义URL的访问规则。

> 这是在制定安保手册的核心部分：哪个门谁可以进，哪个门谁不能进。

**例题1**: 配置访问规则：首页公开，普通区需`common`角色，VIP区需`vip`角色。
**解**:
```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests() // 开始配置授权
        .antMatchers("/").permitAll() // 根路径所有人可访问
        .antMatchers("/login/**").permitAll() // 登录相关路径也需放行
        .antMatchers("/detail/common/**").hasRole("common") // 需 "ROLE_common" 权限
        .antMatchers("/detail/vip/**").hasRole("vip")       // 需 "ROLE_vip" 权限
        .anyRequest().authenticated(); // 其他所有请求都需要认证后才能访问
    
    // ... 其他配置链式调用
}
```
* `hasRole("common")`会自动匹配`"ROLE_common"`权限。

### 自定义登录、退出、记住我等功能
**定理2**: `HttpSecurity`对象提供了一系列链式方法来配置登录、退出、记住我(Remember-Me)和CSRF等功能。

> 这些配置是在完善安保系统的细节：自定义登录窗口样式、设置登出口、提供“记住我”的临时通行证、以及防止伪造请求攻击（CSRF）。

**例题2**: 配置自定义登录页、退出功能和记住我功能。
**解**:
```java
@Override
protected void configure(HttpSecurity http) throws Exception {
    http.authorizeRequests()
        // ... (授权规则如上)
        .and() // 连接配置
    .formLogin() // 开始配置表单登录
        .loginPage("/userLogin") // 自定义登录页面URL
        .loginProcessingUrl("/login") // 处理登录请求的URL (HTML表单的action)
        .usernameParameter("name") // 自定义用户名参数名
        .passwordParameter("pwd") // 自定义密码参数名
        .defaultSuccessUrl("/") // 登录成功后默认跳转的URL
        .failureUrl("/userLogin?error") // 登录失败后跳转的URL
        .permitAll() // 登录页面相关URL全部放行
        .and()
    .logout() // 开始配置退出
        .logoutUrl("/mylogout") // 自定义退出URL
        .logoutSuccessUrl("/") // 退出成功后跳转的URL
        .and()
    .rememberMe() // 开始配置"记住我"功能
        .rememberMeParameter("rememberme") // "记住我"的参数名
        .tokenValiditySeconds(200) // Token有效期（秒）
        .tokenRepository(tokenRepository()) // (可选) 使用数据库持久化Token
        .and()
    .csrf().disable(); // 临时关闭CSRF，便于测试。生产环境不建议。
}

// (可选) 配置基于数据库的"记住我"功能
@Autowired
private DataSource dataSource;

@Bean
public JdbcTokenRepositoryImpl tokenRepository() {
    JdbcTokenRepositoryImpl jr = new JdbcTokenRepositoryImpl();
    jr.setDataSource(dataSource);
    // jr.setCreateTableOnStartup(true); // 首次运行时可设为true自动创建表
    return jr;
}
```
* **登录页HTML**: 需要创建一个`/userLogin`对应的`login.html`，表单的`action`应为`/login`（或自定义的`loginProcessingUrl`），`method`为`post`，输入框的`name`属性与配置的参数名一致。
* **CSRF**: Spring Security默认开启CSRF防护。所有修改状态的请求（POST, PUT, DELETE）都需要携带一个CSRF Token。在Thymeleaf表单中，可以通过添加一个隐藏输入框来自动包含Token：`<input type="hidden" th:name="${_csrf.parameterName}" th:value="${_csrf.token}"/>`。

## 7.6 Security 与前端页面集成

**定理1**: 通过引入`thymeleaf-extras-springsecurity5`依赖，可以在Thymeleaf模板中使用Spring Security提供的特定标签和表达式，实现前端页面的动态内容展示和权限控制。

> 这相当于给了前端页面“火眼金睛”，让它能够识别当前用户的身份和权限，并据此决定显示或隐藏某些按钮、链接或信息。

**例题1**: 在前端页面根据用户是否登录、拥有何种角色来显示不同内容。
**解**:
**步骤1: 添加依赖**
在`pom.xml`中加入：
```xml
<dependency>
    <groupId>org.thymeleaf.extras</groupId>
    <artifactId>thymeleaf-extras-springsecurity5</artifactId>
</dependency>
```

**步骤2: 在HTML中引入命名空间**
在`<html>`标签中添加`xmlns:sec="http://www.thymeleaf.org/thymeleaf-extras-springsecurity5"`。

**步骤3: 使用Security标签和表达式**
```html
<html xmlns:th="http://www.thymeleaf.org"
      xmlns:sec="http://www.thymeleaf.org/thymeleaf-extras-springsecurity5">

<body>
    <!-- 1. 判断是否认证（登录） -->
    <div sec:authorize="isAuthenticated()">
        <p>欢迎您, <span sec:authentication="name"></span>!</p>
        <form th:action="@{/mylogout}" method="post">
            <input type="submit" value="注销"/>
        </form>
    </div>
    <div sec:authorize="!isAuthenticated()">
        <p><a th:href="@{/userLogin}">请登录</a></p>
    </div>

    <!-- 2. 判断角色 -->
    <div sec:authorize="hasRole('vip')">
        <p>尊敬的VIP用户，您好！</p>
    </div>
    <div sec:authorize="hasRole('common') and !hasRole('vip')">
        <p>普通用户，您好！</p>
    </div>

    <!-- 3. 获取用户信息 -->
    <p>当前用户名: <span sec:authentication="principal.username"></span></p>
    <p>当前用户权限: <span sec:authentication="principal.authorities"></span></p>
</body>
</html>
```
* `sec:authorize="..."`: 强大的权限判断属性，内容为SpEL表达式。
* `sec:authentication="..."`: 用于获取当前`Authentication`对象的属性。
