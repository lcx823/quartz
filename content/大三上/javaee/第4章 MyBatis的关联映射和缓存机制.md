---
share: true
---

![[./assets/第4章 MyBatis的关联映射和缓存机制/file-20260111151208038.png|file-20260111151208038.png]]
# 第4章 MyBatis的关联映射和缓存机制

## 4.1 关联映射概述

### 4.1.1 关联关系类型
在关系型数据库和 Java 对象中，事物之间的关系主要分为以下三种：

1.  **一对一关系 (One-to-One)**
    *   **定义**：一个数据表中的一条记录最多可以和另一个数据表中的一条记录相关。
    *   **Java描述**：在 A 类中定义 B 类对象 $b$ 作为属性，在 B 类中定义 A 类对象 $a$ 作为属性。
    > 直观理解：学生与校园卡。一个学生只能拥有一张校园卡，一张校园卡只能属于一个学生。

2.  **一对多关系 (One-to-Many)**
    *   **定义**：主键数据表中的一条记录可以和另一个数据表的多条记录相关。
    *   **Java描述**：在 A 类中定义 B 类对象的**集合**（如 `List<B>`）作为属性；在 B 类中定义 A 类对象 $a$ 作为属性。
    > 直观理解：班级与学生。一个班级有多个学生，但一个学生只属于一个班级。

3.  **多对多关系 (Many-to-Many)**
    *   **定义**：一个数据表中的一条记录可以与另一个数据表任意数量的记录相关，反之亦然。通常通过**中间表**来维护。
    *   **Java描述**：在两个相互关联的类中，都定义与之关联的类的**集合**作为属性。
    > 直观理解：学生与教师。一名学生可以由多名教师授课，一名教师也可以为多名学生授课。

## 4.2 一对一查询

### 4.2.1 `<association>` 元素
**定义**：在 MyBatis 中，通过 `<association>` 元素来处理一对一关联关系。它是 `<resultMap>` 的子元素。

> `<association>` 就像是一个连接器，它告诉 MyBatis 如何将查询结果中的某些列填充到一个复杂的 Java 对象属性中。

| 属性 | 说明 |
| :--- | :--- |
| `property` | 指定映射到的实体类对象的属性名。 |
| `column` | 指定表中对应的字段（通常是外键）。 |
| `javaType` | 指定映射到实体对象的属性的类型（类的全限定名）。 |
| `select` | 用于指定引入**嵌套查询**的子 SQL 语句的 ID。 |
| `fetchType` | 指定是否启用延迟加载。可选值：$lazy$ (延迟加载) 和 $eager$ (立即加载)。 |

### 4.2.2 配置方式与实现步骤

#### 方式一：嵌套查询 (Nested Query)
通过执行另外一条 SQL 映射语句来返回预期的复杂类型。

**配置示例**：
```xml
<association property="card" column="card_id" 
             javaType="com.itheima.pojo.IdCard"
             select="com.itheima.mapper.IdCardMapper.findCodeById" />
```

#### 方式二：嵌套结果 (Nested Result)
使用嵌套结果映射来处理重复的联合结果的子集（通常使用 SQL 的多表连接查询）。

**配置示例**：
```xml
<association property="card" javaType="com.itheima.pojo.IdCard">
    <id property="id" column="card_id" />
    <result property="code" column="code" />
</association>
```

#### 延迟加载配置
在使用嵌套查询时，开启延迟加载可以降低运行消耗。
在 `mybatis-config.xml` 中配置：
```xml
<settings>
    <!-- 打开延迟加载的开关 -->
    <setting name="lazyLoadingEnabled" value="true" />
    <!-- 将积极加载改为消息加载，即按需加载 -->
    <setting name="aggressiveLazyLoading" value="false"/>
</settings>
```

## 4.3 一对多查询

### 4.3.1 `<collection>` 元素
**定义**：在 MyBatis 中，通过 `<collection>` 元素来处理一对多关联关系。其属性大部分与 `<association>` 相同，但有一个关键属性不同。

> `<collection>` 用于处理“集合”，比如一个用户手里的一堆订单列表。

**关键属性**：
*   **ofType**：与 `javaType` 对应，它用于指定实体类对象中**集合类属性所包含的元素的类型**（即 `List<T>` 中的 $T$）。

### 4.3.2 实现步骤示例 (用户与订单)

1.  **数据库**：`tb_user` (用户) 和 `tb_orders` (订单)，`tb_orders` 中有外键指向用户。
2.  **POJO**：`Users` 类中添加 `private List<Orders> ordersList;`。
3.  **Mapper XML**：
    ```xml
    <resultMap type="Users" id="UserWithOrdersResult">
        <id property="id" column="id"/>
        <result property="username" column="username"/>
        <!-- 一对多映射 -->
        <collection property="ordersList" ofType="Orders">
            <id property="id" column="orders_id"/>
            <result property="number" column="number"/>
        </collection>
    </resultMap>
    ```

## 4.4 多对多查询

### 4.4.1 实现原理
**定义**：在数据库中，多对多关系通过**中间表**维护。在 MyBatis 中，多对多其实是两个“一对多”关系的组合，处理方式与一对多类似，主要使用 `<collection>` 元素。

> 想象“订单”和“商品”。一个订单包含多个商品（一对多），一个商品属于多个订单（一对多）。MyBatis 查询时，通常是查询“订单及其关联的所有商品”。

### 4.4.2 实现步骤示例 (订单与商品)

1.  **数据库**：`tb_orders`，`tb_product`，以及中间表 `tb_ordersitem`。
2.  **POJO**：`Product` 类中包含 `List<Orders>`；`Orders` 类中包含 `List<Product>`。
3.  **Mapper XML (以查询订单关联商品为例)**：
    *   使用多表联合查询（JOIN 中间表和商品表）。
    *   配置 `<collection>` 映射商品列表。

    ```xml
    <resultMap type="Orders" id="OrdersWithProductResult">
        <id property="id" column="id" />
        <!-- 映射商品集合 -->
        <collection property="productList" column="id" ofType="Product" 
                    select="com.itheima.mapper.ProductMapper.findProductById" >
        </collection>
    </resultMap>
    ```

## 4.5 MyBatis 缓存机制

### 4.5.1 一级缓存 (Level 1 Cache)
**定义**：MyBatis 的一级缓存是 **SqlSession 级别**的缓存。

> 就像是个人的记事本。只要你（同一个 SqlSession）还在处理当前的事务，查过的数据就记下来，下次再查直接看记事本，不用去翻档案室（数据库）。

**工作原理**：
1.  用户发起查询，MyBatis 先在一级缓存中查找。
2.  如果命中，直接返回。
3.  如果未命中，查询数据库，将结果写入一级缓存并返回。
4.  **清空条件**：如果程序执行了插入 (`insert`)、更新 (`update`)、删除 (`delete`) 操作，MyBatis 会清空一级缓存，防止数据脏读。

### 4.5.2 二级缓存 (Level 2 Cache)
**定义**：MyBatis 的二级缓存是 **Mapper (Namespace) 级别**的缓存。

> 就像是团队的公告板。多个不同的 SqlSession（团队成员）只要访问的是同一个 Mapper（同一个业务领域），都可以共享这份缓存。

**开启步骤**：
1.  **全局开启**：在 `mybatis-config.xml` 中配置。
    ```xml
    <settings>
        <setting name="cacheEnabled" value="true" />
    </settings>
    ```
2.  **局部开启**：在具体的 Mapper XML 文件中添加 `<cache>` 标签。
    ```xml
    <mapper namespace="...">
        <cache /> 
    </mapper>
    ```

**`<cache>` 元素的属性**：

| 属性 | 说明 | 默认值/常用值 |
| :--- | :--- | :--- |
| `flushInterval` | 刷新间隔（毫秒）。 | 不设置（仅在调用语句时刷新） |
| `size` | 引用数目（缓存对象的数量）。 | 1024 |
| `readOnly` | 只读。$true$ (不能修改，性能高) / $false$ (可读写，安全)。 | false |
| `eviction` | 回收策略。 | **LRU** (最近最少使用) |

**回收策略 (Eviction Policies)**：
*   **LRU** (Least Recently Used): 移除最长时间不被使用的对象。
*   **FIFO** (First In First Out): 先进先出。
*   **SOFT**: 软引用策略 (基于垃圾回收状态)。
*   **WEAK**: 弱引用策略。

**缓存命中率 (Cache Hit Ratio)**：
$$
\text{Cache Hit Ratio} = \frac{\text{缓存命中次数}}{\text{总查询次数}}
$$
*   第一次查询：未命中，Ratio = 0。
*   第二次查询相同数据：命中，Ratio = 0.5 (1/2)。

## 4.6 案例：商品的类别

**场景**：
实现一个“商品类别”与“商品”的一对多查询。
*   表1：`category` (id, typename) - 商品类别。
*   表2：`product` (id, goodsname, price, typeid) - 商品，`typeid` 外键关联类别。

**核心配置 (CategoryMapper.xml)**：
```xml
<select id="findCategoryWithProduct" parameterType="Integer" resultMap="CategoryResult">
    SELECT c.*, p.id as pid, p.goodsname, p.price 
    FROM category c, product p 
    WHERE c.id = p.typeid AND c.id = #{id}
</select>

<resultMap type="Category" id="CategoryResult">
    <id property="id" column="id"/>
    <result property="typename" column="typename"/>
    <!-- 一对多集合映射 -->
    <collection property="productList" ofType="Product">
        <id property="id" column="pid"/>
        <result property="goodsname" column="goodsname"/>
        <result property="price" column="price"/>
    </collection>
</resultMap>
```