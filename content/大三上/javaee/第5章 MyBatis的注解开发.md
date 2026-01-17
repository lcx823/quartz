---
share: true
---
![[./assets/第5章 MyBatis的注解开发/file-20260111144504408.png|file-20260111144504408.png]]

# 第5章 MyBatis的注解开发

MyBatis 提供了基于注解的配置方式，可以减少 XML 配置文件的编写，使代码更加简洁。本章主要介绍基于注解的单表增删改查、关联查询（一对一、一对多、多对多）以及综合案例。

## 5.1 基于注解的单表增删改查

MyBatis 提供了 `@Select`、`@Insert`、`@Update`、`@Delete` 等注解来实现 CRUD 操作。

### 5.1.1 `@Select` 注解
用于映射查询语句。

**语法示例**：
```java
public interface WorkerMapper {
    @Select("select * from tb_worker where id = #{id}")
    Worker selectWorker(int id);
}
```

**实现步骤**：
1.  **建表**：创建 `tb_worker` 表。
2.  **创建 POJO**：创建 `Worker` 类，属性与表字段对应。
3.  **编写 Mapper 接口**：在接口方法上使用 `@Select` 注解编写 SQL。
4.  **配置 Mapper**：在 `mybatis-config.xml` 中加载接口。
    ```xml
    <mapper class="com.itheima.dao.WorkerMapper"/>
    ```
5.  **测试**：获取 SqlSession，获取 Mapper 代理对象并执行方法。

### 5.1.2 `@Insert` 注解
用于映射插入语句。

**语法示例**：
```java
@Insert("insert into tb_worker(name,age,sex,worker_id) values(#{name},#{age},#{sex},#{worker_id})")
int insertWorker(Worker worker);
```

**注意**：方法参数为对象时，SQL 中使用 `#{属性名}` 获取值。

### 5.1.3 `@Update` 注解
用于映射更新语句。

**语法示例**：
```java
@Update("update tb_worker set name = #{name},age = #{age} where id = #{id}")
int updateWorker(Worker worker);
```

### 5.1.4 `@Delete` 注解
用于映射删除语句。

**语法示例**：
```java
@Delete("delete from tb_worker where id = #{id}")
int deleteWorker(int id);
```

### 5.1.5 `@Param` 注解
用于给 SQL 语句中的参数命名，特别是在方法有多个参数时使用。

**语法示例**：
```java
@Select("select * from tb_worker where id = #{param01} and name = #{param02}")
Worker selectWorkerByIdAndName(@Param("param01") int id, @Param("param02") String name);
```
> 当使用 `@Param` 注解后，SQL 中使用 `#{注解值}` 来引用参数。

## 5.2 基于注解的关联查询

MyBatis 提供了 `@Results`、`@Result`、`@One`、`@Many` 等注解来处理关联查询。

### 5.2.1 一对一查询 (`@One`)
**场景**：如“一个人对应一个身份证”。

**核心注解**：
*   `@Results`：代替 XML 中的 `<resultMap>`。
*   `@Result`：代替 XML 中的 `<result>` 或 `<id>`。
*   `@One`：用于指定一对一关联，相当于 XML 中的 `<association>`。

**配置示例** (在 `PersonMapper` 中查询 `Person` 及其关联的 `IdCard`)：
```java
public interface PersonMapper {
    @Select("select * from tb_person where id=#{id}")
    @Results({
        @Result(column = "card_id", property = "card", 
                one = @One(select = "com.itheima.dao.IdCardMapper.selectIdCardById"))
    })
    Person selectPersonById(int id);
}
```
> **解释**：
> *   `column="card_id"`：当前表（tb_person）中用于关联的外键列。
> *   `property="card"`：Person 类中要填充的属性名。
> *   `one=@One(select=...)`：指定调用哪个 Mapper 方法进行嵌套查询（这里调用 `IdCardMapper` 的方法）。

### 5.2.2 一对多查询 (`@Many`)
**场景**：如“一个用户对应多个订单”。

**核心注解**：
*   `@Many`：用于指定一对多关联，相当于 XML 中的 `<collection>`。

**配置示例** (在 `UsersMapper` 中查询 `Users` 及其关联的 `Orders` 列表)：
```java
public interface UsersMapper {
    @Select("select * from tb_user where id=#{id}")
    @Results({
        @Result(id = true, column = "id", property = "id"),
        @Result(column = "id", property = "ordersList",
                many = @Many(select = "com.itheima.dao.OrdersMapper.selectOrdersByUserId"))
    })
    Users selectUserById(int id);
}
```
> **解释**：
> *   这里使用用户的 `id` (column="id") 作为参数，传递给 `OrdersMapper` 的查询方法。
> *   `many=@Many` 表示结果是一个集合。

### 5.2.3 多对多查询
**场景**：如“订单”和“商品”。通常通过**中间表**拆分为两个一对多关系。

**实现思路**：
在查询主表（如订单表）时，通过 `@Many` 注解调用另一个 Mapper 方法。该被调用的 Mapper 方法内部通常需要编写嵌套子查询（SQL 中包含子 `select` 语句）来关联中间表和从表。

**配置示例** (在 `OrdersMapper` 中查询订单及关联商品)：
```java
public interface OrdersMapper {
    @Select("select * from tb_orders where id=#{id}")
    @Results({
        @Result(id = true, column = "id", property = "id"),
        @Result(column = "id", property = "productList", 
                many = @Many(select = "com.itheima.dao.ProductMapper.selectProductByOrdersId"))
    })
    Orders selectOrdersById(int id);
}
```

**被调用的 ProductMapper** (涉及中间表 `tb_ordersitem`)：
```java
public interface ProductMapper {
    @Select("select * from tb_product where id in (select product_id from tb_ordersitem where orders_id = #{id})")
    List<Product> selectProductByOrdersId(int orders_id);
}
```

## 5.3 案例：基于MyBatis注解的学生管理程序

本案例综合运用了上述注解，实现学生管理功能。

**数据模型**：
*   `c_class` (班级表)
*   `s_student` (学生表)
*   关系：班级与学生是一对多关系。

**功能实现**：
1.  **查询** (`@Select`)：查询 ID 为 2 的学生信息。
2.  **修改** (`@Update`)：修改学生信息。
3.  **一对多查询** (`@Many`)：查询二班（ID=2）及其所有学生信息。

**关键代码片段 (一对多查询)**：
在 `IClassMapper` 中：
```java
public interface IClassMapper {
    @Select("select * from c_class where id=#{id}")
    @Results({
        @Result(id = true, column = "id", property = "id"),
        @Result(column = "id", property = "studentList",
                many = @Many(select = "com.itheima.dao.IStudentMapper.selectStudentByCid"))
    })
    IClass selectClassById(int id);
}
```
在 `IStudentMapper` 中：
```java
@Select("select * from s_student where cid=#{id}")
List<IStudent> selectStudentByCid(int cid);
```