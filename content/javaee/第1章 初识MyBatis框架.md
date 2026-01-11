---
share: true
---

# 第1章 初识MyBatis框架

## 1.1 初识框架

### 1.1.1 框架概述
**框架(Framework)** 指的是在建造房屋前期构建的建筑骨架。在编程领域，框架就是应用程序的骨架，开发人员可以在这个骨架上加入自己的东西，搭建出符合自己需求的应用系统。

> 框架就像是盖房子时的“钢筋混凝土结构”（梁+柱子+承重墙）。开发人员不需要从零开始造砖头，而是直接在这个结构中装修不同的房间（实现业务逻辑），比如健身房、商场或酒店。

**软件框架** 是一种通用的、可复用的软件环境，它提供特定的功能，促进软件应用、产品和解决方案的开发工作。软件框架会包含支撑程序、编译器、代码、库、工具集以及 API，它把所有这些部件汇集在一起，以支持项目或系统的开发。

### 1.1.2 框架的优势
在早期 Java EE 开发（JSP + Servlet）中存在以下弊端：
1.  **软件应用和系统可维护性差**：分层不清晰，业务逻辑无法分离。
2.  **代码重用性低**：每次开发都需要从头开始，增加出错风险。

使用框架的优势：
1.  **提高开发效率**：通用的基础工作（事务处理、安全性、数据流控制）交给框架，程序员专注于业务逻辑。
2.  **提高代码规范性和可维护性**：成熟的框架有严格的代码规范，保证团队开发风格统一。
3.  **提高软件性能**：减少冗余代码。
    *   **Spring**：通过 IoC 控制对象依赖，解耦。
    *   **MyBatis**：提供 XML 标签支持动态 SQL，减少大量 SQL 编写。

### 1.1.3 当前主流框架
| 框架名称 | 描述 |
| :--- | :--- |
| **Spring** | 一个开源框架，主要优势是**分层架构**。提供完善的开发环境，为 POJO (Plain Ordinary Java Object) 提供企业级服务。 |
| **Spring MVC** | 一个 Web 开发框架，可理解为 Servlet。在 MVC 模式中作为**控制器 (Controller)**，实现模型与视图的数据交互。结构清晰，松耦合，可插拔。 |
| **MyBatis** | 一个优秀的**持久层框架**。Apache 开源项目 iBatis 迁移而来。它在实体类和 SQL 语句之间建立映射关系，是一种半自动化的 ORM 实现。性能优越，简单易学。 |
| **Spring Boot** | 基于 Spring 开发的全新框架，旨在**简化 Spring 的配置**，使用户能够构建**独立运行**的程序。集成了大量第三方类库（如 Jackson, JDBC, Redis），只需少量配置。 |
| **Spring Cloud** | 一系列框架的**有序集合**，为构建**微服务架构**提供完整解决方案。利用 Spring Boot 简化了分布式系统开发（配置管理、服务发现、控制总线等）。 |

## 1.2 MyBatis介绍

### 1.2.1 传统JDBC的劣势
在未使用框架前，Java 程序通过 JDBC 访问数据库存在以下劣势：

1.  **资源浪费**：数据库连接创建、释放频繁，影响系统性能。
2.  **代码不易维护（SQL 硬编码）**：SQL 语句写在 Java 代码中，SQL 变动需修改代码，违反开闭原则。
3.  **参数设置硬编码**：`PreparedStatement` 向占位符传参存在硬编码，Where 条件变化会导致代码修改。
4.  **结果集解析硬编码**：对结果集解析（查询列名）存在硬编码，SQL 变化导致解析代码变化。

### 1.2.2 MyBatis概述
**MyBatis** 是一个支持普通 SQL 查询、存储过程以及高级映射的持久层框架，它消除了几乎所有的 JDBC 代码和参数的手动设置以及对结果集的检索，使用简单的 XML 或注解进行配置和原始映射，将接口和 Java 的 POJO 映射成数据库中的记录。

**ORM (Object/Relation Mapping)** 即对象关系映射。为了解决面向对象与关系型数据库中数据类型不匹配的技术。它通过描述 Java 对象与数据库表之间的映射关系，自动将 Java 应用程序中的对象持久化到关系型数据库的表中。

> 你可以把 ORM 看作是“翻译官”，它负责把 Java 里的“对象语言”翻译成数据库里的“表语言”，让两者可以无障碍交流。

#### MyBatis 解决 JDBC 编程劣势的方案

| JDBC 问题 | MyBatis 解决方案 |
| :--- | :--- |
| 数据库连接频繁创建释放 | 在 `SqlMapConfig.xml` 中配置数据连接池，使用**连接池**管理数据库连接。 |
| SQL 语句硬编码 | 将 SQL 语句配置在 MyBatis 的**映射文件**中，实现与 Java 代码的分离。 |
| 参数设置硬编码 | 自动将 Java 对象映射至 SQL 语句，通过 `Statement` 中的 `parameterType` 定义输入参数类型。 |
| 结果集解析硬编码 | 自动将 SQL 执行结果映射至 Java 对象，通过 `Statement` 中的 `resultType` 定义输出结果类型。 |

## 1.3 MyBatis环境搭建

搭建 MyBatis 开发环境主要分为以下 5 个步骤：

### 1. 创建工程
在 IntelliJ IDEA 中，创建名称为 `mybatistest` 的 Maven 工程。

### 2. 引入相关依赖
在 `pom.xml` 中导入 MySQL 驱动、JUnit 测试包、MyBatis 核心包。
> 注意：首次引入依赖需要联网，且需耐心等待 Maven 下载完成。

```xml
<dependencies>
    <!-- MySQL驱动 -->
    <dependency>
        <groupId>mysql</groupId>
        <artifactId>mysql-connector-java</artifactId>
        <version>8.0.11</version>
    </dependency>
    <!-- 其他依赖省略 -->
    ...
</dependencies>
```

### 3. 数据库准备
在 MySQL 中创建数据库 `mybatis`。
```sql
create database mybatis;
```

### 4. 编写数据库连接信息配置文件
在 `src/main/resources` 下创建 `db.properties`。
```properties
mysql.driver=com.mysql.cj.jdbc.Driver
mysql.url=jdbc:mysql://localhost:3306/mybatis?serverTimezone=UTC&characterEncoding=utf8&useUnicode=true&useSSL=false
mysql.username=root
mysql.password=root
```

### 5. 编写核心配置文件和映射文件
在 `src/main/resources` 下创建核心配置文件 `mybatis-config.xml`。
```xml
<configuration>
    <!-- 引入数据库配置文件 -->
    <properties resource="db.properties"/>
    <environments default="development">
        <environment id="development">
            <!-- 事务管理器 -->
            <transactionManager type="JDBC"/>
            <!-- 数据源连接池 -->
            <dataSource type="POOLED">
                <property name="driver" value="${mysql.driver}" />
                <property name="url" value="${mysql.url}" />
                <property name="username" value="${mysql.username}" />
                <property name="password" value="${mysql.password}" />
            </dataSource>
        </environment>
    </environments>
</configuration>
```

## 1.4 MyBatis入门程序

本节演示一个根据 id 查询用户信息的入门程序。

### STEP 01: 数据准备
在 `mybatis` 数据库中创建 `users` 表并插入数据。
```sql
use mybatis;
create table users(
    uid int primary key auto_increment,
    uname varchar(20) not null,
    uage int not null
);
insert into users(uid,uname,uage) values(null,'张三',20),(null,'李四',18);
```

### STEP 02: 创建 POJO 实体
在 `com.itheima.pojo` 包下创建 `User` 类。
```java
package com.itheima.pojo;
public class User {
    private int uid;       // 用户id
    private String uname;  // 用户姓名
    private int uage;      // 用户年龄
    // 省略 getter/setter 方法
}
```

### STEP 03: 创建映射文件 UserMapper.xml
在 `src/main/resources/mapper` 目录下创建 `UserMapper.xml`。
```xml
<mapper namespace="com.itheima.pojo.User">
    <!-- 
       id: 接口中的方法名
       parameterType: 传入的参数类型
       resultType: 返回实体类对象，使用包.类名
    -->
    <select id="findById" parameterType="int" resultType="com.itheima.pojo.User">
        select * from users where uid = #{id}
    </select>
</mapper>
```

### STEP 04: 修改 mybatis-config.xml 配置文件
在核心配置文件中注册映射文件。
```xml
<!-- mapping文件路径配置 -->
<mappers>
    <mapper resource="mapper/UserMapper.xml"/>
</mappers>
```
> 如果一个项目有多个映射文件，需要在 `<mappers>` 元素下配置多个 `<mapper>` 元素指定路径。

### STEP 05: 编写测试类
在 `src/test/java` 下创建 `UserTest` 类进行测试。
```java
public class UserTest {
    public void userFindByIdTest() {
        String resources = "mybatis-config.xml";
        Reader reader = null;
        try {
            // 1. 读取核心配置文件
            reader = Resources.getResourceAsReader(resources);
        } catch (IOException e) {
            e.printStackTrace();
        }
        // 2. 创建 SqlSessionFactory
        SqlSessionFactory sqlMapper = new SqlSessionFactoryBuilder().build(reader);
        // 3. 打开 SqlSession
        SqlSession session = sqlMapper.openSession();
        // 4. 执行查询 (参数1: namespace.id, 参数2: 入参)
        User user = session.selectOne("findById", 1);
        System.out.println(user.getUname());
        // 5. 关闭资源
        session.close();
    }
}
```

## 1.5 MyBatis工作原理

MyBatis 框架在操作数据库时，大体经过了 8 个步骤：

1.  **读取核心配置文件**：读取 `mybatis-config.xml`，获取运行环境信息。
2.  **加载映射文件**：加载 `Mapper.xml`，获取操作数据库的 SQL 语句。
3.  **构造会话工厂**：通过配置信息构建 `SqlSessionFactory`。
4.  **创建会话对象**：由工厂创建 `SqlSession` 对象，该对象包含执行 SQL 的所有方法。
5.  **创建执行器**：`SqlSession` 底层定义了 `Executor` 接口。执行器根据参数动态生成 SQL，并负责查询缓存维护。
6.  **封装 SQL 信息**：执行器将待处理的 SQL 信息封装到 `MappedStatement` 对象中。
7.  **操作数据库**：根据动态生成的 SQL 访问数据库。
8.  **输出结果映射**：执行 SQL 后，通过 `MappedStatement` 将输出结果映射至 Java 对象。

> 简单理解工作流：读取配置 -> 创建工厂 -> 打开会话 -> 执行器干活 -> 封装 SQL -> 查库 -> 映射结果 -> 返回对象。