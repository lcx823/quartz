---
share: true
---
你好，这是根据你提供的第2章PDF课件整理的详细Obsidian Markdown笔记。

# 第2章 MyBatis的核心配置

## 2.1 MyBatis的核心对象

MyBatis 的主要核心对象包括 `SqlSessionFactoryBuilder`、`SqlSessionFactory` 和 `SqlSession`。

### 2.1.1 SqlSessionFactoryBuilder
**SqlSessionFactoryBuilder** 是利用 Builder 模式（构建者模式）来构建 `SqlSessionFactory` 的对象。

**主要作用**：
根据配置信息（XML 文件或 Java 代码）生成 `SqlSessionFactory` 对象。

**`build()` 方法的三种形式**：
由于参数 `environment` 和 `properties` 都可以为 null，构建方法主要分为以下三种输入源：
1.  **InputStream (字节流)**：封装 XML 形式的配置信息。
    ```java
    build(InputStream inputStream, String environment, Properties properties)
    ```
2.  **Reader (字符流)**：封装 XML 形式的配置信息。
    ```java
    build(Reader reader, String environment, Properties properties)
    ```
3.  **Configuration (类)**：直接传递配置类。
    ```java
    build(Configuration config)
    ```

**典型构建代码**：
```java
// 读取配置文件
InputStream inputStream = Resources.getResourceAsStream("mybatis-config.xml");
// 构建 SqlSessionFactory
SqlSessionFactory sqlSessionFactory = new SqlSessionFactoryBuilder().build(inputStream);
```

> **生命周期理解**：`SqlSessionFactoryBuilder` 就像是一个“建筑队”。房子（Factory）盖好后，建筑队就可以解散了。因此，它通常只存在于方法的局部作用域中，用完即丢。

### 2.1.2 SqlSessionFactory
**SqlSessionFactory** 是创建 `SqlSession` 的工厂。

**特点**：
*   **线程安全**：一旦被创建，在整个应用执行期间都存在。
*   **单例模式**：通常每一个数据库只创建一个 `SqlSessionFactory` 对象，建议使用单例模式，防止资源耗尽。

**`openSession()` 方法**：
用于创建 `SqlSession` 对象。

| 方法签名 | 描述 |
| :--- | :--- |
| `openSession()` | 开启一个事务 (默认)。 |
| `openSession(Boolean autoCommit)` | 参数 `autoCommit` 设置是否自动提交事务 (true 为自动提交)。 |
| `openSession(Connection connection)` | 使用自定义的数据库连接。 |
| `openSession(TransactionIsolationLevel level)` | 设置事务隔离级别。 |
| `openSession(ExecutorType execType)` | 指定执行器类型。 |

**ExecutorType (执行器类型) 的三个可选值**：
*   **ExecutorType.SIMPLE**：默认值。为每条语句创建一条新的预处理语句 (PreparedStatement)。
*   **ExecutorType.REUSE**：复用预处理语句。
*   **ExecutorType.BATCH**：批量执行所有更新语句。

> **生命周期理解**：`SqlSessionFactory` 就像是“工厂”。工厂一旦建立，就会一直运行直到公司倒闭（应用结束）。

### 2.1.3 SqlSession
**SqlSession** 是应用程序与持久层之间执行交互操作的**单线程对象**。

**作用**：
*   执行持久化操作（类似于 JDBC 的 `Connection`）。
*   其底层封装了 JDBC 连接。

**常用方法**：

| 分类 | 方法签名 | 描述 |
| :--- | :--- | :--- |
| **查询** | `<T> T selectOne(String statement)` | 查询单条记录。 |
| | `<E> List<E> selectList(String statement)` | 查询列表。 |
| | `void select(String statement, ResultHandler handler)` | 处理复杂结果集。 |
| **增删改** | `int insert(String statement)` | 插入数据，返回影响行数。 |
| | `int update(String statement)` | 更新数据，返回影响行数。 |
| | `int delete(String statement)` | 删除数据，返回影响行数。 |
| **事务控制** | `void commit()` | 提交事务。 |
| | `void rollback()` | 回滚事务。 |
| **其他** | `void close()` | **必须关闭**，释放资源。 |
| | `<T> T getMapper(Class<T> type)` | 获取 Mapper 接口的代理对象。 |

**使用范围与注意事项**：
*   **线程不安全**：不能共享，不能放在类的静态字段或单例对象中（如 Servlet 的 HttpSession）。
*   **作用域**：最好在一次请求或一个方法中使用。
*   **关闭资源**：使用完必须关闭，通常放在 `finally` 块中。

```java
SqlSession sqlSession = sqlSessionFactory.openSession();
try {
    // 执行操作
} finally {
    sqlSession.close(); // 确保关闭
}
```

## 2.2 MyBatis核心配置文件

MyBatis 的核心配置文件（通常命名为 `mybatis-config.xml`）包含了影响 MyBatis 行为的设置和属性。

### 2.2.1 配置文件的主要元素
`<configuration>` 是根元素。**注意：子元素必须按照以下顺序配置，否则解析报错！**

1.  `<properties>` (属性)
2.  `<settings>` (设置)
3.  `<typeAliases>` (类型别名)
4.  `<typeHandlers>` (类型处理器)
5.  `<objectFactory>` (对象工厂)
6.  `<plugins>` (插件)
7.  `<environments>` (环境配置)
    *   `<environment>`
        *   `<transactionManager>`
        *   `<dataSource>`
8.  `<databaseIdProvider>` (数据库厂商标识)
9.  `<mappers>` (映射器)

### 2.2.2 `<properties>` 元素
用于读取外部文件的配置信息（如数据库连接信息）。

**使用步骤**：
1.  创建 `db.properties` 文件：
    ```properties
    jdbc.driver=com.mysql.cj.jdbc.Driver
    jdbc.url=jdbc:mysql://localhost:3306/mybatis
    jdbc.username=root
    jdbc.password=root
    ```
    ````
2.  在核心配置文件中引入并使用 `${}` 占位符引用：
    ```xml
    <configuration>
        <properties resource="db.properties" />
        <environments default="dev">
            <environment id="dev">
                <dataSource type="POOLED">
                    <property name="driver" value="${jdbc.driver}" />
                    <property name="url" value="${jdbc.url}" />
                    ...
                </dataSource>
            </environment>
        </environments>
    </configuration>
    ```
    
### 2.2.3 `<settings>` 元素
用于改变 MyBatis 的运行时行为。

**常见配置参数**：

| 参数名 | 描述 |
| :--- | :--- |
| **cacheEnabled** | 是否开启全局缓存 (二级缓存)。 |
| **lazyLoadingEnabled** | 延迟加载的全局开关。 |
| **aggressiveLazyLoading** | 关联对象属性的延迟加载开关。 |
| **mapUnderscoreToCamelCase** | 是否开启自动驼峰命名规则映射 (如 `user_name` -> `userName`)。 |
| **logImpl** | 指定 MyBatis 所用日志的具体实现 (如 STDOUT_LOGGING)。 |

### 2.2.4 `<typeAliases>` 元素
用于为 Java 类型设置一个短的名字，减少全限定类名的冗余。

**配置方式**：
1.  **逐个配置**：
    ```xml
    <typeAliases>
        <typeAlias alias="User" type="com.itheima.pojo.User"/>
    </typeAliases>
    ```
2.  **包扫描 (推荐)**：自动将包下类的非限定类名作为别名 (不区分大小写)。
    ```xml
    <typeAliases>
        <package name="com.itheima.pojo"/>
    </typeAliases>
    ```

> MyBatis 已经为常见的 Java 类型（如 int, string, map, list）提供了内置的默认别名，例如 `_int` 对应 `int`，`string` 对应 `String`。

### 2.2.5 `<environments>` 元素
用于配置多套运行环境（开发、测试、生产）。必须通过 `default` 属性指定当前使用的环境 ID。

包含两个子元素：
1.  **`<transactionManager>` (事务管理器)**
    *   **JDBC**：直接使用 JDBC 的提交和回滚设置，依赖于数据源得到的连接。
    *   **MANAGED**：不提交或回滚，让容器（如 WebLogic, JBoss）来管理事务的生命周期。
2.  **`<dataSource>` (数据源)**
    *   **UNPOOLED**：每次请求打开和关闭连接，无连接池，性能低。
    *   **POOLED**：利用“池”的概念管理连接，响应快，适合并发 Web 应用。
    *   **JNDI**：在 EJB 或应用服务器容器中使用。

**POOLED 数据源额外属性**：
*   `poolMaximumActiveConnections`：最大活动连接数（默认 10）。
*   `poolMaximumIdleConnections`：最大空闲连接数。
*   `poolPingQuery`：侦测查询语句（如 `select 1`），用于检验连接是否正常。

### 2.2.6 `<mappers>` 元素
用于引入 MyBatis 映射文件。有 4 种引入方式：

1.  **类路径引入 (最常用)**：
    ```xml
    <mapper resource="com/itheima/mapper/UserMapper.xml"/>
    ```
2.  **本地文件路径引入**：
    ```xml
    <mapper url="file:///D:/.../UserMapper.xml"/>
    ```
3.  **接口类引入** (要求接口和 XML 同名且在同一包下)：
    ```xml
    <mapper class="com.itheima.mapper.UserMapper"/>
    ```
4.  **包名引入** (批量加载，要求接口和 XML 同名且在同一包下)：
    ```xml
    <package name="com.itheima.mapper"/>
    ```

## 2.3 MyBatis映射文件

映射文件（`Mapper.xml`）用于定义 SQL 语句和映射规则。

### 2.3.1 常用元素
*   `<mapper>`：根元素，`namespace` 属性必须唯一。
*   `<select>`：查询语句。
*   `<insert>`：插入语句。
*   `<update>`：更新语句。
*   `<delete>`：删除语句。
*   `<sql>`：定义可重用的 SQL 片段。
*   `<resultMap>`：定义结果集映射规则。
*   `<cache>`：配置给定命名空间的缓存。

**Namespace 的作用**：
1.  区分不同的 Mapper。
2.  绑定 DAO 接口（面向接口编程）：`namespace` 必须与接口全限定名一致，SQL id 必须与接口方法名一致。

### 2.3.2 `<select>` 元素
映射查询语句。

**常用属性**：
*   `id`：唯一标识，对应接口方法名。
*   `parameterType`：传入参数的类型。
*   `resultType`：返回结果的类型（自动映射）。
*   `resultMap`：引用外部定义的 resultMap（手动映射）。

> `resultType` 和 `resultMap` 不能同时使用。

### 2.3.3 `<insert>` 元素
映射插入语句。

**主键回填（获取生成的主键值）**：

1.  **支持自增主键的数据库 (MySQL, SQL Server)**：
    使用 `useGeneratedKeys="true"` 和 `keyProperty="id"`。
    ```xml
    <insert id="addUser" useGeneratedKeys="true" keyProperty="uid">
        insert into users...
    </insert>
    ```

2.  **不支持自增主键的数据库 (Oracle)**：
    使用 `<selectKey>` 子元素自定义生成主键。
    ```xml
    <insert id="addUser">
        <selectKey keyProperty="id" resultType="Integer" order="BEFORE">
            select seq_users.nextval from dual
        </selectKey>
        insert into users(id, name) values(#{id}, #{name})
    </insert>
    ```
    *   `order="BEFORE"`：先执行 selectKey 设置主键，再执行 insert。
    *   `order="AFTER"`：先执行 insert，再获取主键。

### 2.3.6 `<sql>` 元素
定义可重用的 SQL 代码片段。

```xml
<!-- 定义 -->
<sql id="userColumns"> id, username, password </sql>

<!-- 引用 -->
<select id="findAll">
    select <include refid="userColumns"/> from users
</select>
```

### 2.3.7 `<resultMap>` 元素
**功能最强大的元素**，用于解决数据库列名与 Java 对象属性名不一致的问题，或处理复杂的关联关系。

**示例**：
数据库列名 `user_id`，Java 属性名 `userId`。

```xml
<resultMap id="userResultMap" type="User">
    <!-- 主键映射 -->
    <id property="userId" column="user_id"/>
    <!-- 普通字段映射 -->
    <result property="userName" column="user_name"/>
</resultMap>

<select id="findAll" resultMap="userResultMap">
    select * from users
</select>
```

## 2.4 案例：员工管理系统

### 案例流程
1.  **项目搭建**：引入依赖 (MyBatis, MySQL, JUnit)。
2.  **数据准备**：创建数据库 `mybatis` 和表 `employee`。
3.  **POJO 类**：创建 `Employee` 类，属性包括 `id`, `name`, `age`, `position`。
4.  **编写映射文件**：`EmployeeMapper.xml`，实现 CRUD 的 SQL 语句。
5.  **配置核心文件**：`mybatis-config.xml`，配置数据源并引入 Mapper。
6.  **编写工具类**：`MyBatisUtils`。
    *   使用静态代码块 (`static {}`) 初始化 `SqlSessionFactory`，保证工厂单例且只加载一次配置文件，提高效率。
7.  **编写测试类**：`MyBatisTest`，调用 Utils 获取 Session 并执行 CRUD 操作。

### MyBatisUtils 工具类代码示例
```java
public class MyBatisUtils {
    private static SqlSessionFactory sqlSessionFactory = null;
    static {
        try {
            Reader reader = Resources.getResourceAsReader("mybatis-config.xml");
            sqlSessionFactory = new SqlSessionFactoryBuilder().build(reader);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
    
    public static SqlSession getSession() {
        return sqlSessionFactory.openSession();
    }
}
```