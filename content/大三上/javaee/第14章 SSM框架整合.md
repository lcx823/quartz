---
share: true
---
![[./assets/第14章 SSM框架整合/file-20260111150357772.png|file-20260111150357772.png]]

# 第14章 SSM框架整合

## 14.1 常用方式整合SSM框架

### 14.1.1 整合思路

SSM框架即 **Spring + Spring MVC + MyBatis**，是Java EE开发的主流框架组合。

**三层架构分工**：
1.  **表现层 (Web层)**：由 **Spring MVC** 负责。管理Handler，接收请求，响应结果。
2.  **业务逻辑层 (Service层)**：由 **Spring** 负责。管理事务，管理Service对象。
3.  **数据持久层 (Dao层)**：由 **MyBatis** 负责。与数据库交互。

**整合核心点**：
*   **Spring整合MyBatis**：将 `SqlSessionFactory` 和 `Mapper` 对象交由 Spring 容器管理。配置数据源。
*   **Spring整合Spring MVC**：Spring MVC 是 Spring 的子容器，只需在项目启动时分别加载各自的配置。

**整合大致流程**：
1.  **搭建基础结构**：创建数据库、Maven Web项目、实体类、三层架构的包结构。
2.  **整合Spring和MyBatis**：配置 `applicationContext.xml` (或分拆为 `application-dao.xml`, `application-service.xml`)，配置数据源、事务、MyBatis整合。
3.  **整合Spring和Spring MVC**：配置 `spring-mvc.xml` (包扫描、注解驱动、视图解析器)，配置 `web.xml` (加载Spring监听器、配置前端控制器)。

### 14.1.2 项目基础结构搭建

#### STEP 01: 搭建数据库
创建数据库 `ssm` 和表 `tb_book`。
```sql
CREATE DATABASE ssm;
USE ssm;
CREATE TABLE `tb_book` ( 
 `id` int(11) ,
 `name` varchar(32) ,
 `press` varchar(32) ,
 `author` varchar(32) 
); 
```

#### STEP 02: 引入依赖 (pom.xml)
需要引入的依赖主要包括：
*   **Spring**：`spring-context`, `spring-tx`, `spring-jdbc`, `spring-test`, `spring-webmvc`。
*   **MyBatis**：`mybatis`。
*   **整合包**：`mybatis-spring`。
*   **数据源**：`druid` (或 c3p0, dbcp 等)。
*   **数据库驱动**：`mysql-connector-java`。
*   **Web相关**：`jsp-api`, `servlet-api`。
*   **测试**：`junit`。

#### STEP 03: 创建实体类
创建 `Book` 类。

#### STEP 04: 创建三层架构组件
1.  **Dao层**：创建 `BookMapper` 接口和 `BookMapper.xml` 映射文件。
2.  **Service层**：创建 `BookService` 接口和 `BookServiceImpl` 实现类。使用 `@Service` 注解，注入 `BookMapper`。
3.  **Controller层**：创建 `BookController` 类。使用 `@Controller` 注解，注入 `BookService`。

### 14.1.3 Spring和MyBatis整合

**核心配置文件**：`application-service.xml` (Spring配置) 和 `application-dao.xml` (MyBatis整合配置，或统一在 `applicationContext.xml` 中)。

1.  **Spring配置 (Service层)**：
    开启注解扫描，扫描 Service 层。
    ```xml
    <context:component-scan base-package="com.itheima.service"/>
    ```

2.  **MyBatis整合配置 (Dao层)**：
    *   加载 `jdbc.properties`。
    *   配置数据源 (`DataSource`)。
    *   配置 `SqlSessionFactoryBean`，注入数据源。
    *   配置 `MapperScannerConfigurer`，扫描 Mapper 接口。

### 14.1.4 Spring和Spring MVC整合

**核心配置文件**：`spring-mvc.xml` 和 `web.xml`。

1.  **web.xml 配置**：
    *   配置 Spring 监听器 `ContextLoaderListener`，加载 Spring 配置文件。
    *   配置 Spring MVC 前端控制器 `DispatcherServlet`，加载 Spring MVC 配置文件。
    ```xml
    <!-- 加载Spring配置 -->
    <context-param>
        <param-name>contextConfigLocation</param-name>
        <param-value>classpath:application-*.xml</param-value>
    </context-param>
    <listener>
        <listener-class>org.springframework.web.context.ContextLoaderListener</listener-class>
    </listener>

    <!-- 配置Spring MVC前端控制器 -->
    <servlet>
        <servlet-name>DispatcherServlet</servlet-name>
        <servlet-class>org.springframework.web.servlet.DispatcherServlet</servlet-class>
        <init-param>
            <param-name>contextConfigLocation</param-name>
            <param-value>classpath:spring-mvc.xml</param-value>
        </init-param>
        <load-on-startup>1</load-on-startup>
    </servlet>
    <servlet-mapping>
        <servlet-name>DispatcherServlet</servlet-name>
        <url-pattern>/</url-pattern>
    </servlet-mapping>
    ```

2.  **spring-mvc.xml 配置**：
    *   开启注解扫描，扫描 Controller 层。
    *   开启注解驱动 `<mvc:annotation-driven/>`。
    *   配置视图解析器 `InternalResourceViewResolver`。

## 14.2 纯注解方式整合SSM框架

使用配置类替代 XML 配置文件。

### 14.2.1 整合思路 (配置类对应关系)

| XML 配置文件 | 替代配置类 | 功能描述 |
| :--- | :--- | :--- |
| `application-dao.xml` | **`JdbcConfig`** | 1. 读取 `jdbc.properties`<br>2. 定义 `DataSource` Bean<br>3. 定义 `PlatformTransactionManager` (事务管理) |
| | **`MyBatisConfig`** | 1. 定义 `SqlSessionFactoryBean` Bean<br>2. 扫描 Mapper 接口 (`@MapperScan`) |
| `application-service.xml` | **`SpringConfig`** | 1. `@Configuration` 标识配置类<br>2. `@ComponentScan` 扫描 Service 包<br>3. `@Import` 导入 `JdbcConfig` 和 `MyBatisConfig` |
| `spring-mvc.xml` | **`SpringMvcConfig`** | 1. `@ComponentScan` 扫描 Controller 包<br>2. `@EnableWebMvc` 开启注解驱动 |
| `web.xml` | **`ServletContainersInitConfig`** | 继承 `AbstractAnnotationConfigDispatcherServletInitializer`，加载 Spring 和 Spring MVC 的配置类，配置 DispatcherServlet 映射路径。 |

### 14.2.2 核心配置类代码示例

#### 1. JdbcConfig
```java
@PropertySource("classpath:jdbc.properties")
public class JdbcConfig {
    @Value("${jdbc.driverClassName}") private String driver;
    // ... 其他属性
    
    @Bean
    public DataSource dataSource() {
        DruidDataSource dataSource = new DruidDataSource();
        dataSource.setDriverClassName(driver);
        // ... 设置其他属性
        return dataSource;
    }
}
```

#### 2. MyBatisConfig
```java
public class MyBatisConfig {
    @Bean
    public SqlSessionFactoryBean sqlSessionFactory(DataSource dataSource) {
        SqlSessionFactoryBean factoryBean = new SqlSessionFactoryBean();
        factoryBean.setDataSource(dataSource);
        return factoryBean;
    }
    // 扫描 Mapper 接口，通常使用 @MapperScan 注解在类上，或者定义 MapperScannerConfigurer Bean
}
```

#### 3. SpringConfig (主配置类)
```java
@Configuration
@ComponentScan("com.itheima.service")
@Import({JdbcConfig.class, MyBatisConfig.class})
public class SpringConfig {
}
```

#### 4. SpringMvcConfig
```java
@Configuration
@ComponentScan("com.itheima.controller")
@EnableWebMvc // 开启MVC注解驱动
public class SpringMvcConfig {
}
```

#### 5. ServletContainersInitConfig (替代 web.xml)
```java
public class ServletContainersInitConfig extends AbstractAnnotationConfigDispatcherServletInitializer {
    // 加载 Spring 配置类
    protected Class<?>[] getRootConfigClasses() {
        return new Class[]{SpringConfig.class};
    }
    // 加载 Spring MVC 配置类
    protected Class<?>[] getServletConfigClasses() {
        return new Class[]{SpringMvcConfig.class};
    }
    // 配置拦截路径
    protected String[] getServletMappings() {
        return new String[]{"/"};
    }
}
```