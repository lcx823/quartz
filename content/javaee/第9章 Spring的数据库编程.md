---
share: true
---


# 第9章 Spring的数据库编程

## 9.1 Spring JDBC

### 9.1.1 JDBCTemplate概述

**JDBCTemplate** 是 Spring 框架提供的 JDBC 模板类。它简化了传统 JDBC 开发中的繁琐步骤（如获取连接、执行 SQL、处理异常、释放资源等），让开发人员可以将更多精力投入到业务逻辑中。

**核心功能**：
*   **DataSource**：`JdbcTemplate` 继承自抽象类 `JdbcAccessor`。`JdbcAccessor` 提供了访问数据库时使用的公共属性 `DataSource`。`DataSource` 的主要功能是获取数据库连接，并提供连接池和分布式事务的支持。
*   **SQLExceptionTranslator**：负责对 `SQLException` 异常进行转译工作。

### 9.1.2 Spring JDBC的配置

Spring JDBC 的核心功能封装在以下 4 个包中：
*   **core (核心包)**：包含 JDBC 核心功能，如 `JdbcTemplate` 类。
*   **dataSource (数据源包)**：包含访问数据源的工具类，支持在容器外测试 JDBC 代码。
*   **object (对象包)**：支持以面向对象的方式访问数据库。
*   **support (支持包)**：包含 core 和 object 包的支持类，如异常转换功能的 `SQLException` 类。

**配置示例 (applicationContext.xml)**：

```xml
<!-- 1. 配置数据源 -->
<bean id="dataSource" class="org.springframework.jdbc.datasource.DriverManagerDataSource">
    <property name="driverClassName" value="com.mysql.jdbc.Driver"/>
    <property name="url" value="jdbc:mysql://localhost:3306/spring"/>
    <property name="username" value="root"/>
    <property name="password" value="root"/>
</bean>

<!-- 2. 配置 JDBC 模板 -->
<bean id="jdbcTemplate" class="org.springframework.jdbc.core.JdbcTemplate">
    <property name="dataSource" ref="dataSource"/>
</bean>

<!-- 3. 配置注入类 (示例) -->
<bean id="accountDao" class="com.itheima.AccountDaoImpl">
    <property name="jdbcTemplate" ref="jdbcTemplate"/>
</bean>
```

> **注意**：`dataSource` 属性值设定要求：
> *   `driverClassName`：驱动类名，需对应驱动 JAR 包中的 Driver 类。
> *   `url`：如果数据库不在本地，需将 `localhost` 替换为主机 IP；若修改了默认端口（3306），需加上端口号。
> *   `username`/`password`：需与数据库设置保持一致。

## 9.2 JDBCTemplate的常用方法

### 9.2.1 execute() 方法
**execute()** 方法主要用于执行 DDL (数据定义语言) 语句，例如创建表、修改表结构等。

**语法**：
```java
jdbcTemplate.execute("SQL 语句");
```

### 9.2.2 update() 方法
**update()** 方法用于执行 DML (数据操作语言) 语句，主要包括 **增 (INSERT)**、**删 (DELETE)**、**改 (UPDATE)** 操作。

**常用重载方法**：
| 方法 | 说明 |
| :--- | :--- |
| `int update(String sql)` | 直接执行 SQL 语句，返回受影响的行数。 |
| `int update(String sql, Object... args)` | (最常用) 执行带占位符 `?` 的 SQL 语句，`args` 数组按顺序替换占位符，返回受影响的行数。 |

**示例**：
```java
String sql = "insert into account(username,balance) values(?,?)";
Object[] params = new Object[]{"tom", 1000.00};
int rows = jdbcTemplate.update(sql, params);
```

### 9.2.3 query() 方法
**query()** 方法用于执行 DQL (数据查询语言) 语句。

**常用查询方法**：
| 方法 | 说明 |
| :--- | :--- |
| `queryForObject(String sql, RowMapper<T> rowMapper, Object... args)` | 查询**单行**记录，并将结果映射为 Java 对象。 |
| `query(String sql, RowMapper<T> rowMapper, Object... args)` | 查询**多行**记录，并将结果映射为 Java 对象的集合 (`List<T>`)。 |
| `queryForList(...)` | 返回多行数据，结果为 `List` 类型。 |

**RowMapper 的使用**：
通常使用 `BeanPropertyRowMapper` 自动将结果集中的列映射到 Java Bean 的属性。
```java
// 查询单行
String sql = "select * from account where id = ?";
RowMapper<Account> rowMapper = new BeanPropertyRowMapper<>(Account.class);
Account account = jdbcTemplate.queryForObject(sql, rowMapper, 1);

// 查询多行
String sqlAll = "select * from account";
List<Account> list = jdbcTemplate.query(sqlAll, rowMapper);
```

## 9.3 Spring事务管理概述

### 9.3.1 事务管理的核心接口
Spring 的事务管理依赖于 `spring-tx` 包中的三个核心接口：

1.  **PlatformTransactionManager**：事务管理器接口，负责事务的管理（提交、回滚）。
    *   `getTransaction(TransactionDefinition definition)`: 获取事务状态。
    *   `commit(TransactionStatus status)`: 提交事务。
    *   `rollback(TransactionStatus status)`: 回滚事务。
2.  **TransactionDefinition**：定义事务的属性（隔离级别、传播行为、超时时间、是否只读）。
3.  **TransactionStatus**：表示事务的状态（是否新事务、是否已完成等）。

**事务传播行为**：
指处于不同事务中的方法相互调用时，事务如何维护。
*   `PROPAGATION_REQUIRED` (默认)：如果当前存在事务，则加入该事务；如果不存在，则新建一个事务。
*   `PROPAGATION_REQUIRES_NEW`：新建事务，如果当前存在事务，把当前事务挂起。

**隔离级别**：
*   `ISOLATION_DEFAULT`：使用数据库默认隔离级别。
*   `ISOLATION_READ_COMMITTED`：读已提交（Oracle 默认）。
*   `ISOLATION_REPEATABLE_READ`：可重复读（MySQL 默认）。

### 9.3.2 事务管理的方式
1.  **编程式事务管理**：在代码中硬编码事务逻辑（开始、提交、回滚），灵活性高但侵入性强，**不推荐**。
2.  **声明式事务管理**：通过 AOP 技术实现，将事务管理作为“切面”植入业务代码。配置简单，**推荐使用**。

## 9.4 声明式事务管理

### 9.4.1 基于 XML 方式的声明式事务
通过配置文件实现，无需修改源代码。

**配置步骤**：
1.  **配置事务管理器**：
    ```xml
    <bean id="transactionManager" class="org.springframework.jdbc.datasource.DataSourceTransactionManager">
        <property name="dataSource" ref="dataSource"/>
    </bean>
    ```
2.  **配置事务通知 (`<tx:advice>`)**：
    ```xml
    <tx:advice id="txAdvice" transaction-manager="transactionManager">
        <tx:attributes>
            <tx:method name="*" propagation="REQUIRED" isolation="DEFAULT" read-only="false"/>
        </tx:attributes>
    </tx:advice>
    ```
3.  **配置 AOP 切面 (`<aop:config>`)**：
    ```xml
    <aop:config>
        <aop:pointcut expression="execution(* com.itheima.*.*(..))" id="txPointCut"/>
        <aop:advisor advice-ref="txAdvice" pointcut-ref="txPointCut"/>
    </aop:config>
    ```

### 9.4.2 基于注解方式的声明式事务
通过 `@Transactional` 注解实现，更加简洁。

**配置步骤**：
1.  **配置事务管理器**（同 XML 方式）。
2.  **开启注解驱动**：
    ```xml
    <tx:annotation-driven transaction-manager="transactionManager"/>
    ```
3.  **在代码中使用注解**：
    在类或方法上添加 `@Transactional` 注解。
    ```java
    @Transactional(propagation = Propagation.REQUIRED, isolation = Isolation.DEFAULT, readOnly = false)
    public void transfer(String outUser, String inUser, Double money) {
        // ...转账业务逻辑
    }
    ```

## 9.5 案例：实现用户登录

### 需求
用户输入用户名和密码，若正确显示所属班级，若失败显示登录失败。
涉及数据库：`student` 表 (id, username, password, course)。

### 实现流程
1.  **创建数据库表** `student`。
2.  **编写实体类** `Student`。
3.  **编写配置文件** `applicationContext-student.xml` (配置数据源、JdbcTemplate、事务等)。
4.  **编写 DAO 层**：
    *   接口 `StudentDao`：定义 `findAllStudent()` 方法。
    *   实现类 `StudentDaoImpl`：使用 `JdbcTemplate` 查询数据库。
5.  **编写 Controller 层**：
    *   `StudentController`：获取用户输入，调用 DAO 层查询，验证登录逻辑。
    *   验证逻辑：遍历查询结果，比对输入的用户名和密码，匹配成功则输出班级信息。