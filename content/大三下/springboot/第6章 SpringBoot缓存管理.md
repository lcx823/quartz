---
share: true
title: 第6章 SpringBoot缓存管理
created: 2026-03-22
source: Cherry Studio
tags:
---
![[./assets/第6章 SpringBoot缓存管理/第6章 SpringBoot缓存管理.png|第6章 SpringBoot缓存管理.png]]

# 第6章 SpringBoot缓存管理

## 6.1 Spring Boot 默认缓存管理

### Spring Boot 默认缓存体验
**定理1**: Spring Boot提供了对缓存的抽象，通过在启动类上添加`@EnableCaching`注解来开启缓存功能。在没有任何特定缓存提供者（如Redis, EhCache）的配置下，Spring Boot默认使用一个基于`ConcurrentHashMap`的简单内存缓存。

> 从初学者的角度来看，这就像给你的程序一个“短期记忆”。当你第一次请求某个数据时，程序会去数据库里辛苦地查找，然后把结果记在一张临时的“便签”（`ConcurrentHashMap`）上。下次你再要同样的数据，程序直接看一眼“便签”就告诉你了，速度飞快，也不用再去麻烦数据库。但这个“便签”是程序私有的，程序一重启，就全忘了。

**例题1**: 体验Spring Boot的默认缓存机制，对`CommentService`的查询方法进行缓存。
**解**:
**步骤1: 准备基础环境**
假设已经有一个配置好JPA、MySQL和Web依赖的Spring Boot项目，并包含`Comment`实体类、`CommentRepository`接口、`CommentService`业务类和`CommentController`访问层。`CommentService`中有一个`findById`方法：
```java
// CommentService.java
@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;

    public Comment findById(int comment_id) {
        Optional<Comment> optional = commentRepository.findById(comment_id);
        if(optional.isPresent()){
            return optional.get();
        }
        return null;
    }
    // ... 其他方法
}
```

**步骤2: 开启基于注解的缓存支持**
在项目的主启动类上添加`@EnableCaching`注解。
```java
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cache.annotation.EnableCaching;

@EnableCaching // 开启缓存功能
@SpringBootApplication
public class Chapter06Application {
    public static void main(String[] args) {
        SpringApplication.run(Chapter06Application.class, args);
    }
}
```

**步骤3: 使用`@Cacheable`注解对方法进行缓存管理**
在`CommentService`的`findById`方法上添加`@Cacheable`注解。
```java
// CommentService.java
import org.springframework.cache.annotation.Cacheable;

@Service
public class CommentService {
    // ...
    @Cacheable(cacheNames = "comment") // 对该方法的结果进行缓存
    public Comment findById(int comment_id) {
        System.out.println("Executing SQL to find comment with id: " + comment_id);
        Optional<Comment> optional = commentRepository.findById(comment_id);
        if(optional.isPresent()){
            return optional.get();
        }
        return null;
    }
}
```
* `cacheNames = "comment"`: 指定了缓存空间的名称。可以理解为给这本“便签”取了个名字叫`comment`。

**步骤4: 项目测试**
1. 启动项目，在浏览器中首次访问`http://localhost:8080/get/1`（假设该URL调用了`findById(1)`）。
2. 观察控制台，会打印出 "Executing SQL..." 和实际执行的SQL查询语句。
3. 再次刷新浏览器，或多次访问`http://localhost:8080/get/1`。
4. 观察控制台，"Executing SQL..." 和SQL语句将不会再出现。这证明方法体没有被执行，数据是直接从缓存中获取的。

## 6.2 Spring Boot 缓存注解介绍

### @EnableCaching
**定理1**: `@EnableCaching`是Spring框架提供的注解，用于在配置类上（通常是主启动类）开启Spring对缓存的注解驱动支持。它是使用所有缓存注解的前提。
> 这就是缓存功能的“总开关”。不打开这个开关，后面所有的缓存注解（`@Cacheable`, `@CachePut`等）都不会生效。

### @Cacheable
**定理2**: `@Cacheable`通常用于数据查询方法上。它的执行逻辑是：先在缓存中根据`key`查找，如果找到，则直接返回缓存的结果，方法体不会被执行；如果没找到，则执行方法体，并将方法的返回值存入缓存，然后返回。
> 这个注解的口号是“能走捷径就走捷径”。每次执行前，它都先去缓存里看看有没有现成的答案。有就直接拿来用，没有才去老老实实地干活，并且干完活会把答案记下来，方便下次偷懒。

**例题1**: `@Cacheable`注解有哪些常用属性？
**解**:
| 属性名 | 说明 |
| :--- | :--- |
| `value` / `cacheNames` | 指定缓存空间的名称（必填）。 |
| `key` | 指定缓存数据的key。支持SpEL表达式。默认是方法的参数值。 |
| `keyGenerator` | 自定义key的生成策略，与`key`属性二选一。 |
| `cacheManager` / `cacheResolver` | 指定使用的缓存管理器或解析器，用于多缓存源的场景。 |
| `condition` | 条件缓存。当SpEL表达式为`true`时，才进行缓存。 |
| `unless` | 否定缓存。当SpEL表达式为`true`时，**不**进行缓存。例如 `unless = "#result == null"` 表示如果方法返回null就不缓存。 |
| `sync` | 是否使用异步模式，默认为`false`。 |

### @CachePut
**定理3**: `@CachePut`通常用于数据更新方法上。它与`@Cacheable`不同，**总会**执行方法体，然后将方法的返回值更新到缓存中。
> 这个注解的口号是“更新必须同步”。它不管缓存里有没有旧数据，每次都先执行方法（比如更新数据库），然后把最新的结果强制写入缓存，确保缓存和数据库同步。

### @CacheEvict
**定理4**: `@CacheEvict`通常用于数据删除方法上。它的作用是清除缓存中的数据。
> 这个注解的口号是“过期作废”。当数据被删除时，用它来通知缓存：“这个数据已经没用了，赶紧把它从你的记忆里删掉！”

**例题2**: `@CacheEvict`注解有哪些特殊属性？
**解**:
1. **`allEntries`**: 布尔类型，默认为`false`。如果设为`true`，则会清除指定`cacheNames`下的所有缓存，而不仅仅是当前`key`对应的缓存。
2. **`beforeInvocation`**: 布尔类型，默认为`false`。表示清除缓存的操作是在方法执行之后（默认）还是之前执行。如果设为`true`，则在方法执行前就清除缓存，这样即使方法执行失败，缓存也能被清除。

### @Caching
**定理5**: `@Caching`是一个组合注解，允许在同一个方法上应用多个缓存操作，如同时使用`@Cacheable`和`@CachePut`。
> 这是一个“组合技”注解。当你需要在一个方法上执行复杂缓存逻辑时，比如“根据ID查询时缓存，同时根据返回结果的作者名也缓存一份”，就可以用`@Caching`把多个缓存注解捆绑在一起。

### @CacheConfig
**定理6**: `@CacheConfig`是一个类级别的注解，用于统一配置该类下所有缓存注解的公共属性，如`cacheNames`。
> 这是一个“批量设置”注解。如果你一个类里所有方法的缓存都存放在名为`"comment"`的缓存空间，你就可以在类上写一个`@CacheConfig(cacheNames = "comment")`，这样每个方法上的`@Cacheable`等注解就不用再重复写`cacheNames`了。

## 6.3 Spring Boot 整合Redis缓存实现

### 基于注解的Redis缓存实现
**定理1**: 当Spring Boot项目中同时存在`@EnableCaching`注解和`spring-boot-starter-data-redis`依赖时，Spring Boot的`RedisCacheConfiguration`自动配置会生效，将缓存的存储后端从默认的`ConcurrentHashMap`自动切换为Redis。
**定理2**: 存入Redis的对象必须是可序列化的。默认情况下，Spring Data Redis使用JDK的序列化机制，因此实体类必须实现`java.io.Serializable`接口。

> 这次我们不满足于程序私有的“便签”了，而是要用一个专业、共享、持久化的“中央知识库”——Redis。你只需要把Redis的依赖加进来，再配置一下连接地址，Spring Boot就会自动把所有缓存操作都指向Redis。但往Redis里存东西（特别是Java对象）需要先把它“打包”成字节流，所以你的对象类需要实现`Serializable`接口，告诉Java“我这个对象是可以被打包的”。

**例题1**: 将默认的内存缓存替换为Redis缓存。
**解**:
**步骤1: 添加Spring Data Redis依赖**
在`pom.xml`中加入：
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-redis</artifactId>
</dependency>
```

**步骤2: 配置Redis服务连接**
在`application.properties`中添加：
```properties
spring.redis.host=127.0.0.1
spring.redis.port=6379
# spring.redis.password=your_password (如果有密码)
```

**步骤3: 使用注解定制缓存管理**
在`CommentService`中使用注解。
```java
@Service
@CacheConfig(cacheNames = "comment") // 统一配置缓存空间名
public class CommentService {
    // ...
    @Cacheable(unless = "#result == null") // 查询：结果不为null时缓存
    public Comment findById(int comment_id) { ... }

    @CachePut(key = "#result.id") // 更新：根据返回结果的id作为key更新缓存
    public Comment updateComment(Comment comment) { ... }

    @CacheEvict // 删除：默认会使用参数 comment_id作为key删除缓存
    public void deleteComment(int comment_id) { ... }
}
```

**步骤4: 将缓存对象实现序列化**
修改`Comment`实体类，实现`Serializable`接口。
```java
@Entity(name = "t_comment")
public class Comment implements Serializable { // 实现序列化接口
    // ... 属性、get/set方法
}
```

**步骤5: 测试**
1. **查询**: 访问`/get/1`，首次执行SQL，后续不再执行。打开Redis客户端（如Redis Desktop Manager），会看到一个key（如`comment::1`），其value是一串二进制数据。
2. **更新**: 访问`/update/1/新作者`，控制台执行`UPDATE` SQL。再次查看Redis中的`comment::1`，其value已更新。
3. **删除**: 访问`/delete/1`，控制台执行`DELETE` SQL。查看Redis，`comment::1`这个key已经被删除了。

### 基于API的Redis缓存实现
**定理3**: 除了使用注解，开发者还可以直接注入`RedisTemplate`或`StringRedisTemplate`，通过其提供的API手动操作Redis缓存，这提供了更高的灵活性。此方式下，不需要`@EnableCaching`注解。

> 这是“手动挡”模式。注解是“自动挡”，省心但限制多。直接用`RedisTemplate`，就像开手动挡车，你可以完全控制何时读缓存、何时写缓存、缓存的key是什么、过期时间是多久等等。这对于复杂的业务逻辑非常有用。

**例题2**: 使用`RedisTemplate`手动实现`Comment`的缓存逻辑。
**解**:
**步骤1: 编写业务类 `ApiCommentService`**
```java
@Service
public class ApiCommentService {
    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate; // 注入RedisTemplate

    public Comment findById(int comment_id) {
        String key = "comment_" + comment_id;
        // 1. 先从Redis查询
        Comment comment = (Comment) redisTemplate.opsForValue().get(key);
        // 2. 如果缓存中没有
        if (comment == null) {
            // 从数据库查询
            comment = commentRepository.findById(comment_id).orElse(null);
            // 3. 如果数据库有，则放入缓存
            if (comment != null) {
                redisTemplate.opsForValue().set(key, comment);
            }
        }
        return comment;
    }

    public Comment updateComment(Comment comment) {
        // 更新数据库
        commentRepository.updateComment(comment.getAuthor(), comment.getId());
        // 更新Redis
        String key = "comment_" + comment.getId();
        redisTemplate.opsForValue().set(key, comment);
        return comment;
    }

    public void deleteComment(int comment_id) {
        // 删除数据库
        commentRepository.deleteById(comment_id);
        // 删除Redis
        String key = "comment_" + comment_id;
        redisTemplate.delete(key);
    }
}
```
**步骤2: 相关配置**
* 此方式**不需要**`@EnableCaching`注解。
* 仍然需要`spring-boot-starter-data-redis`依赖和Redis连接配置。
* `Comment`类仍然需要实现`Serializable`接口（因为默认序列化方式没变）。

## 6.4 自定义Redis缓存序列化机制

### 自定义RedisTemplate (用于API方式)
**定理1**: Spring Boot允许开发者通过自定义一个名为`redisTemplate`的`@Bean`来覆盖默认的`RedisTemplate`。通过这种方式，可以将其默认的JDK序列化器替换为更通用的`Jackson2JsonRedisSerializer`，从而实现对象以JSON格式存储在Redis中。

> 默认的JDK序列化方式就像是把你的Java对象打包成一个只有Java自己能看懂的“二进制包裹”，不直观也不通用。自定义`RedisTemplate`并换上JSON序列化器，就相当于规定以后打包都用“国际通用的JSON透明盒子”，存进去的数据清晰可读，其他语言写的程序也能轻松看懂。

**例题1**: 自定义一个使用JSON序列化的`RedisTemplate`。
**解**:
**步骤1: 创建Redis配置类 `RedisConfig`**
```java
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.Jackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory redisConnectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(redisConnectionFactory);

        // 使用Jackson2JsonRedisSerializer来序列化和反序列化redis的value值
        Jackson2JsonRedisSerializer<Object> serializer = new Jackson2JsonRedisSerializer<>(Object.class);
        serializer.setObjectMapper(new ObjectMapper()); // 可以自定义ObjectMapper

        // String的序列化
        StringRedisSerializer stringSerializer = new StringRedisSerializer();

        // key采用String的序列化方式
        template.setKeySerializer(stringSerializer);
        // hash的key也采用String的序列化方式
        template.setHashKeySerializer(stringSerializer);
        // value序列化方式采用jackson
        template.setValueSerializer(serializer);
        // hash的value序列化方式采用jackson
        template.setHashValueSerializer(serializer);
        template.afterPropertiesSet();
        
        return template;
    }
}
```
**步骤2: 效果测试**
* 此时，`Comment`类**不再需要**实现`Serializable`接口。
* 使用基于API的`ApiCommentService`访问数据。
* 在Redis客户端查看缓存，数据将以清晰的JSON格式存储。

### 自定义RedisCacheManager (用于注解方式)
**定理2**: 若要改变注解驱动的缓存（`@Cacheable`等）的序列化方式，需要覆盖默认的`CacheManager`。通过自定义一个名为`cacheManager`的`@Bean`，可以在其中配置`RedisCacheConfiguration`，指定Key和Value的序列化器为JSON格式。

> 这个操作是针对“自动挡”（注解）的。你是在告诉Spring的缓存管理系统：“以后你帮我自动处理缓存的时候，也请用那个‘JSON透明盒子’来打包，别再用默认的‘二进制包裹’了。”

**例题1**: 自定义一个使用JSON序列化的`CacheManager`。
**解**:
**步骤1: 在`RedisConfig`中添加`cacheManager`的Bean**
```java
// 在之前的RedisConfig类中添加
import org.springframework.cache.CacheManager;
import org.springframework.data.redis.cache.RedisCacheConfiguration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.serializer.RedisSerializationContext;
import java.time.Duration;

//...
@Bean
public CacheManager cacheManager(RedisConnectionFactory redisConnectionFactory) {
    // 创建JSON序列化器
    Jackson2JsonRedisSerializer<Object> jacksonSerializer = new Jackson2JsonRedisSerializer<>(Object.class);
    // 可选：配置ObjectMapper以支持非public字段和类型信息
    ObjectMapper om = new ObjectMapper();
    om.setVisibility(PropertyAccessor.ALL, JsonAutoDetect.Visibility.ANY);
    om.activateDefaultTyping(LaissezFaireSubTypeValidator.instance, ObjectMapper.DefaultTyping.NON_FINAL);
    jacksonSerializer.setObjectMapper(om);

    // 创建String序列化器
    RedisSerializer<String> stringSerializer = new StringRedisSerializer();

    // 配置序列化规则
    RedisCacheConfiguration config = RedisCacheConfiguration.defaultCacheConfig()
            // 设置缓存有效期为1天
            .entryTtl(Duration.ofDays(1))
            // Key使用String序列化
            .serializeKeysWith(RedisSerializationContext.SerializationPair.fromSerializer(stringSerializer))
            // Value使用JSON序列化
            .serializeValuesWith(RedisSerializationContext.SerializationPair.fromSerializer(jacksonSerializer))
            // 不缓存null值
            .disableCachingNullValues();

    // 构建RedisCacheManager
    return RedisCacheManager.builder(redisConnectionFactory)
            .cacheDefaults(config)
            .build();
}
```
**步骤2: 效果测试**
* 使用基于注解的`CommentService`访问数据。
* 在Redis客户端查看缓存，数据同样会以JSON格式存储。
