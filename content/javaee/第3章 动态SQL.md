---
share: true
---

# 第3章 动态SQL

## 3.1 动态SQL中的元素

### 动态SQL概述
**动态SQL** 是MyBatis的强大特性之一。在实际开发中，经常需要根据不同条件拼接SQL语句。MyBatis采用了基于 **OGNL (Object Graph Navigation Language)** 的表达式来完成动态SQL，避免了手动拼接字符串导致的空格遗漏、标点符号错误等问题，提高了SQL语句的复用性。

### 常用动态SQL元素
MyBatis提供了丰富的元素来组装SQL，主要包括以下几种：

| 元素 | 说明 |
| :--- | :--- |
| `<if>` | 判断语句，用于单条件判断。 |
| `<choose>` (包含 `<when>`, `<otherwise>`) | 相当于Java中的 `switch...case...default` 语句，用于多条件判断（从多个选项中选择一个执行）。 |
| `<where>` | 简化SQL语句中 `WHERE` 子句的条件判断，自动处理前缀 `AND`/`OR`。 |
| `<trim>` | 灵活地去除多余的关键字（如前缀或后缀）。 |
| `<set>` | 用于SQL语句的动态更新，自动处理后缀逗号。 |
| `<foreach>` | 循环语句，常用于 `IN` 语句等列举条件中。 |

## 3.2 条件查询操作

### 3.2.1 `<if>` 元素
`<if>` 是最常用的判断元素，用于实现简单的条件判断。如果 `test` 属性中的表达式为 `true`，则将元素体内的SQL拼接到主SQL中。

> 就像Java中的 `if` 语句，满足条件就执行（拼接）。

**示例场景**：
根据“客户姓名”或“年龄”组合查询。如果某个条件为空，则不作为查询依据。

```xml
<select id="findCustomer" parameterType="com.itheima.pojo.Customer" 
        resultType="com.itheima.pojo.Customer">
    select * from t_customer where 1=1
    <if test="username != null and username != ''">
        and username like concat('%', #{username}, '%')
    </if>
    <if test="jobs != null and jobs != ''">
        and jobs = #{jobs}
    </if>
</select>
```

### 3.2.2 `<choose>`、`<when>`、`<otherwise>` 元素
当需要从多个选项中**仅选择一个**去执行时（互斥条件），使用这组元素。

> 相当于Java中的 `switch...case...default` 或 `if...else if...else`。

**示例场景**：
1. 当“客户名称”不为空，仅根据名称查询；
2. 当“客户名称”为空，但“职业”不为空，仅根据职业查询;
3. 如果都为空，则查询所有电话不为空的客户。

```xml
<select id="findCustomerByChoose" parameterType="com.itheima.pojo.Customer" 
        resultType="com.itheima.pojo.Customer">
    select * from t_customer where 1=1
    <choose>
        <when test="username != null and username != ''">
            and username like concat('%', #{username}, '%')
        </when>
        <when test="jobs != null and jobs != ''">
            and jobs = #{jobs}
        </when>
        <otherwise>
            and phone is not null
        </otherwise>
    </choose>
</select>
```

### 3.2.3 `<where>`、`<trim>` 元素

#### `<where>` 元素
在编写SQL时，为了避免 `WHERE` 后面直接跟 `AND` 或 `OR` 导致语法错误（例如 `WHERE AND username...`），通常会加上 `WHERE 1=1`。
MyBatis 提供了 `<where>` 元素来优雅地解决这个问题。

**`<where>` 的作用**：
1. 自动添加 `WHERE` 关键字（如果内部有条件成立）。
2. 自动去除内容开头的多余的 `AND` 或 `OR`。

```xml
<select id="findCustomerByWhere" ...>
    select * from t_customer
    <where>
        <if test="username != null">
            and username like ...
        </if>
        <if test="jobs != null">
            and jobs = ...
        </if>
    </where>
</select>
```

#### `<trim>` 元素
`<trim>` 元素功能更强大，可以自定义需要添加或去除的前缀/后缀，直接替换 `<where>` 的功能。

**属性说明**：
| 属性 | 说明 |
| :--- | :--- |
| `prefix` | 指定给SQL语句增加的前缀（例如 `WHERE`）。 |
| `prefixOverrides` | 指定SQL语句中要去掉的前缀字符串（例如 `AND` 或 `OR`）。 |
| `suffix` | 指定给SQL语句增加的后缀。 |
| `suffixOverrides` | 指定SQL语句中要去掉的后缀字符串（例如 `,`）。 |

**使用 `<trim>` 实现 `<where>` 的效果**：
```xml
<trim prefix="where" prefixOverrides="and">
    <if test="..."> ... </if>
</trim>
```

## 3.3 更新操作

### `<set>` 元素
在执行 `UPDATE` 语句时，如果只想更新不为空的字段，使用 `<set>` 元素可以自动处理 `SET` 关键字和多余的逗号。

> 传统SQL更新需要更新所有字段，效率低。`<set>` 允许动态更新部分字段。

**`<set>` 的作用**：
1. 自动添加 `SET` 关键字。
2. 自动去除内容末尾多余的逗号 `,`。

**注意**：`<set>` 元素内包含的内容不能全为空，否则会报SQL语法错误。

**示例代码**：
```xml
<update id="updateCustomerBySet" parameterType="com.itheima.pojo.Customer">
    update t_customer
    <set>
        <if test="username != null">username=#{username},</if>
        <if test="jobs != null">jobs=#{jobs},</if>
        <if test="phone != null">phone=#{phone},</if>
    </set>
    where id=#{id}
</update>
```

### 使用 `<trim>` 元素更新
也可以使用 `<trim>` 来实现 `<set>` 的功能：
```xml
<trim prefix="set" suffixOverrides=",">
    ...
</trim>
```

## 3.4 复杂查询操作

### 3.4.1 `<foreach>` 元素中的属性
`<foreach>` 用于遍历集合，通常用于构建 `IN` 条件语句（如 `id IN (1, 2, 3)`）。

**主要属性**：
| 属性 | 说明 | 备注 |
| :--- | :--- | :--- |
| **item** | 集合中每一个元素进行迭代时的别名。 | **必选** |
| **collection** | 指定遍历参数的类型。 | **必选**，取值取决于传入参数类型。 |
| **open** | 循环开始时的符号。 | 常用 `(` |
| **close** | 循环结束时的符号。 | 常用 `)` |
| **separator** | 元素之间的分隔符。 | 常用 `,`，避免手动拼接逗号错误。 |
| `index` | 元素的序号（List/数组）或 Key（Map）。 | 可选 |

### `<collection>` 属性的取值规则
根据传入参数的不同，`collection` 属性的值有所区别：

1.  **List 类型**：若入参是单参数且为 List，属性值为 `list`。
2.  **数组 类型**：若入参是单参数且为数组，属性值为 `array`。
3.  **Map 类型**：若入参是多参数（封装在Map中），属性值为 **Map中对应的 Key**。

### 3.4.2 `<foreach>` 迭代数组
**场景**：从数据库中查询 ID 为 1, 2, 3 的客户信息。
**Java调用**：传入 `Integer[] roleIds = {2, 3};`
**XML配置**：
```xml
<select id="findByArray" parameterType="java.util.Arrays" ...>
    select * from t_customer where id in
    <foreach item="id" index="index" collection="array" 
             open="(" separator="," close=")">
        #{id}
    </foreach>
</select>
```

### 3.4.3 `<foreach>` 迭代 List
**Java调用**：传入 `List<Integer> ids = new ArrayList<>();`
**XML配置**：
```xml
<select id="findByList" parameterType="java.util.List" ...>
    select * from t_customer where id in
    <foreach item="id" index="index" collection="list" 
             open="(" separator="," close=")">
        #{id}
    </foreach>
</select>
```

### 3.4.4 `<foreach>` 迭代 Map
**场景**：同时根据职业（jobs）和 ID 列表查询。
**Java调用**：
```java
Map<String, Object> map = new HashMap<>();
map.put("id", ids);       // List<Integer>
map.put("jobs", "teacher");
session.selectList("...findByMap", map);
```
**XML配置**：
注意 `collection` 的值是 Map 中的 Key `"id"`。
```xml
<select id="findByMap" parameterType="java.util.Map" ...>
    select * from t_customer where jobs=#{jobs} and id in
    <foreach item="roleMap" collection="id" 
             open="(" separator="," close=")">
        #{roleMap}
    </foreach>
</select>
```

## 3.5 案例：学生信息查询系统

本案例综合运用动态SQL实现多条件查询和单条件查询。

**数据库表**: `dm_student` (id, name, major, sno)。

### 功能实现

1.  **多条件查询**：使用 `<choose>`
    *   逻辑：若姓名不为空，按姓名查；否则若专业不为空，按专业查；否则查询所有学号不为空的学生。
    ```xml
    <select id="findStudentByNameAndMajor" ...>
        select * from dm_student where 1=1
        <choose>
            <when test="name != null and name != ''">
                and name like concat('%', #{name}, '%')
            </when>
            <when test="major != null and major != ''">
                and major = #{major}
            </when>
            <otherwise>
                and sno is not null
            </otherwise>
        </choose>
    </select>
    ```

2.  **单条件查询**：使用 `<foreach>`
    *   逻辑：查询所有 id 值小于 5 的学生信息（构造 ID 列表 1,2,3,4）。
    ```xml
    <select id="findByList" parameterType="java.util.List" ...>
        select * from dm_student where id in
        <foreach item="id" collection="list" open="(" separator="," close=")">
            #{id}
        </foreach>
    </select>
    ```