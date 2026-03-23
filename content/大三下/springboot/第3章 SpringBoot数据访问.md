---
share: true
title: 第3章 SpringBoot数据访问
created: 2026-03-22
source: Cherry Studio
tags:
---

![[./assets/第3章 SpringBoot数据访问/第3章 SpringBoot数据访问.png|第3章 SpringBoot数据访问.png]]
# 第3章 SpringBoot数据访问

## 3.1 Spring Boot 数据访问概述

### Spring Data 简介
**定理1**: Spring Boot默认通过整合Spring Data框架来统一处理数据访问层。Spring Data的核心思想是为不同类型的持久化存储（关系型数据库、NoSQL数据库等）提供一个一致的、基于Repository的编程模型，通过引入各种`xxxTemplate`和统一的`Repository`接口，极大地简化了数据访问层的代码。

> 从初学者的角度来看，如果你需要操作数据库，以前可能要为MySQL写一套代码，为Redis又写另一套完全不同的代码。Spring Data就像一个“万能翻译器”，它定义了一套标准的说话方式（`Repository`接口，比如`save()`, `findById()`）。你用这套标准方式去下命令，Spring Data会自动帮你翻译成对应数据库（MySQL, JPA, Redis, MongoDB）能听懂的语言。这让你的数据访问代码变得更统一、更简洁。

**定理2**: Spring Boot为常见的数据库提供了对应的依赖启动器（Starters），引入相应的starter即可快速集成。

**例题1**: 列举Spring Boot为JPA, MongoDB, Redis提供的常见数据库依赖启动器。
**解**:
Spring Boot提供的常见数据库依赖启动器包括：
- **JPA (关系型数据库)**: `spring-boot-starter-data-jpa`
 - 它捆绑了Spring Data JPA, Hibernate (默认的JPA实现)和JDBC。
- **MongoDB (文档数据库)**: `spring-boot-starter-data-mongodb`
 - 它捆绑了Spring Data MongoDB。
- **Redis (键值数据库)**: `spring-boot-starter-data-redis`
 - 它捆绑了Spring Data Redis和Lettuce (默认的客户端)。
- **Neo4j (图数据库)**: `spring-boot-starter-data-neo4j`
 - 它捆绑了Spring Data Neo4j。

## 3.2 Spring Boot 整合 MyBatis

### 基础环境搭建
**定理1**: 整合MyBatis前，必须完成基础环境的搭建，包括：准备数据库和表、创建Spring Boot项目并引入相关依赖、编写实体类、以及配置数据源信息。

> 这一步就像做饭前的准备工作。你得先有锅（数据库和表），准备好食材（项目依赖），把食材洗好切好（编写实体类），并接通煤气灶（配置数据库连接）。这些准备工作都做好了，才能开始真正的“炒菜”（编写Mapper进行增删改查）。

**例题1**: 阐述整合MyBatis的基础环境搭建步骤。
**解**:
**步骤1: 数据库和表准备**
在MySQL中创建数据库和表。
```sql
-- 创建数据库
CREATE DATABASE springbootdata;
USE springbootdata;

-- 创建文章表
CREATE TABLE `t_article` (
  `id` int(20) NOT NULL AUTO_INCREMENT COMMENT '文章id',
  `title` varchar(200) DEFAULT NULL COMMENT '文章标题',
  `content` longtext COMMENT '文章内容',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 创建评论表
CREATE TABLE `t_comment` (
  `id` int(20) NOT NULL AUTO_INCREMENT COMMENT '评论id',
  `content` longtext COMMENT '评论内容',
  `author` varchar(200) DEFAULT NULL COMMENT '评论作者',
  `a_id` int(20) DEFAULT NULL COMMENT '关联的文章id',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;

-- 插入示例数据...
```

**步骤2: 创建项目并引入依赖**
使用Spring Initializr创建项目，至少勾选`Spring Web`, `MySQL Driver`, `MyBatis Framework`。
`pom.xml`中会包含以下核心依赖：
```xml
<dependency>
    <groupId>org.mybatis.spring.boot</groupId>
    <artifactId>mybatis-spring-boot-starter</artifactId>
    <version>2.1.4</version> <!-- 版本号可能不同 -->
</dependency>
<dependency>
    <groupId>mysql</groupId>
    <artifactId>mysql-connector-java</artifactId>
    <scope>runtime</scope>
</dependency>
```

**步骤3: 编写实体类**
根据数据表创建对应的Java POJO类。
```java
// Comment.java
public class Comment {
    private Integer id;
    private String content;
    private String author;
    private Integer aId;
    // Getters and Setters...
}

// Article.java
public class Article {
    private Integer id;
    private String title;
    private String content;
    private List<Comment> commentList; // 用于一对多查询
    // Getters and Setters...
}
```

**步骤4: 编写配置文件**
在`application.properties`中配置数据库连接。
```properties
# 数据库连接配置
spring.datasource.url=jdbc:mysql://localhost:3306/springbootdata?serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```

**步骤5 (可选): 更换数据源**
Spring Boot默认使用HikariCP数据源。如需更换为Druid，需引入Druid的starter并指定类型。
1. 添加Druid依赖：
```xml
    <dependency>
        <groupId>com.alibaba</groupId>
        <artifactId>druid-spring-boot-starter</artifactId>
        <version>1.1.10</version>
    </dependency>
    ```
2.  在`application.properties`中指定数据源类型并配置其参数：
    ```properties
    spring.datasource.type=com.alibaba.druid.pool.DruidDataSource
    # 其他Druid特有配置
    spring.datasource.druid.initial-size=20
    spring.datasource.druid.min-idle=10
    spring.datasource.druid.max-active=100
    ```

### 使用注解方式整合MyBatis
**定理2**: MyBatis可以通过在Mapper接口的方法上直接使用SQL注解（如`@Select`, `@Insert`, `@Update`, `@Delete`）来执行SQL语句。Mapper接口本身需要使用`@Mapper`注解标记，以便被Spring Boot扫描并注册为Bean。

> 这种方式非常直观，适合编写简单的SQL。它就像是把SQL语句直接写在Java代码的“便签”上，一目了然。对于简单的增删改查，这是最快的方式。

**例题2**: 创建一个`CommentMapper`接口，使用注解方式实现对`t_comment`表的增删改查。
**解**:
**步骤1: 创建Mapper接口文件**
```java
import org.apache.ibatis.annotations.*;

@Mapper // 标记该接口为MyBatis的Mapper接口
public interface CommentMapper {

 @Select("SELECT * FROM t_comment WHERE id = #{id}")
 Comment findById(Integer id);

 @Insert("INSERT INTO t_comment(content, author, a_id) VALUES (#{content}, #{author}, #{aId})")
 int insertComment(Comment comment);

 @Update("UPDATE t_comment SET content = #{content} WHERE id = #{id}")
 int updateComment(Comment comment);

 @Delete("DELETE FROM t_comment WHERE id = #{id}")
 int deleteComment(Integer id);
}
```
**步骤2: 编写测试方法**
在测试类中注入`CommentMapper`并调用其方法。
```java
@Autowired
private CommentMapper commentMapper;

@Test
public void selectComment() {
 Comment comment = commentMapper.findById(1);
 System.out.println(comment);
 // 预期会打印出ID为1的评论信息
}
```

### 使用配置文件方式整合MyBatis
**定理3**: 对于复杂的SQL或者需要动态SQL的场景，通常使用XML映射文件来编写SQL。Mapper接口与XML文件通过`namespace`属性进行绑定。Spring Boot需要通过`mybatis.mapper-locations`属性配置来找到这些XML文件。

> 当SQL变得很长或者包含复杂的逻辑（比如if判断）时，注解方式会显得很臃肿。XML方式就像是把这些复杂的SQL语句整理到一个专门的“SQL秘籍”（XML文件）里，而Java接口只负责定义“招式名称”。这样能让Java代码保持整洁，SQL也更容易维护。

**例题3**: 创建一个`ArticleMapper`，使用XML配置文件方式实现一对多关联查询。
**解**:
**步骤1: 创建Mapper接口文件**
接口中只需定义方法，无需SQL注解。
```java
import org.apache.ibatis.annotations.Mapper;

@Mapper
public interface ArticleMapper {
 // 查询文章及其所有评论
 Article selectArticle(Integer id);
 // 动态更新文章
 int updateArticle(Article article);
}
```
**步骤2: 创建XML映射文件**
在`src/main/resources/mapper/`目录下创建`ArticleMapper.xml`。
```xml
<?xml version="1.0" encoding="UTF-8" ?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" "http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.itheima.mapper.ArticleMapper"> <!-- namespace绑定到Mapper接口 -->

 <!-- 定义复杂结果集映射 -->
 <resultMap id="articleWithComment" type="com.itheima.domain.Article">
 <id property="id" column="id" />
 <result property="title" column="title" />
 <result property="content" column="content" />
 <!-- collection用于处理一对多关系 -->
 <collection property="commentList" ofType="com.itheima.domain.Comment">
 <id property="id" column="c_id" />
 <result property="content" column="c_content" />
 <result property="author" column="author" />
 </collection>
 </resultMap>

 <select id="selectArticle" resultMap="articleWithComment">
 SELECT a.*, c.id as c_id, c.content as c_content, c.author
 FROM t_article a
 LEFT JOIN t_comment c ON a.id = c.a_id
 WHERE a.id = #{id}
 </select>

 <update id="updateArticle" parameterType="com.itheima.domain.Article">
 UPDATE t_article
 <set>
 <if test="title != null and title != ''">
 title = #{title},
 </if>
 <if test="content != null and content != ''">
 content = #{content}
 </if>
 </set>
 WHERE id = #{id}
 </update>
</mapper>
```
**步骤3: 在全局文件中配置**
在`application.properties`中告诉MyBatis去哪里找XML文件和实体类别名。
```properties
# 配置MyBatis的XML映射文件路径
mybatis.mapper-locations=classpath:mapper/*.xml
# 配置实体类别名，这样在XML中就可以直接使用类名而不是全限定名
mybatis.type-aliases-package=com.itheima.domain
```
**步骤4: 编写测试**
```java
@Autowired
private ArticleMapper articleMapper;

@Test
public void selectArticle() {
 Article article = articleMapper.selectArticle(1);
 System.out.println(article);
 // 预期会打印出ID为1的文章信息，以及其关联的评论列表
}
```

## 3.3 Spring Boot 整合JPA

### Spring Data JPA 介绍
**定理1**: Spring Data JPA是Spring Data项目下的一个模块，它在JPA规范（Java Persistence API）的基础上进行了再次封装，提供了强大的Repository抽象，极大地简化了基于JPA的数据访问层开发。它底层默认使用Hibernate作为JPA的实现。

> JPA是官方制定的一套“操作数据库的规范”（就像USB接口标准），而Hibernate是这套规范最著名的一个“实现”（就像一个金士顿U盘）。Spring Data JPA则是在这个规范之上，又加了一层“超级智能外壳”，让你通过非常简单的方式（比如定义接口）就能操作数据库，而不用去处理JPA和Hibernate底层的复杂API。

**定理2**: 使用Spring Data JPA主要包含两个核心步骤：1) 创建与数据表映射的ORM实体类（Entity），使用`@Entity`等注解。2) 编写Repository接口，该接口继承Spring Data JPA提供的`JpaRepository`或其他Repository接口。

**定理3**: Repository接口具有继承体系，功能逐级增强：`Repository` (标记接口) -> `CrudRepository` (提供CRUD方法) -> `PagingAndSortingRepository` (增加分页和排序) -> `JpaRepository` (增加JPA特有功能，如`flush`)。

**定理4**: Spring Data JPA定义查询有三种主要方式：
1.  **继承`JpaRepository`**：直接获得`save()`, `findById()`, `findAll()`, `deleteById()`等常用方法。
2.  **方法名派生查询**：根据特定规则编写接口方法名，Spring Data JPA会自动生成SQL。例如`findByAuthor(String author)`。
3.  **使用`@Query`注解**：在接口方法上使用`@Query`注解，手动编写JPQL（Java Persistence Query Language）或原生SQL语句。

**定理5**: 对于数据变更操作（修改、删除），如果使用`@Query`自定义，必须同时使用`@Modifying`注解标记，并且整个操作需要在一个事务中执行，因此方法或其所在的Service类通常需要`@Transactional`注解。

### 使用Spring Boot 整合 JPA
**定理6**: 整合JPA的完整流程包括添加`spring-boot-starter-data-jpa`依赖，配置数据源，编写`@Entity`实体类，编写继承`JpaRepository`的接口，并进行测试。

> 整合JPA就像是给你的项目装上了一套“自动化数据库操作插件”。你只需要做一些简单的配置和定义，之后大部分的增删改查工作，这个插件都能帮你自动完成。

**例题1**: 整合Spring Data JPA，实现对`t_comment`表的数据操作。
**解**:
**步骤1: 添加JPA依赖**
在`pom.xml`中添加Spring Data JPA启动器。
```xml
<dependency>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

**步骤2: 编写ORM实体类**
创建一个`Discuss`类映射到`t_comment`表。
```java
import javax.persistence.*;

@Entity(name = "t_comment") // 告诉JPA这是一个实体类，并映射到t_comment表
public class Discuss {
 @Id // 标记主键
 @GeneratedValue(strategy = GenerationType.IDENTITY) // 主键生成策略：自增
 private Integer id;

 private String content;

 private String author;

 @Column(name = "a_id") // 将字段aId映射到表的a_id列
 private Integer aId;

 // Getters and Setters...
}
```

**步骤3: 编写Repository接口**
创建`DiscussRepository`接口，继承`JpaRepository`。
```java
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

public interface DiscussRepository extends JpaRepository<Discuss, Integer> {

 // 1. 方法名派生查询
 List<Discuss> findByAuthorNotNull();

 // 2. 使用@Query编写JPQL分页查询
 @Query("SELECT c FROM t_comment c WHERE c.aId = ?1")
 List<Discuss> getDiscussPaged(Integer aId, Pageable pageable);

 // 3. 使用@Query编写原生SQL查询
 @Query(value = "SELECT * FROM t_comment WHERE a_id = ?1", nativeQuery = true)
 List<Discuss> getDiscussPaged2(Integer aId, Pageable pageable);

 // 4. 使用@Query进行更新操作
 @Transactional
 @Modifying
 @Query("UPDATE t_comment c SET c.author = ?1 WHERE c.id = ?2")
 int updateDiscuss(String author, Integer id);

 // 5. 使用@Query进行删除操作
 @Transactional
 @Modifying
 @Query("DELETE FROM t_comment c WHERE c.id = ?1")
 int deleteDiscuss(Integer id);
}
```
**步骤4: 编写单元测试**
```java
@Autowired
private DiscussRepository discussRepository;

@Test
public void jpaTest() {
 // 使用继承来的方法
 Optional<Discuss> optional = discussRepository.findById(1);
 optional.ifPresent(System.out::println);

 // 使用方法名派生查询
 List<Discuss> list = discussRepository.findByAuthorNotNull();
 System.out.println(list);

 // 使用@Query分页查询
 List<Discuss> pagedList = discussRepository.getDiscussPaged(1, PageRequest.of(0, 2));
 System.out.println(pagedList);
}
```

## 3.4 Spring Boot 整合Redis

### Redis 介绍
**定理1**: Redis是一个开源的、基于内存的高性能键值（key-value）存储系统。它可以用作数据库、缓存和消息中间件，支持多种数据结构，如字符串、哈希、列表、集合、有序集合等。

**定理2**: Redis的主要优点包括：
1.  **存取速度快**：数据存储在内存中，读写性能极高。
2.  **支持丰富的数据类型**：相比其他键值存储，提供了更复杂的数据结构。
3.  **操作具有原子性**：所有单个操作都是原子性的，保证了并发访问时的数据一致性。
4.  **多功能性**：除了作为缓存，还可用于消息队列、分布式锁、排行榜等多种场景。

> Redis就像一个超级大脑，它的记忆（数据）都在脑海里（内存），所以反应特别快（读写速度快）。这个大脑不仅能记简单的东西（字符串），还能记清单（列表）、人际关系网（集合）等复杂结构。每次操作都一气呵成（原子性），不会被中途打断。

### 使用Spring Boot 整合Redis
**定理3**: Spring Boot通过`spring-boot-starter-data-redis`和Spring Data Redis项目简化了Redis的集成。开发者可以通过定义`@RedisHash`注解的实体和继承`CrudRepository`的接口，以类似JPA的方式操作Redis。

> 整合Redis后，你操作Redis就像操作本地对象一样简单。你不用去记`HSET`, `LPUSH`这些Redis命令，只需要调用`repository.save(person)`这样的Java方法，Spring Data Redis就会自动帮你转换成对应的Redis命令去执行。

**例题1**: 整合Spring Boot与Redis，实现对一个`Person`对象的存储和查询。
**解**:
**步骤1: 添加Redis依赖**
在`pom.xml`中添加Redis启动器。
```xml
<dependency>
 <groupId>org.springframework.boot</groupId>
 <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

**步骤2: 在全局文件中配置Redis连接**
在`application.properties`中配置Redis服务器地址。
```properties
spring.redis.host=127.0.0.1
spring.redis.port=6379
# spring.redis.password=your_password (如果有密码)
```

**步骤3: 编写实体类**
创建要存储到Redis中的对象，并使用Spring Data Redis注解。
```java
// Address.java (嵌套对象)
public class Address {
 @Indexed private String city; // @Indexed创建二级索引，使其可被查询
 @Indexed private String country;
 // Getters and Setters...
}

// Person.java
@RedisHash("persons") // 指定该对象在Redis中存储的key的前缀 (persons:id)
public class Person {
 @Id private String id; // 标记主键
 @Indexed private String firstname;
 @Indexed private String lastname;
 private Address address; // 可以嵌套其他对象
 // Getters and Setters...
}
```
**步骤4: 编写Repository接口**
创建`PersonRepository`接口，继承`CrudRepository`。
```java
import org.springframework.data.repository.CrudRepository;
import java.util.List;

public interface PersonRepository extends CrudRepository<Person, String> {

 // Spring Data Redis同样支持方法名派生查询
 List<Person> findByLastname(String lastname);

 List<Person> findByFirstnameAndLastname(String firstname, String lastname);

 // 支持查询内嵌对象的属性
 List<Person> findByAddress_City(String city);
}
```

**步骤5: 编写测试方法**
```java
@Autowired
private PersonRepository personRepository;

@Test
public void redisTest() {
 // 创建并保存对象
 Person person = new Person();
 person.setFirstname("zhang");
 person.setLastname("san");
 Address address = new Address();
 address.setCity("北京");
 address.setCountry("中国");
 person.setAddress(address);
 personRepository.save(person);

 // 查询对象
 List<Person> list = personRepository.findByAddress_City("北京");
 System.out.println(list);

 // 清理
 personRepository.deleteAll();
}
```
