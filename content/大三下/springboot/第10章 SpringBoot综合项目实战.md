---
share: true
title: 第10章 SpringBoot综合项目实战
created: 2026-03-22
source: Cherry Studio
tags:
---


# 第10章 SpringBoot综合项目实战

## 10.1 & 10.2 系统概述与项目设计

### 系统功能与技术栈
**定理1**: 一个典型的Web项目（如博客系统）通常分为**前台**（面向普通用户）和**后台**（面向管理员）两部分。本项目采用前后端不分离的模式，技术栈核心为 **Spring Boot + MyBatis + Thymeleaf + Spring Security**，并结合 **Redis** 进行缓存管理。

> 从初学者的角度来看，这个项目就像一个完整的网站。前台是所有人都能看到的“店面”，展示文章、评论等。后台是只有店主才能进入的“仓库和办公室”，可以管理商品（文章）、查看销售数据（统计信息）等。我们用Spring Boot作为整个项目的骨架，MyBatis负责和数据库打交道，Thymeleaf负责把数据显示在网页上，Spring Security负责看门（安全认证），Redis则像一个高速缓存区，让热门数据拿得更快。

### 项目文件组织结构
* **`com.itheima.config`**: 存放项目的配置类，如MyBatis配置、Redis配置、Web MVC配置（拦截器）等。
* **`com.itheima.controller`**: 控制层，分为`admin`（后台）和`client`（前台）两个包，处理HTTP请求。
* **`com.itheima.dao`**: 数据访问层（Mapper接口），定义与数据库交互的方法。
* **`com.itheima.model.domain`**: 实体类（POJO），与数据库表一一对应。
* **`com.itheima.model.dto`**: 数据传输对象（DTO），用于封装响应数据或特定业务数据。
* **`com.itheima.service`**: 业务逻辑层，定义业务接口（如`IArticleService`）和实现类。
* **`com.itheima.utils`**: 工具类，存放如日期格式化、Markdown处理等通用工具。
* **`resources/`**:
 * `static/`: 存放CSS、JavaScript、图片等静态资源。
 * `templates/`: 存放Thymeleaf模板文件，也分为`admin`、`client`和`comm`（公共部分）。
 * `mapper/`: 存放MyBatis的XML映射文件。
 * `i18n/`: 存放国际化资源文件。
 * `application.yml`: 主配置文件。
 * `application-xxx.properties`: 不同环境（profile）的配置文件，如数据库、Redis、邮件等。

### 数据库设计
| 文章详情表 (t_article) | 类型 | 说明 |
| :--- | :--- | :--- |
| id | int | 主键，文章ID |
| title | varchar | 文章标题 |
| content | longtext | 文章内容（Markdown格式）|
| created | datetime | 创建时间 |
| modified | datetime | 修改时间 |
| categories | varchar | 文章分类 |
| tags | varchar | 文章标签 |
| allow_comment | tinyint | 是否允许评论 |
| thumbnail | varchar | 文章缩略图URL |

| 文章评论表 (t_comment) | 类型 | 说明 |
| :--- | :--- | :--- |
| id | int | 主键，评论ID |
| article_id | int | 关联的文章ID |
| created | datetime | 创建时间 |
| ip | varchar | 评论者IP |
| content | text | 评论内容 |
| status | varchar | 评论状态（如 approved） |
| author | varchar | 评论作者 |

| 文章统计表 (t_statistic) | 类型 | 说明 |
| :--- | :--- | :--- |
| id | int | 主键 |
| article_id | int | 关联的文章ID (唯一) |
| hits | int | 文章点击量 |
| comments_num | int | 文章评论量 |

| 用户信息表 (t_user) | 类型 | 说明 |
| :--- | :--- | :--- |
| id | int | 主键，用户ID |
| username | varchar | 用户名 |
| password | varchar | 加密后的密码 |
| email | varchar | 用户邮箱 |
| created | datetime | 创建时间 |
| valid | tinyint | 是否有效用户 |

*此外还有权限表 `t_authority` 和用户权限关联表 `t_user_authority` 用于实现Spring Security的权限管理。*

## 10.3 系统环境搭建

**定理1**: 一个结构良好的Spring Boot项目通过模块化的配置文件和清晰的依赖管理来构建。使用`spring.profiles.active`可以轻松切换不同的环境配置（如数据库、Redis），而将复杂的依赖（如MyBatis、Druid）交由Maven管理，可以保证项目的稳定和可维护性。

> 这就像搭乐高。`pom.xml`是你的零件清单，确保你拥有所有需要的积木。`application.yml`是总设计图，而`application-jdbc.properties`、`application-redis.properties`等是各个部分（如动力系统、灯光系统）的分区设计图。通过`spring.profiles.active`，你可以告诉总设计师“今天我们启用动力系统和灯光系统”，从而灵活地组合功能。

**例题1**: 搭建博客项目的基础环境。
**解**:
**步骤1: 创建项目并引入依赖**
创建一个Spring Boot项目，并在`pom.xml`中引入核心依赖：
* `spring-boot-starter-web`
* `spring-boot-starter-thymeleaf`
* `spring-boot-starter-security`
* `spring-boot-starter-data-redis`
* `spring-boot-starter-mail`
* `mybatis-spring-boot-starter`: 整合MyBatis
* `druid-spring-boot-starter`: 使用Druid数据源
* `pagehelper-spring-boot-starter`: MyBatis分页插件
* `mysql-connector-java`: MySQL驱动

**步骤2: 编写配置文件**
* 在`resources`目录下创建`application.yml`主配置文件：
```yaml
    server:
      port: 80
    spring:
      profiles:
        # 激活外部配置文件
        active: jdbc,redis,mail
      thymeleaf:
        cache: false # 开发时关闭缓存，方便调试
      messages:
        basename: i18n/logo # 配置国际化文件基础名
    
    mybatis:
      # 开启驼峰命名自动映射
      map-underscore-to-camel-case: true
      # 配置XML映射文件路径
      mapper-locations: classpath:mapper/*.xml
      # 配置实体类别名路径
      type-aliases-package: com.itheima.model.domain
    
    pagehelper:
      helper-dialect: mysql
      reasonable: true # 分页参数合理化
    ```
*   创建`application-jdbc.properties`, `application-redis.properties`, `application-mail.properties`并填入相应的连接信息。

**步骤3: 准备数据库和资源文件**
1.  在MySQL中创建`blog_system`数据库，并导入提供的`.sql`文件初始化表结构和数据。
2.  将项目所需的前端资源（CSS, JS, 图片）、Thymeleaf模板文件、MyBatis的XML文件等复制到`resources`目录下对应的位置。

## 10.4 前后台管理模块

### 文章分页展示与详情查看 (集成Redis缓存)
**定理2**: 在数据驱动的应用中，业务逻辑的核心是 "DAO -> Service -> Controller -> View" 的分层架构。对于读多写少的场景（如文章详情），应在Service层引入缓存（如Redis）来提升性能，其经典模式为：**先查缓存，缓存未命中则查数据库，然后将结果写入缓存**。

> `Service`层就像一个聪明的图书管理员。当有人要借阅一本书（查询文章详情）时，他会先在“热门图书展架”（Redis缓存）上找。如果找到了，直接递给读者，速度飞快。如果没找到，他才会去书库深处（数据库）查找，找到后，他会复印一份放在热门展架上，方便下一个人快速取阅。

**例题2**: 实现博客首页文章分页展示，以及带缓存的文章详情查看功能。
**解**:
**步骤1: 数据访问层 (DAO)**
*   创建`ArticleMapper.java`接口，使用`@Select`注解编写分页查询的SQL。
    ```java
    // ArticleMapper.java
    @Mapper
    public interface ArticleMapper {
        @Select("SELECT * FROM t_article ORDER BY id DESC")
        List<Article> selectArticleWithPage();
        
        @Select("SELECT * FROM t_article WHERE id=#{id}")
        Article selectArticleWithId(Integer id);
    }
    ```

**步骤2: 业务处理层 (Service)**
*   创建`IArticleService.java`接口和其实现类`ArticleServiceImpl.java`。
*   **分页查询**: 使用`PageHelper`插件简化分页。
    ```java
    // ArticleServiceImpl.java
    @Override
    public PageInfo<Article> selectArticleWithPage(Integer page, Integer count) {
        PageHelper.startPage(page, count);
        List<Article> articleList = articleMapper.selectArticleWithPage();
        return new PageInfo<>(articleList);
    }
    ```
*   **带缓存的详情查询**:
    ```java
    // ArticleServiceImpl.java
    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    @Override
    public Article selectArticleWithId(Integer id) {
        String key = "article_" + id;
        // 1. 先从Redis缓存中获取
        Object obj = redisTemplate.opsForValue().get(key);
        if (obj != null) {
            return (Article) obj;
        }
        // 2. 缓存未命中，查询数据库
        Article article = articleMapper.selectArticleWithId(id);
        if (article != null) {
            // 3. 将查询结果存入Redis
            redisTemplate.opsForValue().set(key, article);
        }
        return article;
    }
    ```

**步骤3: 请求处理层 (Controller)**
*   创建`IndexController.java`处理前端请求。
    ```java
    // IndexController.java
    @GetMapping(value = {"/", "/page/{p}"})
    public String index(HttpServletRequest request, @PathVariable(value="p", required=false) Integer p) {
        int page = (p == null || p <= 0) ? 1 : p;
        PageInfo<Article> articles = articleService.selectArticleWithPage(page, 5);
        request.setAttribute("articles", articles);
        // ... 查询热度文章等
        return "client/index";
    }

    @GetMapping(value = "/article/{id}")
    public String articleDetail(HttpServletRequest request, @PathVariable("id") Integer id) {
        Article article = articleService.selectArticleWithId(id);
        if (article != null) {
            // ... 查询评论、更新点击量等
            request.setAttribute("article", article);
            return "client/articleDetails";
        }
        return "comm/error_404";
    }
    ```

**步骤4: 视图层 (View)**
*   在`index.html`和`articleDetails.html`中使用Thymeleaf的`th:each`、`th:text`等属性将Controller传递过来的数据显示在页面上。

### 后台文章增删改查 (CRUD)
**定理3**: 后台管理功能的实现遵循标准的CRUD（Create, Read, Update, Delete）模式，并与Spring Security紧密集成以确保操作的安全性。对于修改状态的POST/PUT/DELETE请求，必须正确处理CSRF Token以防止跨站请求伪造攻击。

> 后台管理就是对数据的直接操作。`增`对应文章发布，`查`对应文章列表，`改`对应文章编辑，`删`对应文章删除。每个操作都是一条从“前端页面 -> Controller -> Service -> DAO”的完整链路。而Spring Security则是在进入Controller之前设置的关卡，确保只有授权用户才能执行这些敏感操作。

**例题3**: 实现后台文章的发布、修改和删除功能。
**解**:
**步骤1: 数据访问层 (DAO)**
在`ArticleMapper`和`StatisticMapper`中添加`@Insert`, `@Update`, `@Delete`注解的方法。

**步骤2: 业务处理层 (Service)**
*   **发布**: 在`ArticleServiceImpl`中实现`publish`方法。除了向`t_article`插入数据，还要向`t_statistic`表插入一条对应的统计记录。
*   **修改**: 实现`updateArticleWithId`方法。在更新数据库后，**必须删除Redis中对应的缓存**（`redisTemplate.delete("article_" + id)`)，以保证数据一致性。
*   **删除**: 实现`deleteArticleWithId`方法。需要事务性地删除`t_article`、`t_statistic`和`t_comment`中与该文章相关的所有记录，并删除Redis缓存。

**步骤3: 请求处理层 (Controller)**
*   创建`AdminController.java`处理后台请求。
    ```java
    // AdminController.java
    // 跳转到文章编辑/发布页面
    @GetMapping("/article/toEditPage")
    public String toEditPage() { return "back/article_edit"; }

    // 处理文章发布请求
    @PostMapping("/article/publish")
    @ResponseBody
    public ArticleResponseData publishArticle(Article article) {
        // ... 调用 service.publish(article) ...
    }

    // 跳转到修改页面，并携带文章数据
    @GetMapping("/article/{id}")
    public String toEditPageWithData(@PathVariable Integer id, HttpServletRequest request) {
        Article article = articleService.selectArticleWithId(id);
        request.setAttribute("contents", article);
        return "back/article_edit";
    }

    // 处理文章修改请求
    @PostMapping("/article/modify")
    @ResponseBody
    public ArticleResponseData modifyArticle(Article article) {
        // ... 调用 service.updateArticleWithId(article) ...
    }
    
    // 处理文章删除请求
    @PostMapping("/article/delete")
    @ResponseBody
    public ArticleResponseData deleteArticle(@RequestParam int id) {
        // ... 调用 service.deleteArticleWithId(id) ...
    }
    ```

**步骤4: 视图层 (View)**
*   在文章编辑页面`article_edit.html`的`<form>`中，必须包含一个隐藏的CSRF Token输入框，Thymeleaf可以自动生成：
    `<input type="hidden" th:name="${_csrf.parameterName}" th:value="${_csrf.token}"/>`
*   对于使用Ajax进行删除操作，需要从页面`<meta>`标签中获取CSRF Token，并将其设置在Ajax请求的Header中。

## 10.5 用户登录控制及定时邮件发送

### 用户登录控制
**定理4**: Spring Security允许通过自定义`WebSecurityConfigurerAdapter`来覆盖其默认行为，实现自定义登录页面、URL访问权限控制（授权）、用户认证逻辑等。

> 这相当于我们不再使用Spring Security提供的默认“保安亭”和“通用门禁卡”，而是建造了一个带有我们自己Logo的“安保中心”，并制定了详细的访问规则：哪些URL（如`/admin/**`）需要`ROLE_ADMIN`权限，哪些URL（如`/`首页）可以匿名访问，以及登录失败或成功后该去哪里。

**例题4**: 实现自定义登录页面和后台管理页面的访问控制。
**解**:
**步骤1: 请求处理层 (Controller)**
创建一个`LoginController`，仅用于跳转到自定义的登录页面。
```java
@Controller
public class LoginController {
 @GetMapping("/login")
 public String login() {
 return "comm/login"; // 返回自定义登录页面的视图名
 }
}
```

**步骤2: 实现前端页面功能 (View)**
创建`resources/templates/comm/login.html`。表单的`action`必须指向Spring Security默认处理登录的URL `/login`，并且方法为`post`。
```html
<form th:action="@{/login}" method="post">
 <!-- CSRF Token, th:action 会自动包含 -->
 <input type="text" name="username" placeholder="用户名"/>
 <input type="password" name="password" placeholder="密码"/>
 <button type="submit">登录</button>
</form>
```

**步骤3: 编写Security认证授权配置类**
创建`SecurityConfig.java`。
```java
@EnableWebSecurity
public class SecurityConfig extends WebSecurityConfigurerAdapter {

 // ... 注入DataSource

 // 配置认证规则 (用户从哪里来)
 @Override
 protected void configure(AuthenticationManagerBuilder auth) throws Exception {
 // 使用JDBC从数据库验证用户
 auth.jdbcAuthentication().dataSource(dataSource)
 .usersByUsernameQuery("select username, password, valid from t_user where username = ?")
 .authoritiesByUsernameQuery("select u.username, a.authority from t_user u, t_authority a, t_user_authority ua where u.id=ua.user_id and a.id=ua.authority_id and u.username = ?")
 .passwordEncoder(new BCryptPasswordEncoder());
 }

 // 配置授权规则 (URL权限、登录、退出等)
 @Override
 protected void configure(HttpSecurity http) throws Exception {
 http.authorizeRequests()
 .antMatchers("/admin/**").hasRole("ADMIN") // /admin/下的所有路径需要ADMIN角色
 .anyRequest().permitAll(); // 其他所有请求都允许访问

 http.formLogin()
 .loginPage("/login") // 指定自定义登录页面URL
 .defaultSuccessUrl("/admin"); // 登录成功后默认跳转到后台首页

 http.logout().logoutSuccessUrl("/"); // 退出成功后跳转到首页

 http.csrf().ignoringAntMatchers("/admin/upload"); // (可选)忽略特定路径的CSRF
 }
}
```

### 定时邮件发送
**定理5**: Spring Boot的定时任务（`@EnableScheduling` + `@Scheduled`）与邮件发送（`JavaMailSender`）可以轻松结合，实现自动化的、周期性的通知功能。

> 这就像给你的服务器设置一个“每月提醒事项”。`@EnableScheduling`是打开提醒功能，`@Scheduled(cron = "...")`是设置提醒的规则（例如，每月1号中午12点），提醒的内容就是“调用邮件发送服务，发送一封统计报告”。

**例题5**: 实现每月1号自动发送一封统计邮件。
**解**:
**步骤1: 创建邮件发送工具类**
创建一个简单的`MailUtils`，封装邮件发送逻辑。

**步骤2: 创建定时任务调度类**
```java
@Component
public class ScheduleTask {

 @Autowired
 private ISiteService siteService; // 假设用于获取统计数据
 @Autowired
 private MailUtils mailUtils;

 // 每月1日中午12点执行
 @Scheduled(cron = "0 0 12 1 * ?")
 public void sendEmail() {
 // 1. 获取统计数据
 long totalVisit = siteService.getTotalVisit();
 long totalComment = siteService.getTotalComment();

 // 2. 准备邮件内容
 String title = "博客月度统计报告";
 String content = "本月总访问量：" + totalVisit + "，总评论数：" + totalComment;

 // 3. 发送邮件
 mailUtils.sendSimpleEmail("admin@example.com", title, content);
 }
}
```
**步骤3: 开启基于注解的定时任务**
在主启动类上添加`@EnableScheduling`注解。
```java
@EnableScheduling
@SpringBootApplication
public class BlogSystemApplication {
 public static void main(String[] args) {
 SpringApplication.run(BlogSystemApplication.class, args);
 }
}
```
项目启动后，该任务将在每个月1号中午12点自动执行。
